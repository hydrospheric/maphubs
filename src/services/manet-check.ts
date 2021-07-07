import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import local from '../local'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Layer from '../models/layer'
import Map from '../models/map'
import compare from 'secure-compare'

const debug = DebugService('manet-check')

const manetCheck = function (req: any): boolean {
  // determine if this is the manet screenshot service
  // first check the cookie
  if (req.cookies) debug.log(JSON.stringify(req.cookies))

  if (!req.cookies || !req.cookies.manet) {
    log.error('Manet Cookie Not Found')
    return false
  } else if (!compare(req.cookies.manet, local.manetAPIKey)) {
    log.error('Invalid Manet Key')
    return false
  } else {
    return true
  }
}

const failure = function (res) {
  return res.status(401).send('Unauthorized')
}

const success = function (next) {
  next()
}

const middlewareCheck = function (req, res, next) {
  return check(req) ? success(next) : failure(res)
}

const manetMiddleware = async (req: any, res: any, next: any): Promise<any> => {
  try {
    let user_id = -1

    if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    let layer_id, map_id

    if (req.params.layer_id) {
      layer_id = Number.parseInt(req.params.layer_id, 10)
    } else if (req.body.layer_id) {
      layer_id = req.body.layer_id
    } else if (req.params.map_id) {
      map_id = Number.parseInt(req.params.map_id, 10)
    } else if (req.body.map_id) {
      map_id = req.body.map_id
    }

    if (layer_id) {
      // check if the layer is private
      const layer = await Layer.getLayerByID(layer_id)

      if (layer) {
        // if layer is private,
        if (layer.private) {
          if (req.isAuthenticated && req.isAuthenticated()) {
            // if there is a user session, the user must be allowed to edit
            if (await layer.allowedToModify(layer_id, user_id)) {
              return success(next)
            } else {
              log.error(
                'Unauthenticated screenshot request, not authorized to view private layer: ' +
                  layer.layer_id
              )
              return failure(res)
            }
          } else {
            // else private but no session = check for manet
            return middlewareCheck(req, res, next)
          }
        } else {
          // else not private = allow if login not required, or login required and authenticated
          return !local.requireLogin ||
            (req.isAuthenticated && req.isAuthenticated())
            ? success(next)
            : middlewareCheck(req, res, next)
        }
      } else {
        log.error('Layer not found')
        return failure(res)
      }
    } else if (map_id) {
      const map = await Map.getMap(map_id)

      if (map) {
        if (map.private) {
          return req.isAuthenticated && req.isAuthenticated()
            ? map.allowedToModify(map_id, user_id).then((allowed) => {
                if (allowed) {
                  return success(next)
                } else {
                  log.error(
                    'Unauthenticated screenshot request, not authorized to view private map: ' +
                      map.map_id
                  )
                  return failure(res)
                }
              })
            : middlewareCheck(req, res, next)
        } else {
          // else not private = allow if login not required, or login required and authenticated
          return !local.requireLogin ||
            (req.isAuthenticated && req.isAuthenticated())
            ? success(next)
            : middlewareCheck(req, res, next)
        }
      } else {
        log.error('Map not found')
        return failure(res)
      }
    } else {
      if (
        !local.requireLogin ||
        (req.isAuthenticated && req.isAuthenticated())
      ) {
        return success(next)
      } else {
        // check for manet
        middlewareCheck(req, res, next)
      }
    }
  } catch (err) {
    log.error(err)
  }
}

export { manetMiddleware, manetCheck }
