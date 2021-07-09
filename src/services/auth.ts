import passport from 'passport'
import local from '../local'
import { findUser, findUserByEmail } from './auth-db/users'
import _find from 'lodash.find'
import User from '../models/user'
import Admin from '../models/admin'
import Auth0Helper from '../services/auth0-helper'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import shortid from 'shortid'
import Auth0Strategy from 'passport-auth0'

const saveMapHubsIDToAuth0 = async function (profile, maphubs_user_id) {
  log.info(
    `saving maphubs id ${maphubs_user_id} to auth0 for host ${local.host}`
  )
  let hosts = []

  if (profile._json['https://maphubs.com/hosts']) {
    hosts = profile._json['https://maphubs.com/hosts']
  }

  hosts.push({
    host: local.host,
    user_id: maphubs_user_id
  })
  const accessToken = await Auth0Helper.getManagementToken()
  return Auth0Helper.updateAppMetadata(
    {
      hosts
    },
    accessToken,
    profile
  )
}

const determineLocalDisplayName = function (profile) {
  let displayName

  if (profile._json && profile._json.username) {
    displayName = profile._json.username
  } else if (profile.nickname) {
    displayName = profile.nickname
  } else if (profile.displayName) {
    displayName = profile.displayName
  } else {
    displayName = shortid.generate()
  }

  return displayName
}

const createMapHubsUser = async function (profile: Record<string, any>) {
  const display_name = determineLocalDisplayName(profile)
  const user_id = await User.createUser(
    profile._json.email,
    display_name,
    display_name,
    profile.id
  )
  log.info(`Created new MapHubs user ${display_name} with id ${user_id}`)
  await saveMapHubsIDToAuth0(profile, user_id)
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const maphubsUser = await findUser(user_id)
  // attach MapHubs User
  profile.maphubsUser = {
    id: maphubsUser.id,
    display_name: maphubsUser.display_name,
    email: maphubsUser.email
  }
  await Admin.sendAdminUserSignupNotification(
    maphubsUser.email,
    maphubsUser.display_name
  )
  return profile
}

Auth0Strategy.prototype.authorizationParams = function (options) {
  options = options || {}
  const params: {
    connection?: any
    connection_scope?: any
    audience?: any
    prompt?: any
    login_hint?: any
    acr_values?: any
    max_age?: any
    nonce?: any
    screen_hint?: any
  } = {}

  if (options.connection && typeof options.connection === 'string') {
    params.connection = options.connection

    if (
      options.connection_scope &&
      typeof options.connection_scope === 'string'
    ) {
      params.connection_scope = options.connection_scope
    }
  }

  if (options.audience && typeof options.audience === 'string') {
    params.audience = options.audience
  }

  if (options.prompt && typeof options.prompt === 'string') {
    params.prompt = options.prompt
  }

  if (options.login_hint && typeof options.login_hint === 'string') {
    params.login_hint = options.login_hint
  }

  if (options.acr_values && typeof options.acr_values === 'string') {
    params.acr_values = options.acr_values
  }

  const strategyOptions = this.options

  if (strategyOptions && typeof strategyOptions.maxAge === 'number') {
    params.max_age = strategyOptions.maxAge
  }

  if (this.authParams && typeof this.authParams.nonce === 'string') {
    params.nonce = this.authParams.nonce
  }

  if (options.screen_hint && typeof options.screen_hint === 'string') {
    params.screen_hint = options.screen_hint
  }

  return params
}

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: local.AUTH0_DOMAIN,
    clientID: local.AUTH0_CLIENT_ID,
    clientSecret: local.AUTH0_CLIENT_SECRET,
    callbackURL:
      local.AUTH0_CALLBACK_URL || 'http://maphubs.test:4000/callback',
    authorizationURL: `https://${local.AUTH0_DOMAIN}/authorize?test=1234`
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    log.info('Auth0 login')
    // console.log(profile)
    // check if user has a local user object
    let hosts = []

    if (profile._json['https://maphubs.com/hosts']) {
      hosts = profile._json['https://maphubs.com/hosts']
    }

    const host = _find(hosts, {
      host: local.host
    })

    if (host && host.user_id) {
      // local user already linked
      return findUser(host.user_id)
        .then(async (maphubsUser) => {
          if (maphubsUser.id !== '1' && local.requireInvite) {
            const allowed = await Admin.checkInviteEmail(maphubsUser.email)

            if (!allowed) {
              log.warn(`unauthorized user: ${maphubsUser.email}`)
              return false
            }
          }

          // attach MapHubs User
          log.info(
            `Auth0 login successful for ${maphubsUser.id} ${maphubsUser.display_name} ${maphubsUser.email}`
          )
          profile.maphubsUser = {
            id: maphubsUser.id,
            display_name: maphubsUser.display_name,
            email: maphubsUser.email
          }
          return profile
        })
        .asCallback(done)
    } else {
      log.warn(`local user not linked: ${profile._json.email}`)
      // attempt to lookup user by email
      return findUserByEmail(profile._json.email)
        .then(async (maphubsUser) => {
          if (maphubsUser) {
            if (maphubsUser.id !== '1' && local.requireInvite) {
              const allowed = await Admin.checkInviteEmail(maphubsUser.email)

              if (!allowed) {
                log.warn(`unauthorized user: ${maphubsUser.email}`)
                return false
              }
            }

            // link it back to the Auth0 account
            return saveMapHubsIDToAuth0(profile, maphubsUser.id).then(() => {
              profile.maphubsUser = {
                id: maphubsUser.id,
                display_name: maphubsUser.display_name,
                email: maphubsUser.email
              }
              return profile
            })
          } else {
            // local user not found
            return !local.requireInvite
              ? Promise.resolve(createMapHubsUser(profile))
              : Admin.checkInviteConfirmed(profile._json.email).then(
                  (confirmed) => {
                    if (confirmed) {
                      return Promise.resolve(createMapHubsUser(profile))
                    } else {
                      log.warn(`unauthorized user: ${profile._json.email}`)
                      return Promise.resolve(false)
                    }
                  }
                )
          }
        })
        .asCallback(done)
    }
  }
)
passport.use(strategy)
// This can be used to keep a smaller payload
passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})
