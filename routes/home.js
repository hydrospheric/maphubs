var Layer = require('../models/layer');
var Group = require('../models/group');
var Hub = require('../models/hub');
var Map = require('../models/map');
var Story = require('../models/story');
var Promise = require('bluebird');
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  app.get('/', function(req, res, next) {
    Promise.all([
      Layer.getFeaturedLayers(2),
      Group.getFeaturedGroups(2),
      Hub.getFeaturedHubs(2),
      Map.getFeaturedMaps(2),
      Story.getFeaturedStories(2),

      Layer.getPopularLayers(2),
      Group.getPopularGroups(2),
      Hub.getPopularHubs(2),
      Map.getPopularMaps(2),
      Story.getPopularStories(2),

      Layer.getRecentLayers(2),
      Group.getRecentGroups(2),
      Hub.getRecentHubs(2),
      Map.getRecentMaps(2),
      Story.getRecentStories(2)
    ]).then(function(results){
      var featuredLayers = results[0];
      var featuredGroups = results[1];
      var featuredHubs = results[2];
      var featuredMaps = results[3];
      var featuredStories = results[4];

      var popularLayers = results[5];
      var popularGroups = results[6];
      var popularHubs = results[7];
      var popularMaps = results[8];
      var popularStories = results[9];

      var recentLayers = results[10];
      var recentGroups = results[11];
      var recentHubs = results[12];
      var recentMaps = results[13];
      var recentStories = results[14];
      res.render('home', {
        title: 'MapHubs',
        mailchimp: true,
        props: {
          featuredLayers, featuredGroups, featuredHubs, featuredMaps, featuredStories,
          popularLayers, popularGroups, popularHubs, popularMaps, popularStories,
          recentLayers, recentGroups, recentHubs, recentMaps, recentStories
        }, req
      });
    }).catch(nextError(next));
  });

};
