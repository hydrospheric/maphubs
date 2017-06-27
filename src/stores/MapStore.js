//@flow
import Reflux from 'reflux';
import Actions from '../actions/MapActions';
var MapStyles = require('../components/Map/Styles');
var debug = require('../services/debug')('stores/map-store');
var findIndex = require('lodash.findindex');

import type {Layer} from './layer-store';

export type MapStoreState = {
  style: Object,
  position: Object,
  basemap: string,
  layers: Array<Layer>
}

export default class MapStore extends Reflux.Store {

  state: MapStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): MapStoreState{
    return {
      style: {},
      position: {},
      basemap: 'default',
      layers: []
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug.log('store updated');
  }

 toggleVisibility(layer_id: number, cb: Function){
    let mapLayers = this.state.layers;
    let index = findIndex(mapLayers, {layer_id});
    if(mapLayers){
      let layer = mapLayers[index];
      let active = MapStyles.settings.get(layer.style, 'active');

      if(active){
        layer.style = MapStyles.settings.set(layer.style, 'active', false);
        active = false;
      }else {
        layer.style = MapStyles.settings.set(layer.style, 'active', true);
        active = true;
      }

      if(layer && layer.style && layer.style.layers){
         layer.style.layers.forEach((styleLayer) => {
          if(!styleLayer.layout){
            styleLayer.layout = {};       
          }
          if(active){
            styleLayer.layout.visibility = 'visible';
          }else{
            styleLayer.layout.visibility = 'none';
          }
        });
      }
     
      this.updateMap(mapLayers);
    }
    cb();
  }

 updateLayers(layers: Array<Layer>, update: boolean=true){
   this.setState({layers});
   if(update){
    this.updateMap(layers);
   }  
 }

 updateMap(layers: Array<Layer>){
   //treat as immutable and clone
   layers = JSON.parse(JSON.stringify(layers));
   var style = this.buildMapStyle(layers);
   this.setState({layers, style});
 }

 changeBaseMap(basemap: string){
  this.setState({basemap});
 }

 buildMapStyle(layers: Array<Layer>){
  return MapStyles.style.buildMapStyle(layers);
 }

}