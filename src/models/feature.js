// @flow
var knex = require('../connection.js');
//var Promise = require('bluebird');
//var dbgeo = require('dbgeo');
//var log = require('../services/log.js');
//var debug = require('../services/debug')('model/features');
//var geojsonUtils = require('../services/geojson-utils');

module.exports = {


  getFeatureByID(mhid: string, layer_id: number) {
    var _this = this;
    return _this.getGeoJSON([mhid], layer_id)
      .then(function(geojson){
        var feature = {geojson};
        return _this.getFeatureNotes(mhid, layer_id)
        .then(function(notes){
          var result = {feature, notes};
          return result;
        });
    });
  },

  getFeatureNotes(mhid: string, layer_id: number){
    return knex('omh.feature_notes').select('notes')
    .where({mhid, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return result[0];
      }
      return null;
    });
  },

  saveFeatureNote(mhid: string, layer_id: number, user_id: number, notes: string){
    return knex('omh.feature_notes').select('mhid').where({mhid, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return knex('omh.feature_notes')
        .update({
          notes,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
        .where({mhid, layer_id});
      }else{
        return knex('omh.feature_notes')
        .insert({
          layer_id,
          mhid,
          notes,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
      }
    });
  },

  /**
   * Get GeoJSON for feature(s)
   * 
   * @param {Array<string>} mhid 
   * @param {number} layer_id 
   * @returns 
   */
    getGeoJSON(mhid: Array<string>, layer_id: number) {
      if(!Array.isArray(mhid)){
        mhid = [mhid];
      }

      var layerTable = 'layers.data_' + layer_id;  
      return knex.select(knex.raw(`ST_AsGeoJSON(wkb_geometry) as geom`), 'tags')
      .from(layerTable).whereIn('mhid', mhid)
          .then(function(data){
            return  knex.raw(`select 
            '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
            from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`)             
            .then(function(bbox) {

            var feature = {
              type: 'Feature',
              geometry: JSON.parse(data[0].geom),
              properties: data[0].tags
            };

            feature.properties.mhid = mhid;

            return {
              type: "FeatureCollection",
              features: [feature],
              bbox: JSON.parse(bbox.rows[0].bbox)
            };
          });
      });
    }

};
