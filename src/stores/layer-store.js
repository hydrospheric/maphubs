//@flow
import Reflux from 'reflux';
import Actions from '../actions/LayerActions';
var request = require('superagent');
var MapStyles = require('../components/Map/Styles');
var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;
var debug = require('../services/debug')('layer-store');
import _findIndex from 'lodash.findindex';
import _remove from 'lodash.remove';
import _differenceBy from 'lodash.differenceby';
import type {GLStyle} from '../types/mapbox-gl-style';
import type {MapHubsField} from '../types/maphubs-field';

import {OrderedSet} from "immutable";


export type Layer = {
  layer_id?: number,
  shortid?: string,
  name?: LocalizedString,
  description?: LocalizedString,
  source?: LocalizedString,  
  style?: ?GLStyle,
  labels?: Object,
  settings?: {
    active: boolean
  },
  preview_position?: Object,
  data_type?: string,
  legend_html?: ?string,
  license?: string,
  owned_by_group_id?: string,
  private?: boolean,
  is_external?: boolean,
  external_layer_type?: string,
  external_layer_config?: {
    type?: 'ags-mapserver-tiles' | 'multiraster' | 'raster' | 'mapbox-style' | 'vector' | 'ags-featureserver-query' | 'ags-mapserver-query',
    url?: string,
    layers?: Array<Object>
    },
  is_empty?: boolean,
  remote?: boolean,
  remote_host?: string,
  complete?: boolean
}



export type LayerStoreState =  {
  status?: string,
  tileServiceInitialized?: boolean,
  pendingChanges?: boolean,
  pendingPresetChanges?: boolean,
  presetIDSequence?: number,
  presets?: OrderedSet<MapHubsField>
} & Layer

let defaultState: LayerStoreState = {
    layer_id: -1,
    name: {en: '', fr: '', es: '', it: ''},
    description: {en: '', fr: '', es: '', it: ''},
    published: true,
    data_type: '',
    source: {en: '', fr: '', es: '', it: ''},
    license: 'none',
    preview_position: {
      zoom: 1,
      lat: 0,
      lng: 0,
      bbox: [[-180,-180],[180,180]]
    } ,
    style: null,
    legend_html: null,
    is_external: false,
    external_layer_type: '',
    external_layer_config: {},
    complete: false,
    private: false,
    tileServiceInitialized: false,
    pendingChanges: false,
    pendingPresetChanges: false,
    presetIDSequence: 1,
    presets: OrderedSet()
};

export default class LayerStore extends Reflux.Store<LayerStoreState> {

  state: LayerStoreState 

  constructor(){
    super();
    this.state = defaultState;
    this.listenables = Actions;
  }

  getSourceConfig(){
    var sourceConfig = {
      type: 'vector'
    };
    if(this.state.is_external){
      sourceConfig = this.state.external_layer_config;
    }
    return sourceConfig;
  }

  loadLayer(){
    var _this = this;
    if(!this.state.style){
      this.resetStyleGL();
    }
    if(!this.state.legend_html){
      this.resetLegendHTML();
    }
    let style = this.state.style;
    if(style){
      let firstSource = Object.keys(style.sources)[0];
      var presets = MapStyles.settings.getSourceSetting(style, firstSource, 'presets');

      if(presets && Array.isArray(presets)){
        presets.forEach((preset) => {
          if(_this.state.presetIDSequence){
             preset.id = _this.state.presetIDSequence++;
          }    
        });
        this.updatePresets(this.getImmPresets(presets));
      }
    }else{
      debug.log('Missing style');
    }  
  }

  updatePresets(presets: OrderedSet<MapHubsField>){
    let style = JSON.parse(JSON.stringify(this.state.style));
    if(style){
      Object.keys(style.sources).forEach(key =>{
        //our layers normally only have one source, but just in case...
        style = MapStyles.settings.setSourceSetting(style, key, 'presets', presets.toArray());
      });
      this.setState({style, presets});
    }else{
      debug.log('Missing style');
    }
  } 

