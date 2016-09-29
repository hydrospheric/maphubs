var proxy = require('express-http-proxy');
var debug = require('../services/debug')('proxy');

module.exports = function(app) {


  //if tiles requests make it to the web app, proxy them from here
  //needed for generating screenshots on local MapHubs Pro deployments
  app.use('/tiles', proxy(local.tileServiceInternal, {
  forwardPath: function(req, res) {
    var path = '/tiles' + require('url').parse(req.url).path;
    debug(path);
    return path;
  }
}));
};
