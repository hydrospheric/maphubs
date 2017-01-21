// @flow
var knex = require('../connection.js');
var dbgeo = require('dbgeo');
var Promise = require('bluebird');
var log = require('../services/log.js');
var _find = require('lodash.find');
var Presets = require('./presets');
//var LayerViews = require('../services/layer-views');
var DataLoadUtils = require('../services/data-load-utils');
var Group = require('./group');
var Map = require('./map');
var Hub = require('./hub');
var debug = require('../services/debug')('model/layers');
var ScreenshotUtils = require('../services/screenshot-utils');
var geojsonUtils = require('../services/geojson-utils');
var PhotoAttachment = require('./photo-attachment');

module.exports = {

  /**
   * Can include private?: No
   */
  getAllLayers(includeMapInfo: boolean = false) {
    if(includeMapInfo){
      return knex.select('layer_id', 'name', 'description', 'data_type',
      'remote', 'remote_host', 'remote_layer_id',
      'status', 'source', 'license', 'presets',
      'is_external', 'external_layer_type', 'external_layer_config', 'disable_export',
      'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views',
      'style', 'legend_html','labels', 'settings', 'extent_bbox', 'preview_position')
      .table('omh.layers').where({private: false, status: 'published'}).orderBy('name');
    }else{
      return knex.select('layer_id', 'name', 'description', 'data_type',
      'remote', 'remote_host', 'remote_layer_id',
      'status', 'source', 'license', 'presets',
      'is_external', 'external_layer_type', 'external_layer_config', 'disable_export', 'owned_by_group_id',
      knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
      .table('omh.layers').where({private: false, status: 'published'}).orderBy('name');
    }

  },

  /**
   * Can include private?: No
   */
  getRecentLayers(number: number = 15){
    return knex.select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'source', 'license', 'presets',
    'is_external', 'external_layer_type', 'external_layer_config',
     'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .table('omh.layers')
    .where({private: false, status: 'published'})
    .orderBy('last_updated', 'desc')
    .limit(number);
  },

   /**
   * Can include private?: No
   */
  getPopularLayers(number: number = 15){
    return knex.select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'source', 'license', 'presets',
    'is_external', 'external_layer_type', 'external_layer_config',
    'style', 'legend_html','labels', 'settings','extent_bbox', 'preview_position',
     'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .table('omh.layers')
    .where({private: false, status: 'published'})
    .whereNotNull('views')
    .orderBy('views', 'desc')
    .limit(number);
  },

   /**
   * Can include private?: No
   */
  getFeaturedLayers(number: number = 15){
    return knex.select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'source', 'license', 'presets',
    'is_external', 'external_layer_type', 'external_layer_config',
     'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .table('omh.layers')
    .where({private: false, status: 'published', featured: true})
    .orderBy('name')
    .limit(number);
  },

  /**
   * Can include private?: If Requested
   */
  getLayerInfo(layer_id: number){
    return knex('omh.layers')
    .select('layer_id', 'name', 'description', 'owned_by_group_id', 'presets')
    .where({layer_id})
    .then(function(result){
      if (result && result.length == 1) {
        return result[0];
      }
      return null;
    });
  },

   /**
   * Can include private?: No
   */
  getSearchSuggestions(input: string) {
    input = input.toLowerCase();
    var query = knex.select('name', 'layer_id').table('omh.layers')
    .where(knex.raw(`
      private = false AND status = 'published'
      AND (
      to_tsvector('english', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('spanish', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('french', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('italian', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      )
      `))
    .orderBy('name');

    return query;
  },

   /**
   * Can include private?: No
   */
  getSearchResults(input: string) {
    input = input.toLowerCase();
    var query =  knex('omh.layers')
    .select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'source', 'license', 'presets', 'style', 'legend_html', 'labels', 'settings',
    'extent_bbox',
    'is_external', 'external_layer_type', 'external_layer_config', 'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .where(knex.raw(`
      private = false AND status = 'published'
      AND (
      to_tsvector('english', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('spanish', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('french', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      OR
      to_tsvector('italian', name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(source, '')) @@ plainto_tsquery('` + input + `')
      )
      `))    
    .orderBy('name');

    return query;
  },

   /**
   * Can include private?: If Requested
   */
  getGroupLayers(group_id: string, includePrivate: boolean = false): Bluebird$Promise<Array<Object>> {
    var query: knex = knex.select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'private', 'source', 'license', 'presets',
    'is_external', 'external_layer_type', 'external_layer_config', 'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .table('omh.layers').orderBy('name');

    if (includePrivate) {
      query.where('owned_by_group_id', group_id);
    } else {
      query.where({
        'private': false,
        status: 'published',
        'owned_by_group_id': group_id
      });
    }

    return query;
  },


  /**
   * Can include private?: If Requested
   */
  getLayerForPhotoAttachment(photo_id: number, trx: any=null){
    var _this = this;
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments').select('layer_id').where({photo_id})
    .then(function(results){
      if(results && results.length > 0 && results[0].layer_id){
        var layer_id = results[0].layer_id;
        return _this.getLayerByID(layer_id, trx);
      }else{
        throw new Error('Not a layer photo');
      }
    });
  },

  /**
   * Can include private?: If Requested
   */
  getUserLayers(user_id: number, number: number, includePrivate: boolean = false): Bluebird$Promise<Array<Object>> {

    var subquery = knex.select().distinct('group_id').from('omh.group_memberships').where({user_id});

    var query = knex.select('layer_id', 'name', 'description', 'data_type',
    'remote', 'remote_host', 'remote_layer_id',
    'status', 'private', 'source', 'license', 'presets',
    'style', 'legend_html','labels', 'settings','extent_bbox', 'preview_position',
    'is_external', 'external_layer_type', 'external_layer_config', 'owned_by_group_id', knex.raw('timezone(\'UTC\', last_updated) as last_updated'), 'views')
    .table('omh.layers')
    .whereIn('owned_by_group_id', subquery)
    .orderBy('last_updated', 'desc')
    .limit(number);

    if (!includePrivate) {
      query.where({private: false, status: 'published'});
    }

    return query;
  },

  /**
   * Can include private?: If Requested
   */
  getLayerByID(layer_id: number, trx: any = null) {
    debug('getting layer: ' + layer_id);
    let db = knex;
    if(trx){db = trx;}
    return db.select(
      'layer_id', 'name', 'description', 'data_type',
      'remote', 'remote_host', 'remote_layer_id',
      'status', 'private', 'source', 'license', 'presets',
      'is_external', 'external_layer_type', 'external_layer_config', 'disable_export', 'is_empty',
      'owned_by_group_id',
      knex.raw('timezone(\'UTC\', last_updated) as last_updated'),
      knex.raw('timezone(\'UTC\', creation_time) as creation_time'),
      'views',
      'style','labels', 'settings', 'legend_html', 'extent_bbox', 'preview_position', 'updated_by_user_id', 'created_by_user_id'
    ).table('omh.layers').where('layer_id', layer_id)
      .then(function(result) {
        if (result && result.length == 1) {
          return result[0];
        }
        //else
        return null;
      });
  },

  /**
   * Can include private?: If Requested
   */
  getHubLayers(hub_id: string, includePrivate: boolean, trx: knex.transtion = null) {
    let db = knex;
    if(trx){db = trx;}
    var query =  db.select(
    'omh.layers.layer_id', 'omh.layers.name', 'omh.layers.description', 'omh.layers.data_type',
    'omh.layers.remote', 'omh.layers.remote_host', 'omh.layers.remote_layer_id',
    'omh.layers.status', 'omh.layers.private', 'omh.layers.source', 'omh.layers.license', 'omh.layers.presets',
    'omh.layers.is_external', 'omh.layers.external_layer_type', 'omh.layers.external_layer_config',
    'omh.layers.owned_by_group_id', db.raw('timezone(\'UTC\', omh.layers.last_updated) as last_updated'), 'omh.layers.views',
    'omh.layers.style', 'omh.layers.labels', 'omh.layers.settings', 'omh.layers.legend_html', 'omh.layers.extent_bbox', 'omh.layers.preview_position',
     'omh.hub_layers.active', 'omh.hub_layers.position', 'omh.hub_layers.hub_id', 'omh.hub_layers.style as map_style', 'omh.hub_layers.labels as map_labels', 'omh.hub_layers.settings as map_settings', 'omh.hub_layers.legend_html as map_legend_html')
      .from('omh.hub_layers')
      .leftJoin('omh.layers', 'omh.hub_layers.layer_id', 'omh.layers.layer_id').orderBy('position');

    if (includePrivate) {
      query.where('omh.hub_layers.hub_id', hub_id);
    } else {
      query.where({
        'omh.layers.private': false,
        'omh.hub_layers.hub_id': hub_id
      });
    }

    return query;
  },

    /**
     * Can include private?: If Requested
     */
    getLayerNotes(layer_id: number){
      return knex('omh.layer_notes').select('notes')
      .where({layer_id})
      .then(function(result){
        if(result && result.length == 1){
          return result[0];
        }
        return null;
      });
    },

    getGeoJSON(layer_id: number) {
      return this.getLayerByID(layer_id)
      .then(function(layer){
        var layerView = '';
        switch(layer.data_type){
          case 'polygon':
            layerView = 'layers.polygons_' + layer_id;
            break;
          case 'line':
            layerView = 'layers.lines_' + layer_id;
            break;
          case 'point':
            layerView = 'layers.points_' + layer_id;
            break;
          default:
          layerView = 'layers.polygons_' + layer_id;
          break;
        }

      return Promise.all([
          knex.raw("select osm_id, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags from " + layerView),
          knex.raw("select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(geom) as bbox from (select ST_Transform(geom, 4326) as geom from " + layerView + ") a) b")
        ])
        .then(function(results) {
          var data = results[0];
          var bbox = results[1];
          return new Promise(function(fulfill, reject) {

            dbgeo.parse(data.rows,{
              "outputFormat": "geojson",
              "geometryColumn": "geom",
              "geometryType": "geojson"
            }, function(error, result) {
              if (error) {
                log.error(error);
                reject(error);
              }
              //convert tags to properties
              if(result.features){
                result.features = geojsonUtils.convertTagsToProps(result.features);
              }

              result.bbox = JSON.parse(bbox.rows[0].bbox);
              fulfill(result);
            });
          });

        });
      });
    },

    //Layer Security

  isPrivate(layer_id: number){
  return knex.select('private').from('omh.layers').where({layer_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0].private;
      }
      //else
      return true; //if we don't find the layer, assume it should be private
    });
  },

    /**
   * Can include private?: Yes
   */
  allowedToModify(layer_id: number, user_id: number, trx: knex.transtion=null): Bluebird$Promise<boolean>{
    if(!layer_id || user_id <= 0){
      return false;
    }
    return this.getLayerByID(layer_id, trx)
      .then(function(layer){
            if(layer){
             return Group.getGroupMembers(layer.owned_by_group_id)
            .then(function(users){
              if(_find(users, {id: user_id}) !== undefined){
                return true;
              }
              return false;
            });
          }else{
            return false;
          }
      });
    },

    //Layer creation/modification

    /**
   * Can include private?: Yes
   */
    createLayer(name: string, description: string, group_id: string, isPrivate: boolean, user_id: number){
      return knex('omh.layers').returning('layer_id')
        .insert({
          name, description,
          owned_by_group_id: group_id,
            private: isPrivate,
            status: 'incomplete',
            created_by_user_id: user_id,
            creation_time: knex.raw('now()'),
            updated_by_user_id: user_id,
            extent_bbox: '[-175,-85,175,85]', //needs to be slightly less than global otherwise mapbox gl gets confused
            last_updated: knex.raw('now()')
        });
    },

    /**
     * Can include private?:Yes, however the remote layer must be public
     */
    //TODO: implement private remote layers
    createRemoteLayer(group_id: string, layer: any, host: string, user_id: number){

      layer.remote = true;
      layer.remote_host = host;
      layer.remote_layer_id = layer.layer_id;
      delete layer.layer_id;
      layer.owned_by_group_id = group_id;
      layer.created_by_user_id = user_id,
      layer.updated_by_user_id = user_id;
      layer.last_updated = knex.raw('now()');

      //stringify objects before inserting
      layer.presets = JSON.stringify(layer.presets);
      layer.style = JSON.stringify(layer.style);
      layer.external_layer_config = JSON.stringify(layer.external_layer_config);
      layer.labels = JSON.stringify(layer.labels);
      if(layer.settings){
        layer.settings = JSON.stringify(layer.settings);
      }
      layer.extent_bbox = JSON.stringify(layer.extent_bbox);
      layer.preview_position = JSON.stringify(layer.preview_position);

      return knex('omh.layers').returning('layer_id')
        .insert(layer);
    },

    /**
     * Can include private?:Yes, however the remote layer must be public
     */
    updateRemoteLayer(layer_id: number, group_id: string, layer: Object, host: string, user_id: number){

      layer.remote = true;
      layer.remote_host = host;
      layer.remote_layer_id = layer.layer_id;
      delete layer.layer_id;
      layer.owned_by_group_id = group_id;
      layer.created_by_user_id = user_id,
      layer.updated_by_user_id = user_id;
      layer.last_updated = knex.raw('now()');

      //stringify objects before inserting
      layer.presets = JSON.stringify(layer.presets);
      layer.style = JSON.stringify(layer.style);
      layer.external_layer_config = JSON.stringify(layer.external_layer_config);
      layer.labels = JSON.stringify(layer.labels);
      if(layer.settings){
        layer.settings = JSON.stringify(layer.settings);
      }
      layer.extent_bbox = JSON.stringify(layer.extent_bbox);
      layer.preview_position = JSON.stringify(layer.preview_position);

      return knex('omh.layers').where({layer_id})
        .update(layer);
    },

    /*
    Used by delete
    */
    removeLayerFromMaps(layer_id: number, trx: any = null){
      //get maps that use this layer
      let db = knex;
      if(trx){db = trx;}
      return db.select('map_id').from('omh.map_layers').where({layer_id})
      .then(function(results){
        var mapLayerQuerys = [];
        results.forEach(function(result){
          //get layers for map
          var map_id = result.map_id;
          debug('removing layer: ' + layer_id + ' from map: '+ map_id);
          mapLayerQuerys.push(Map.getMapLayers(map_id, db));
        });
        return db('omh.map_layers').where({layer_id}).del()
        .then(function(){
          return Promise.all(mapLayerQuerys)
          .then(function(results){
            var saveMapStyleCommands = [];
            results.forEach(function(result){
              //rebuild map style, excluding the removed layer
              var layers = result;
              var map_id = result[0].map_id;
              var style = Map.buildMapStyle(layers);
              saveMapStyleCommands.push(db('omh.maps').where({map_id}).update({style, screenshot: null, thumbnail: null}));
            });
            return Promise.all(saveMapStyleCommands)
            .then(function(result){
              //TODO: notify map owners that a layer has been removed

                return result;
            });
          });
        });
      });
    },

    removeLayerFromHubs(layer_id: number, trx: knex.transtion = null){
      var _this = this;
      let db = knex;
      if(trx){db = trx;}
      //get hubs that use this layer
      return db.select('hub_id').from('omh.hub_layers').where({layer_id})
      .then(function(results){
        var hubLayerQuerys = [];
        results.forEach(function(result){
          //get layers for hub
          var hub_id = result.hub_id;
          debug('removing layer: ' + layer_id + ' from hub: '+ hub_id);
          hubLayerQuerys.push(_this.getHubLayers(hub_id, true, db));
        });
        return db('omh.hub_layers').where({layer_id}).del()
        .then(function(){
          return Promise.all(hubLayerQuerys)
          .then(function(results){
            var saveHubStyleCommands = [];
            results.forEach(function(result){
              //rebuild map style, excluding the removed layer
              var layers = result;
              var hub_id = result[0].hub_id;
              var map_style = Map.buildMapStyle(layers);
              saveHubStyleCommands.push(db('omh.hubs').where({hub_id}).update({map_style}));
            });
            return Promise.all(saveHubStyleCommands)
            .then(function(result){
              //TODO: notify hub owners that a layer has been removed
                return result;
            });
          });
        });
      });
    },

    setComplete(layer_id: number){
      return knex('omh.layers').update({status: 'published'}).where({layer_id});
    },

    transferLayerToGroup(layer_id: number, group_id: string, user_id: number){
     return knex('omh.layers')
      .update({
        owned_by_group_id: group_id,
        updated_by_user_id: user_id,
        last_updated: knex.raw('now()')
      })
      .where({layer_id});
  },

    delete(layer_id: number){
      var _this = this;
      return knex.transaction(function(trx) {
        var commands = [
          DataLoadUtils.removeLayerData(layer_id, trx),
          trx('omh.layer_views').where({layer_id}).del(),
          _this.removeLayerFromMaps(layer_id, trx),
          _this.removeLayerFromHubs(layer_id, trx),
          trx('omh.layer_notes').where({layer_id}).del(),
          PhotoAttachment.removeAllLayerAttachments(layer_id, trx),
          trx('omh.layers').where({layer_id}).del()
        ];

        return Promise.each(commands, function(command){
          return command;
        }).then(function(){
          //TODO: notify group owners that a layer has been removed
          //TODO: notify hub owners that a layer has been removed
          //TODO: notify map owners that a layer has been removed
          return true;
        })
        .catch(function (err) {
          debug(err);
          throw err;
        });
    });

    },

    removePrivateLayerFromMaps(layer: Object, trx: any){
      let db = knex;
      if(trx){db = trx;}
      var layer_id = layer.layer_id;
      return db.select('map_id').from('omh.map_layers').where({layer_id})
      .then(function(mapLayers){
        if(mapLayers && mapLayers.length > 0){
          mapLayers.forEach(function(mapLayer){
            return Map.getMap(mapLayer.map_id, trx).then(function(map){
              if(!map.private || map.owned_by_group_id !== layer.owned_by_group_id){
                //delete layer from this map
                  return db('omh.map_layers').where({layer_id}).del()
                  .then(function(){
                    return Map.getMapLayers(map.map_id, trx)
                    .then(function(layers){                    
                      var style = Map.buildMapStyle(layers);
                      return db('omh.maps').where({map_id: map.map_id}).update({style, screenshot: null, thumbnail: null});
                    });
                  });
              }
            });
          });
        }
      });

    },

    removePrivateLayerFromHubs(layer: Object, trx: any){
      var _this = this;
      let db = knex;
      if(trx){db = trx;}
      var layer_id = layer.layer_id;
      //remove layer hubs that are not also private or not part of the same group
      return db.select('hub_id').from('omh.hub_layers').where({layer_id})
        .then(function(hubLayers){
          if(hubLayers && hubLayers.length > 0){
            hubLayers.forEach(function(hubLayer){
              return Hub.getHubByID(hubLayer.hub_id, trx).then(function(hub){
                if(!hub.private || hub.owned_by_group_id !== layer.owned_by_group_id){
                  //delete layer from this hub
                  return db('omh.hub_layers').where({layer_id}).del()
                  .then(function(){
                    return _this.getHubLayers(hub.hub_id, true, trx)
                    .then(function(layers){
                      var map_style = Map.buildMapStyle(layers);
                      return db('omh.hubs').where({hub_id: hub.hub_id}).update({map_style});
                    });
                  });
                }
              });
            });
          }
      });
    },

    saveSettings(layer_id: number, name: string, description: string, group_id: string, isPrivate: boolean, user_id: number) {
      var _this = this;
      return knex.transaction(function(trx) {
        return _this.getLayerByID(layer_id, trx)
        .then(function(layer){

          var update =  trx('omh.layers')
            .update({
              name, description,
                private: isPrivate,
                updated_by_user_id: user_id,
                last_updated: knex.raw('now()')
            }).where({layer_id});

          if(group_id !== layer.owned_by_group_id){
            //TODO: support transfering layer ownership
            log.warn('transfering layer ownership not implemented: ' + layer_id);
          }

          if(!layer.private && isPrivate){
            //public layer is switching to private
            log.info('Public layer switching to private: ' + layer_id);
            return _this.removePrivateLayerFromMaps(layer_id, trx)
            .then(function(){
              return _this.removePrivateLayerFromHubs(layer, trx).then(function(){
                return update;
              });
            });
          }else{
            return update;
          }
        });
      });
    },

    setUpdated(layer_id: number, user_id: number, trx: any=null) {
      let db = knex;
      if(trx){db = trx;}
        return db('omh.layers')
          .update({
              updated_by_user_id: user_id,
              last_updated: db.raw('now()')
          }).where({layer_id});
    },

    saveDataSettings(layer_id: number, is_empty: boolean, empty_data_type: string, is_external: boolean, external_layer_type: string, external_layer_config: any, user_id: number){
      if(is_external){
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          is_external,
          external_layer_type,
          external_layer_config: JSON.stringify(external_layer_config),
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
        });
      }else{
        return knex('omh.layers').where({
            layer_id
          })
          .update({
            is_empty,
            data_type: empty_data_type,
            is_external,
            external_layer_type,
            external_layer_config: JSON.stringify(external_layer_config),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          });
      }
    },


    saveSource(layer_id: number, source: any, license: any, user_id: number) {
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          source,
          license,
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
        });
    },

    saveStyle(layer_id: number, style: any, labels: any, legend_html: any, settings: any, preview_position: any, user_id: number) {
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          style: JSON.stringify(style),
          labels: JSON.stringify(labels),
          settings: JSON.stringify(settings),
          legend_html,
          preview_position,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        }).then(function(){
          //update the thumbnail
          return ScreenshotUtils.reloadLayerThumbnail(layer_id)
          .then(function(){
            return ScreenshotUtils.reloadLayerImage(layer_id);
          });
        });
    },

    savePresets(layer_id: number, presets: any, user_id: number, create: boolean, trx: any) {
      return Presets.savePresets(layer_id, presets, user_id, create, trx);
    },



    saveLayerNote(layer_id: number, user_id: number, notes: string){
      return knex('omh.layer_notes').select('layer_id').where({layer_id})
      .then(function(result){
        if(result && result.length == 1){
          return knex('omh.layer_notes')
          .update({
            notes,
            updated_by: user_id,
            updated_at: knex.raw('now()')
          })
          .where({layer_id});
        }else{
          return knex('omh.layer_notes')
          .insert({
            layer_id,
            notes,
            created_by: user_id,
            created_at: knex.raw('now()'),
            updated_by: user_id,
            updated_at: knex.raw('now()')
          });
        }
      });
    }




};
