import Reflux from 'reflux';
import Actions from '../actions/MapMakerActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/MapMakerStore');
var _findIndex = require('lodash.findindex');
var _reject = require('lodash.reject');
var _find = require('lodash.find');
var _forEachRight = require('lodash.foreachright');
//var $ = require('jquery');
//var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;
import type {Layer} from './layer-store';

export type MapMakerStoreState = {
   map_id: number,
  title: string,
  mapLayers: Array<Layer>,
  mapStyle: ?Object,
  position: ?Object,
  isPrivate: boolean,
  owned_by_group_id: string,
  basemap: string,
  editingLayer: boolean
}

export default class MapMakerStore extends Reflux.Store<void, void, MapMakerStoreState>  {

  state: MapMakerStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): MapMakerStoreState{
    return {
      map_id: -1,
      title: null,
      mapLayers: [],
      mapStyle: null,
      position: null,
      isPrivate: false,
      owned_by_group_id: null,
      basemap: 'default',
      editingLayer: false
    };
  }

  reset(){
    this.setState(this.getDefaultState());
    this.updateMap(this.state.mapLayers);
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners

  setMapLayers(mapLayers, update=true){
    this.setState({mapLayers});
    if(update){
      this.updateMap(mapLayers);
    } 
  }

  setMapId(map_id){
    this.setState({map_id});
  }

  setMapTitle(title){
    title = title.trim();
    this.setState({title});
  }

  setPrivate(isPrivate){
    this.setState({isPrivate});
  }

  setOwnedByGroupId(group_id){
    this.setState({owned_by_group_id: group_id});
  }

  setMapPosition(position){
    this.setState({position});
  }

  setMapBasemap(basemap){
    this.setState({basemap});
  }

  addToMap(layer, cb){
    //check if the map already has this layer
    if(_find(this.state.mapLayers, {layer_id: layer.layer_id})){
      cb(true);
    }else{
      if(!layer.settings){
        layer.settings = {};
      }
      layer.settings.active = true; //tell the map to make this layer visible
      var layers = this.state.mapLayers;
      layers.push(layer);
      this.updateMap(layers);
      cb();
    }
  }

  removeFromMap(layer){
    var layers = _reject(this.state.mapLayers, {'layer_id': layer.layer_id});
    this.updateMap(layers);
  }

  toggleVisibility(layer_id, cb){
    var mapLayers = this.state.mapLayers;
    var index = _findIndex(mapLayers, {layer_id});

    if(mapLayers[index].settings.active){
      mapLayers[index].settings.active = false;
    }else {
      mapLayers[index].settings.active = true;
    }

    this.updateMap(mapLayers);
    cb();
  }

  updateLayerStyle(layer_id, style, labels, legend, settings){
    var index = _findIndex(this.state.mapLayers, {layer_id});
    var layers = this.state.mapLayers;
    layers[index].style = style;
    layers[index].labels = labels;
    layers[index].legend_html = legend;
    layers[index].settings = settings;
    this.updateMap(layers);
    this.setState({mapLayers: layers});
  }

  saveMap(title, position, basemap, _csrf, cb){
    var _this = this;
    //resave an existing map
    title = title.trim();
    request.post('/api/map/save')
    .type('json').accept('json')
    .send({
        map_id: this.state.map_id,
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        title: title,
        position,
        basemap,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({title, position, basemap});
        cb();
      });
    });
  }

  createMap(title, position, basemap, group_id, isPrivate, _csrf, cb){
    var _this = this;
    title = title.trim();
    request.post('/api/map/create')
    .type('json').accept('json')
    .send({
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        title,
        group_id,
        position,
        basemap,
        private: isPrivate,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        var map_id = res.body.map_id;
        _this.setState({title, map_id, position, basemap, owned_by_group_id: group_id, isPrivate});
        cb();
      });
    });
  }

  savePrivate(isPrivate, _csrf, cb){
    var _this = this;
    request.post('/api/map/privacy')
    .type('json').accept('json')
    .send({
        map_id: this.state.map_id,
        private: isPrivate,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({isPrivate});
        cb();
      });
    });
  }

  //helpers
  updateMap(mapLayers, rebuild=true){
    var mapStyle;
    if(rebuild){
      mapStyle = this.buildMapStyle(mapLayers);
    }else{
       mapStyle = this.state.mapStyle;
    }
    this.setState({mapLayers, mapStyle});
  }

   buildMapStyle(layers){
     var mapStyle = {
       sources: {},
       layers: []
     };

     //reverse the order for the styles, since the map draws them in the order recieved
     _forEachRight(layers, (layer) => {
       var style = layer.style;
       if(style && style.sources && style.layers){
         //check for active flag and update visibility in style
         if(typeof layer.settings.active === 'undefined'){
           //default to on if no state provided
           layer.settings.active = true;
         }
         if(!layer.settings.active){
           //hide style layers for this layer
           style.layers.forEach((styleLayer) => {
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'none';
           });
         } else {
           //reset all the style layers to visible
           style.layers.forEach((styleLayer) => {
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'visible';
           });
         }
         //add source
         mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
         //add layers
         mapStyle.layers = mapStyle.layers.concat(style.layers);
       } else {
         debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
       }

     });

     return mapStyle;
   }

   startEditing(){
    this.setState({editingLayer: true});
   }

   stopEditing(){
    this.setState({editingLayer: false});
   }

   deleteMap(map_id, _csrf, cb){
     request.post('/api/map/delete')
     .type('json').accept('json')
     .send({map_id, _csrf})
     .end((err, res) => {
       checkClientError(res, err, cb, (cb) => {
         cb();
       });
     });
   }
}