  resetStyleGL(){
    var style = this.state.style ? JSON.parse(JSON.stringify(this.state.style)) : {"sources": {}};
    var layer_id = this.state.layer_id ? this.state.layer_id: -1;
    var isExternal = this.state.is_external;
    var elc = this.state.external_layer_config ? this.state.external_layer_config : {};

    var baseUrl = urlUtil.getBaseUrl();
    if(isExternal && this.state.external_layer_type === 'mapbox-map' && elc.url){
      style = MapStyles.raster.defaultRasterStyle(this.state.layer_id, elc.url);
    }else if(isExternal && elc.type === 'raster'){
      style = MapStyles.raster.defaultRasterStyle(layer_id, baseUrl + '/api/layer/' + layer_id.toString() +'/tile.json');
    }else if(isExternal && elc.type === 'multiraster' && elc.layers){
      style = MapStyles.raster.defaultMultiRasterStyle(layer_id, elc.layers);
    }else if(isExternal && elc.type === 'mapbox-style' && elc.mapboxid){
        style = MapStyles.style.getMapboxStyle(elc.mapboxid);
    }else if(isExternal && elc.type === 'ags-mapserver-tiles' && elc.url){
        style = MapStyles.raster.defaultRasterStyle(layer_id, elc.url + '?f=json', 'arcgisraster');
    }else if(isExternal && elc.type === 'geojson' && elc.data_type){
        style = MapStyles.style.defaultStyle(layer_id, this.state.shortid, this.getSourceConfig(), elc.data_type);
    }else if(style.sources.osm){
      alert('Unable to reset OSM layers');
      return;
    }else{
      style = MapStyles.style.defaultStyle(layer_id, this.state.shortid, this.getSourceConfig(), this.state.data_type);
    }
    this.setState({style});
  }

  resetLegendHTML(){
    var legend_html;
    var externalLayerConfig = this.state.external_layer_config;
    if(this.state.is_external
      && externalLayerConfig
      && (externalLayerConfig.type === 'raster'
          || externalLayerConfig.type === 'multiraster'
          || externalLayerConfig.type === 'ags-mapserver-tiles')){
      legend_html = MapStyles.legend.rasterLegend(this.state);
    }else if(this.state.is_external && externalLayerConfig && externalLayerConfig.type === 'mapbox-style'){
      legend_html = MapStyles.legend.rasterLegend(this.state);
    }else{
      legend_html = MapStyles.legend.defaultLegend(this.state);
    }
    this.setState({legend_html});
  }

  resetStyle(){
    this.resetStyleGL();
    this.resetLegendHTML();
  }

  initLayer(layer: Object){
    //treat as immutable and clone
    layer = JSON.parse(JSON.stringify(layer));
    if(!layer.style){
      layer.style = MapStyles.style.defaultStyle(layer.layer_id,  this.state.shortid, this.getSourceConfig(), layer.data_type);   
    }
    if(!layer.legend_html){
      layer.legend_html = MapStyles.legend.defaultLegend(layer);
    }else{
      this.resetLegendHTML();
    }
   
    if(!layer.preview_position){
      layer.preview_position = {
      zoom: 1,
      lat: 0,
      lng: 0,
      bbox: null
    }; 
    }  
    return layer;
  }

