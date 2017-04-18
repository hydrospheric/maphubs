import React from 'react';
import PropTypes from 'prop-types';
var Actions = require('../../actions/map/BaseMapActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var EditBaseMapBox = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    gpxLink: PropTypes.string
  },


  getLinks(){
    var origHash = window.location.hash.replace('#', '');
      var hashParts = origHash.split('/');
      var zoom =  Math.round(hashParts[0]);
      var lon = hashParts[1];
      var lat = hashParts[2];
      var osmEditLink = 'https://www.openstreetmap.org/edit#map=' + zoom + '/' + lon + '/' + lat;
      var loggingRoadsEditLink = 'http://id.loggingroads.org/#map=' + zoom + '/' + lat + '/' + lon;
      if(this.props.gpxLink){
        osmEditLink += '&gpx=' + this.props.gpxLink;
        loggingRoadsEditLink +=  '&gpx=' + this.props.gpxLink;
      }
      return {
        osm: osmEditLink,
        loggingroads: loggingRoadsEditLink
      }
  },

  openOSM(){
    var links = this.getLinks();
    window.location = links.osm;
  },

  openLogginRoads(){
    var links = this.getLinks();
    window.location = links.loggingroads;
  },

  render(){

      return (
        <div style={{width: '100%', textAlign: 'center'}}>
          <p style={{padding: '5px'}}>Edit OpenStreetMap at this location</p>
          <ul className="collection with-header custom-scroll-bar" style={{margin: 0, width: '100%', overflow: 'auto'}}>
            <li className="collection-item" style={{paddingLeft: 0}}>
              <a className="btn" onClick={this.openOSM}>{this.__('OpenStreetMap')}</a>
            </li>
            <li className="collection-item" style={{paddingLeft: 0}}>
              <a className="btn" onClick={this.openLoggingRoads}>{this.__('LoggingRoads')}</a>
            </li>
          </ul>
      </div>
    ); 
  }
});

module.exports = EditBaseMapBox;