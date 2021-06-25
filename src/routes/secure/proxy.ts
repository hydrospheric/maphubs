const proxy = require('express-http-proxy')

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'proxy'
)

const local = require('../../local')

module.exports = function (app: any) {
  // if tiles requests make it to the web app, proxy them from here
  // needed for generating screenshots on local MapHubs Pro deployments
  app.use(
    '/tiles',
    proxy(local.tileServiceInternalUrl, {
      proxyReqPathResolver(req) {
        const url = new URL(req.url)
        const path = '/tiles' + url.pathname
        debug.log(path)
        return path
      }
    })
  )
  app.use(
    '/screenshots/*',
    proxy(local.manetUrl, {
      proxyReqPathResolver(req) {
        const url = new URL(req.url)
        const path = url.pathname
        debug.log(path)
        return path
      }
    })
  )
}