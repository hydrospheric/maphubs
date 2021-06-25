const exportUtils = require('../../services/export-utils')

const Layer = require('../../models/layer')

const apiError = require('../../services/error-response').apiError

const privateLayerCheck = require('../../services/private-layer-check').check

const manetCheck = require('../../services/manet-check')

const local = require('../../local')

module.exports = (app: any) => {
  app.get('/api/lyr/:shortid/export/json/*', async (req, res) => {
    try {
      const shortid = req.params.shortid
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const isShared = await Layer.isSharedInPublicMap(shortid)
      const layer = await Layer.getLayerByShortID(shortid)

      if (local.requireLogin) {
        if (
          isShared || // in public shared map
          manetCheck.check(req) || // screenshot service
          (user_id > 0 && (await privateLayerCheck(layer.layer_id, user_id))) // logged in and allowed to see this layer
        ) {
          const geoJSON = await Layer.getGeoJSON(layer.layer_id)
          res.status(200).send(geoJSON)
        } else {
          res.status(404).send()
        }
      } else {
        // only do the private layer check
        if (await privateLayerCheck(layer.layer_id, user_id)) {
          const geoJSON = await Layer.getGeoJSON(layer.layer_id)
          res.status(200).send(geoJSON)
        } else {
          res.status(404).send()
        }
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/lyr/:shortid/export/geobuf/*', async (req, res) => {
    const shortid = req.params.shortid
    let user_id = -1

    if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    try {
      const isShared = await Layer.isSharedInPublicMap(shortid)
      const layer = await Layer.getLayerByShortID(shortid)

      if (local.requireLogin) {
        if (
          isShared || // in public shared map
          manetCheck.check(req) || // screenshot service
          (user_id > 0 && (await privateLayerCheck(layer.layer_id, user_id))) // logged in and allowed to see this layer
        ) {
          return exportUtils.completeGeoBufExport(req, res, layer.layer_id)
        } else {
          return res.status(404).send()
        }
      } else {
        // only do the private layer check
        if (await privateLayerCheck(layer.layer_id, user_id)) {
          return exportUtils.completeGeoBufExport(req, res, layer.layer_id)
        } else {
          return res.status(404).send()
        }
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
}