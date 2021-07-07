import exportUtils from '../../services/export-utils'
import Layer from '../../models/layer'
import { apiError } from '../../services/error-response'
import manetCheck from '../../services/manet-check'
import local from '../../local'

export default (app: any) => {
  app.get('/api/lyr/:shortid/export/json/*', async (req, res) => {
    try {
      const shortid = req.params.shortid
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const isShared = await Layer.isSharedInPublicMap(shortid)
      const layer = await Layer.getLayerByShortID(shortid)

      if (
        !local.requireLogin || // login not required
        isShared || // in public shared map
        manetCheck.check(req) || // screenshot service
        user_id > 0 // logged in
      ) {
        const geoJSON = await Layer.getGeoJSON(layer.layer_id)
        res.status(200).send(geoJSON)
      } else {
        res.status(404).send()
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
        return isShared || // in public shared map
          manetCheck.check(req) || // screenshot service
          (user_id > 0 && (await privateLayerCheck(layer.layer_id, user_id)))
          ? exportUtils.completeGeoBufExport(req, res, layer.layer_id)
          : res.status(404).send()
      } else {
        return exportUtils.completeGeoBufExport(req, res, layer.layer_id)
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
}
