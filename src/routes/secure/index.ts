module.exports = function (app: any) {
  require('./admin')(app)

  require('./groups-views')(app)

  require('./layer-metric-api')(app)

  require('./layers-replace')(app)

  require('./pages')(app)

  require('./stories-views')(app)

  require('./auth')(app)

  require('./home')(app)

  require('./layer-upload')(app)

  require('./layers-views')(app)

  require('./proxy')(app)

  require('./user')(app)

  require('./custom-errors')(app)

  require('./images')(app)

  require('./layers-api-public')(app)

  require('./map-api-public')(app)

  require('./screenshots')(app)

  require('./exports')(app)

  require('./layers-api')(app)

  require('./map-api')(app)

  require('./features')(app)

  require('./isochrone-service')(app)

  require('./layers-import')(app)

  require('./map-views')(app)

  require('./search')(app)

  require('./groups-api')(app)

  require('./layer-data')(app)

  require('./layers-remote')(app)

  require('./oembed')(app)

  require('./stories-api')(app)
}