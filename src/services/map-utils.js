// @flow
var Promise = require('bluebird');
var Map = require('../models/map');
var nextError = require('./error-response').nextError;
var urlUtil = require('../services/url-util');
var debug = require('./debug')('map-utils');

module.exports = {
  completeEmbedMapRequest(req: any, res: any, next: any, map_id: number, isStatic: boolean, canEdit: boolean){
    Promise.all([
    Map.getMap(map_id),
    Map.getMapLayers(map_id, canEdit)
    ])
    .then(function(results){
      var map = results[0];
      var layers = results[1];
      var title = 'Map';
      if(map.title){
        title = map.title;
      }
      title += ' - ' + MAPHUBS_CONFIG.productName;
        res.render('embedmap', {
          title,
          props:{map, layers, canEdit, isStatic},
          hideFeedback: true, req});
    }).catch(nextError(next));
  },

  completeUserMapRequest(req: any, res: any, next: any, map_id: number, canEdit: boolean){
    debug('completeUserMapRequest');
    return Promise.all([
    Map.getMap(map_id),
    Map.getMapLayers(map_id, canEdit)
    ])
    .then(function(results){
      var map = results[0];
      var layers = results[1];
      var title = 'Map';
      if(map.title){
        title = map.title;
      }
      title += ' - ' + MAPHUBS_CONFIG.productName;
      var baseUrl = urlUtil.getBaseUrl();
        res.render('usermap',
         {
           title,
           props:{map, layers, canEdit},
           hideFeedback: true,
           addthis: true,
           oembed: 'map',
           twitterCard: {
             title,
             description: req.__('View interactive map on ') + MAPHUBS_CONFIG.productName,
             image: baseUrl + '/api/screenshot/map/' + map.map_id + '.png',
             imageWidth: 1200,
             imageHeight: 630,
             imageType: 'image/png'
           },
           req
         }
       );
    }).catch(nextError(next));
  }
};