  /**
   * Create a layer
   * Note: not called in regular createLayer page since creation happens on the server
   * Used by create layer panel in Map Maker
   * @param {*} _csrf 
   * @param {*} cb 
   */
  createLayer(_csrf: string, cb: Function){
    var _this = this;
    request.post('/api/layer/admin/createLayer')
    .type('json').accept('json')
    .send({
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        const layer_id = res.body.layer_id;
        let layer = _this.state;
        layer.layer_id = layer_id;
        layer = _this.initLayer(layer);
        _this.setState(layer);
        cb();
      });
    });
  }

  saveSettings(data: Object, _csrf: string, initLayer: boolean, cb: Function){
    //treat as immutable and clone
    data = JSON.parse(JSON.stringify(data));
    var _this = this;
    request.post('/api/layer/admin/saveSettings')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      name: data.name,
      description: data.description,
      group_id: data.group,
      private: data.private,
      source: data.source,
      license: data.license,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {

        //if(initLayer){
        //  layer = _this.initLayer(layer);
        //}
        _this.setState({
          name: data.name,
          description: data.description,
          owned_by_group_id: data.group,
          private: data.private,
          source: data.source,
          license: data.license
        });
        cb();
      });
    });
  }

  saveDataSettings(data: Object, _csrf: string, cb: Function){
    debug.log("saveDataSettings");
    //treat as immutable and clone
    data = JSON.parse(JSON.stringify(data));
    var _this = this;
    request.post('/api/layer/admin/saveDataSettings')
    .type('json').accept('json')
    .send({
      layer_id: this.state.layer_id,
      is_empty: data.is_empty,
      empty_data_type: data.empty_data_type,
      is_external: data.is_external,
      external_layer_type: data.external_layer_type,
      external_layer_config: data.external_layer_config,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {       
        let data_type = _this.state.data_type;
        if(data.is_empty){
          data_type = data.empty_data_type;
        }
        _this.setState({
          is_external: data.is_external,
          external_layer_type: data.external_layer_type,
          external_layer_config: data.external_layer_config,
          is_empty: data.is_empty,
          data_type
        });
        cb();
      });
    });
  }



  setStyle(style: Object, labels: Object, legend_html: string, preview_position: Object, cb: Function){
    //treat as immutable and clone
    labels = JSON.parse(JSON.stringify(labels));
    preview_position = JSON.parse(JSON.stringify(preview_position));
    style = JSON.parse(JSON.stringify(style));
    this.setState({
      style,
      labels,
      legend_html,
      preview_position
    });
    this.trigger(this.state);
    if(cb) cb();
  }

  setDataType(data_type: string){
    this.setState({data_type});
  }

  setComplete(_csrf: string, cb: Function){
    var _this = this;
    const complete = true;
    request.post('/api/layer/admin/setComplete')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({complete});
        _this.trigger(_this.state);
        cb();
      });
    });
  }

  saveStyle(data: Object, _csrf: string, cb: Function){
    //treat as immutable and clone
    data = JSON.parse(JSON.stringify(data));
    var _this = this;
    request.post('/api/layer/admin/saveStyle')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      style: data.style,
      labels: data.labels,
      legend_html: data.legend_html,
      preview_position: data.preview_position,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({
          style: data.style,
          legend_html: data.legend_html,
          preview_position: data.preview_position
        });
        cb();
      });
    });
  }

  loadData(_csrf: string, cb: Function){
    debug.log("loadData");
    if(this.state.layer_id){
       var _this = this;
      request.post('/api/layer/create/savedata/' + this.state.layer_id)
      .type('json').accept('json').timeout(1200000)
      .set('csrf-token', _csrf)
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.trigger(_this.state);
          Actions.dataLoaded();
          cb();
        });
      });
    }
   
  }

  replaceData(_csrf: string, cb: Function){
    debug.log("replaceData");
    if(this.state.layer_id){
       var _this = this;
      request.post('/api/layer/data/replace')
      .type('json').accept('json').timeout(1200000)
      .send({
        layer_id: _this.state.layer_id,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.trigger(_this.state);
          cb();
        });
      });
    }
   
  }

  initEmptyLayer(_csrf: string, cb: Function){
    debug.log("initEmptyLayer");
    if(this.state.layer_id){
      var _this = this;
      request.post('/api/layer/create/empty/' + this.state.layer_id)
      .type('json').accept('json')
      .set('csrf-token', _csrf)
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.trigger(_this.state);
          Actions.dataLoaded();
          cb();
        });
      });
    }
  }

  finishUpload(requestedShapefile: string, _csrf: string, cb: Function){
    var _this = this;
    request.post('/api/layer/finishupload')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      requestedShapefile,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        cb(null, res.body);
      });
    });
  }

  deleteData(_csrf: string, cb: Function){
     if(this.state.layer_id){
      request.post('/api/layer/deletedata/' + this.state.layer_id)
      .type('json').accept('json')
      .set('csrf-token', _csrf)
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          cb();
        });
      });
     }
  }

  deleteLayer(_csrf: string, cb: Function){
    var _this = this;
    request.post('/api/layer/admin/delete')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        cb();
      });
    });
  }
  
  cancelLayer(_csrf: string, cb: Function){
    var _this = this;
    request.post('/api/layer/admin/delete')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({layer: defaultState});
        _this.trigger(_this.state);
        cb();
      });
    });
  }

  tileServiceInitialized(){
    this.setState({tileServiceInitialized: true});
  }

  //
  //preset methods


  loadDefaultPresets(){
    //called when setting up a new empty layer
    if(this.state.presetIDSequence){
      let presets: OrderedSet<MapHubsField> = OrderedSet.of(
        {tag: 'name', label: 'Name', type: 'text', isRequired: true, showOnMap: true, id: this.state.presetIDSequence++},
        {tag: 'description', label: 'Description', type: 'text', isRequired: false,  showOnMap: true, id: this.state.presetIDSequence++},
        {tag: 'source', label: 'Source', type: 'text', isRequired: true,  showOnMap: true, id: this.state.presetIDSequence++}
      ); 
      let layer = this.initLayer(this.state);
      layer.pendingPresetChanges = true;
      this.setState(layer);
      this.updatePresets(presets);
    }
  }

  setImportedTags(data: Object, initLayer: boolean){
    debug.log("setImportedTags");
    //treat as immutable and clone
    data = JSON.parse(JSON.stringify(data));
    var _this = this;

    //convert tags to presets
    let presets = OrderedSet(data.map((tag: string) => {
      let preset;
      if(_this.state.presetIDSequence){
        if(tag === 'mhid'){
          preset = {tag:'orig_mhid', label: 'orig_mhid', type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.state.presetIDSequence++};
        }else{
          preset = {tag, label: tag, type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.state.presetIDSequence++};
        }
      }
      return preset;
    }));
    if(initLayer){
      let layer = _this.initLayer(this.state);
      this.setState(layer);
    }
    this.setState({pendingPresetChanges: true});
    this.updatePresets(presets);
  }

  mergeNewPresetTags(data: Object){
    if(this.state.presets){
      let presets = this.state.presets.toArray();
      let idSeq = presets.length - 1;

      let importedPresets = data.map((tag: string) => {
        return {
          tag, 
          label: tag, 
          type: 'text', 
          isRequired: false, 
          showOnMap: true, 
          mapTo: tag,
          id: idSeq++};
      });
      
      let newPresets = _differenceBy(importedPresets, presets, 'tag');
      presets.concat(newPresets);

      this.updatePresets(this.getImmPresets(presets));
    }
  }

  submitPresets(create: boolean, _csrf: string, cb: Function){
    debug.log("submitPresets");
    var _this = this;
    if(this.state.presets){
      let presets = this.state.presets.toArray();
      request.post('/api/layer/presets/save')
      .type('json').accept('json')
      .send({
        layer_id: _this.state.layer_id,
        presets,
        create,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.setState({pendingPresetChanges: false});
          cb();
        });
      });
    }else{
      debug.error('missing presets');
      throw new Error('missing presets');
    }
    
  }

  deletePreset(id: number){
    if(this.state.presets){
      let presets = this.state.presets.toArray();
      debug.log("delete preset:"+ id);
      _remove(presets, {id});
      this.state.pendingPresetChanges = true;
      this.updatePresets(this.getImmPresets(presets));
    }
  }

  addPreset(){
      debug.log("adding new preset");
       let presets;
       if(this.state.presets){
         presets = this.state.presets;
       }else{
         presets = OrderedSet();
       }

      if(this.state.presetIDSequence){
        presets = presets.add({
          tag: '',
          label: '',
          type: 'text',
          isRequired: false,
          showOnMap: true,
          id: this.state.presetIDSequence++
        });
      }
    this.state.pendingPresetChanges = true;
    this.updatePresets(presets);
  }

 updatePreset(id: number, preset: MapHubsField){
   debug.log("update preset:" + id);
   if(this.state.presets){
   let presets = this.state.presets.toArray();
   var i = _findIndex(presets, {id});
   if(i >= 0){
      presets[i] = preset;
      this.state.pendingPresetChanges = true;
      this.updatePresets(this.getImmPresets(presets));
     }      
   }else{
     debug.log("Can't find preset with id: "+ id);
   }
 }

 getImmPresets(presets: Array<MapHubsField>): OrderedSet<MapHubsField> {
  let presetsImm: OrderedSet<MapHubsField> = OrderedSet(presets);
  return presetsImm;
 }

 movePresetUp(id: number){
   if(this.state.presets){
   let presets: Array<MapHubsField> = this.state.presets.toArray();
   var index = _findIndex(presets, {id});
   if(index === 0) return;
    presets = this.move(presets, index, index-1);
    this.state.pendingPresetChanges = true;

    this.updatePresets(this.getImmPresets(presets));
   }else{
    debug.log('Missing presets');
  }
 }

  movePresetDown(id: number){
    if(this.state.presets){
      let presets: Array<MapHubsField> = this.state.presets.toArray();
      let index = _findIndex(presets, {id});
      if(index === presets.length -1) return;
      presets = this.move(presets, index, index+1);
      this.state.pendingPresetChanges = true;
      this.updatePresets(this.getImmPresets(presets));
    }else{
      debug.log('Missing presets');
    }
 }

 move(array: Array<Object>, fromIndex: number, toIndex: number) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
    return array;
 }



}
