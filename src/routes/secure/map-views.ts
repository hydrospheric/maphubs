import Locales from '../../services/locales'
import User from '../../models/user'
import Map from '../../models/map'
import Layer from '../../models/layer'
import Group from '../../models/group'
import Stats from '../../models/stats'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import MapUtils from '../../services/map-utils'
import { nextError, apiDataError } from '../../services/error-response'
import csurf from 'csurf'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

const debug = DebugService('routes/map')

export default function (app: any) {
  const recordMapView = function (
    session: Record<string, any>,
    map_id: number,
    user_id: number,
    next: any
  ) {
    if (!session.mapviews) {
      session.mapviews = {}
    }

    if (!session.mapviews[map_id]) {
      session.mapviews[map_id] = 1
      Stats.addMapView(map_id, user_id).catch(nextError(next))
    } else {
      const views = session.mapviews[map_id]
      session.mapviews[map_id] = views + 1
    }

    session.views = (session.views || 0) + 1
  }

  app.get('/map/new', csrfProtection, async (req, res, next) => {
    try {
      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        const popularLayers = await Layer.getPopularLayers()
        return app.next.render(
          req,
          res,
          '/map',
          await pageOptions(req, {
            title: 'New Map ',
            props: {
              popularLayers,
              groups: await Group.getAllGroups()
            }
          })
        )
      } else {
        // get user id
        const user_id = req.session.user.maphubsUser.id
        const canAddPrivateLayers = true // TODO: adjust this based on group settings?

        const popularLayers = await Layer.getPopularLayers()
        await Layer.attachPermissionsToLayers(popularLayers, user_id)
        const myLayers = await Layer.getUserLayers(
          user_id,
          50,
          canAddPrivateLayers
        )
        await Layer.attachPermissionsToLayers(myLayers, user_id)
        const editLayerId = req.query.editlayer
        let editLayer

        if (editLayerId) {
          const allowed = await Layer.allowedToModify(editLayerId, user_id)

          if (allowed) {
            editLayer = await Layer.getLayerByID(editLayerId)

            if (editLayer) {
              editLayer.canEdit = true
            }
          }
        }

        return app.next.render(
          req,
          res,
          '/map',
          await pageOptions(req, {
            title: req.__('New Map'),
            props: {
              popularLayers,
              myLayers,
              editLayer,
              groups: await Group.getAllGroups()
            }
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/maps', csrfProtection, async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/maps',
        await pageOptions(req, {
          title: req.__('Maps') + ' - ' + local.productName,
          props: {
            featuredMaps: await Map.getFeaturedMaps(),
            recentMaps: await Map.getRecentMaps(),
            popularMaps: await Map.getPopularMaps()
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/maps/all', csrfProtection, async (req, res, next) => {
    try {
      const locale = req.locale ? req.locale : 'en'
      const maps = await Map.getAllMaps().orderByRaw(
        `lower((omh.maps.title -> '${locale}')::text)`
      )
      const groups = await Group.getAllGroups().orderByRaw(
        `lower((omh.groups.name -> '${locale}')::text)`
      )
      return app.next.render(
        req,
        res,
        '/allmaps',
        await pageOptions(req, {
          title: req.__('Maps') + ' - ' + local.productName,
          props: {
            maps,
            groups
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/user/:username/maps', csrfProtection, async (req, res, next) => {
    try {
      const username = req.params.username
      debug.log(username)

      if (!username) {
        apiDataError(res)
      }

      let myMaps = false

      const completeRequest = async function () {
        const user = await User.getUserByName(username)

        if (user) {
          const maps = await Map.getUserMaps(user.id)
          return app.next.render(
            req,
            res,
            '/usermaps',
            await pageOptions(req, {
              title: 'Maps - ' + username,
              props: {
                user,
                maps,
                myMaps
              }
            })
          )
        } else {
          return res.redirect('/notfound?path=' + req.path)
        }
      }

      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        completeRequest()
      } else {
        const user_id = req.session.user.maphubsUser.id
        const user = await User.getUser(user_id)

        // flag if requested user is logged in user
        if (user.display_name === username) {
          myMaps = true
        }

        completeRequest()
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/map/view/:map_id/*', csrfProtection, (req, res, next) => {
    const map_id = req.params.map_id

    if (!map_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    recordMapView(req.session, map_id, user_id, next)

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !req.session ||
      !req.session.user
    ) {
      MapUtils.completeMapRequest(app, req, res, next, map_id, false, false)
    } else {
      // get user id
      Map.allowedToModify(map_id, user_id)
        .then((allowed) => {
          return MapUtils.completeMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            allowed,
            false
          )
        })
        .catch(nextError(next))
    }
  })
  app.get('/map/view/:map_id', (req, res, next) => {
    const map_id = req.params.map_id
    res.redirect(`/map/view/${map_id}/`)
  })
  app.get('/map/edit/:map_id', csrfProtection, async (req, res, next) => {
    try {
      const map_id = req.params.map_id

      if (!map_id) {
        apiDataError(res)
      }

      let user_id = -1

      if (req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        // need to be logged in
        res.redirect('/unauthorized')
      } else {
        // get user id
        const allowed = await Map.allowedToModify(map_id, user_id)

        if (allowed) {
          const map = await Map.getMap(map_id)
          const layers = await Map.getMapLayers(map_id, true).then((layers) => {
            return Layer.attachPermissionsToLayers(layers, user_id)
          })
          const popularLayers = await Layer.getPopularLayers().then(
            (layers) => {
              return Layer.attachPermissionsToLayers(layers, user_id)
            }
          )
          const myLayers = await Layer.getUserLayers(user_id, 50, true).then(
            (layers) => {
              return Layer.attachPermissionsToLayers(layers, user_id)
            }
          )
          let title = 'Map'

          if (map && map.title) {
            title = Locales.getLocaleStringObject(req.locale, map.title)
          }

          return app.next.render(
            req,
            res,
            '/mapedit',
            await pageOptions(req, {
              title: title + ' - ' + local.productName,
              props: {
                map,
                layers,
                popularLayers,
                myLayers,
                groups: await Group.getAllGroups()
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/map/embed/:map_id', csrfProtection, (req, res, next) => {
    const map_id = req.params.map_id

    if (!map_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    recordMapView(req.session, map_id, user_id, next)

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !req.session ||
      !req.session.user
    ) {
      MapUtils.completeEmbedMapRequest(
        app,
        req,
        res,
        next,
        map_id,
        false,
        false,
        false,
        false
      )
    } else {
      Map.allowedToModify(map_id, user_id)
        .then((allowed) => {
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            false,
            allowed,
            false,
            false
          )
        })
        .catch(nextError(next))
    }
  })
  app.get('/map/embed/:map_id/static', csrfProtection, (req, res, next) => {
    const map_id = req.params.map_id

    if (!map_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    recordMapView(req.session, map_id, user_id, next)

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !req.session ||
      !req.session.user
    ) {
      MapUtils.completeEmbedMapRequest(
        app,
        req,
        res,
        next,
        map_id,
        true,
        false,
        false,
        false
      )
    } else {
      Map.allowedToModify(map_id, user_id)
        .then((allowed) => {
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            true,
            allowed,
            false,
            false
          )
        })
        .catch(nextError(next))
    }
  })
  app.get(
    '/map/embed/:map_id/interactive',
    csrfProtection,
    (req, res, next) => {
      const map_id = req.params.map_id

      if (!map_id) {
        apiDataError(res)
      }

      let user_id = -1

      if (req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      recordMapView(req.session, map_id, user_id, next)

      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        MapUtils.completeEmbedMapRequest(
          app,
          req,
          res,
          next,
          map_id,
          true,
          false,
          true,
          false
        )
      } else {
        Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
            return MapUtils.completeEmbedMapRequest(
              app,
              req,
              res,
              next,
              map_id,
              true,
              allowed,
              true,
              false
            )
          })
          .catch(nextError(next))
      }
    }
  )
}
