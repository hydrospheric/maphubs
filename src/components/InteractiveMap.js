var React = require('react');
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var Map = require('./Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var LayerList = require('./MapMaker/LayerList');
var MiniLegend = require('./Map/MiniLegend');
var MapStore = require('../stores/MapStore');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var MapActions = require('../actions/MapActions');
var ForestLossLegendHelper = require('./Map/ForestLossLegendHelper');
var MapLayerMenu = require('./InteractiveMap/MapLayerMenu');

var InteractiveMap = React.createClass({

  mixins:[StateMixin.connect(MapStore, {initWithProps: ['style', 'position', 'layers']}), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    map_id: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    style: React.PropTypes.object.isRequired,
    position: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    height: React.PropTypes.string,
    border: React.PropTypes.bool,
    showLogo: React.PropTypes.bool,
    disableScrollZoom: React.PropTypes.bool,
    showTitle: React.PropTypes.bool,
    categories: React.PropTypes.array,
    children: React.PropTypes.any
  },

  getDefaultProps(){
    return {
      height: '300px',
      border: false,
      disableScrollZoom: true,
      showLogo: true,
      showTitle: true
    };
  },

  componentDidMount() {
    $(this.refs.mapLayersPanel).sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });

  },

  componentDidUpdate(){
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  },

  toggleVisibility(layer_id){
    MapActions.toggleVisibility(layer_id, function(){});
  },

  onChangeBaseMap(basemap){
     MapActions.changeBaseMap(basemap);
  },

  onToggleForestLoss(enabled){
    var mapLayers = this.state.layers;
    var layers = ForestLossLegendHelper.getLegendLayers();
  
    if(enabled){
      //add layers to legend
       mapLayers = mapLayers.concat(layers);
    }else{
      var updatedLayers = [];
      //remove layers from legend
      mapLayers.forEach(mapLayer=>{
        var foundInLayers;
        layers.forEach(layer=>{
          if(mapLayer.id === layer.id){
            foundInLayers = true;
          }
        });
        if(!foundInLayers){
          updatedLayers.push(mapLayer);
        }
      });    
      mapLayers = updatedLayers;
    }
    MapActions.updateLayers(mapLayers, false);
  },

  render() {

    var border = 'none';
    if(this.props.border){
      border = '1px solid #212121';
    }

    var bounds = null;
    if(this.state.position){
      var bbox = this.state.position.bbox;
      bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
    }

    var children = '';
    if(this.props.children){
      children = this.props.children;
    }

    var title;
    if(this.props.showTitle && this.props.title){
      title = this.props.title;
    }

    var categoryMenu = '', height = '100%';
    if(this.props.categories){
      categoryMenu = (
        <MapLayerMenu categories={this.props.categories} 
        toggleVisibility={this.toggleVisibility}
        layers={this.state.layers} />
      );
      height = 'calc(100% - 50px)';
    }

    return (
      <div style={{width: '100%', height: this.props.height, overflow: 'hidden', border}}>
        <div className="row no-margin" style={{height: '100%'}}>
          <div className="col s12 no-padding" style={{height: '100%'}}>
                         
            <div className="side-nav" id="map-layers">
              <LayerList layers={this.state.layers}
                showDesign={false} showRemove={false} showVisibility={true}
                toggleVisibility={this.toggleVisibility}
                updateLayers={MapActions.updateLayers}
                />
            </div>
            {categoryMenu}
      
            <Map ref="map" id={'map-'+ this.state.map_id} fitBounds={bounds}
              style={{width: '100%', height}}
              glStyle={this.state.style}
              baseMap={this.state.basemap}
              onChangeBaseMap={this.onChangeBaseMap}
              onToggleForestLoss={this.onToggleForestLoss}
              showLogo={this.props.showLogo}
              disableScrollZoom={this.props.disableScrollZoom}>

              <MiniLegend style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  minWidth: '200px',
                  maxHeight: 'calc(100% - 80px)',
                  overflowY: 'auto',
                  zIndex: '1',
                  width: '20%'
                }} layers={this.state.layers} title={title} />
                {children}
            </Map>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = InteractiveMap;
