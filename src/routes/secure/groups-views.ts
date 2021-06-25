import Locales from '../../services/locales'

const Group = require('../../models/group')

const User = require('../../models/user')

const Layer = require('../../models/layer')

const Map = require('../../models/map')

const Story = require('../../models/story')

const Account = require('../../models/account')

const login = require('connect-ensure-login')

// var log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log');
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'routes/groups'
)

const nextError = require('../../services/error-response').nextError

const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

const pageOptions = require('../../services/page-options-helper')

const local = require('../../local')

const csrfProtection = require('csurf')({
  cookie: false
})

module.exports = function (app: any) {
  app.get('/groups', csrfProtection, async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/groups',
        await pageOptions(req, {
          title: req.__('Groups') + ' - ' + local.productName,
          props: {
            featuredGroups: await Group.getFeaturedGroups(),
            recentGroups: await Group.getRecentGroups(),
            popularGroups: await Group.getPopularGroups()
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/groups/all', csrfProtection, async (req, res, next) => {
    try {
      const locale = req.locale ? req.locale : 'en'
      const groups = await Group.getAllGroups().orderByRaw(
        `lower((omh.groups.name -> '${locale}')::text)`
      )
      return app.next.render(
        req,
        res,
        '/allgroups',
        await pageOptions(req, {
          title: req.__('Groups') + ' - ' + local.productName,
          props: {
            groups
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/creategroup',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res) => {
      app.next.render(
        req,
        res,
        '/creategroup',
        await pageOptions(req, {
          title: req.__('Create Group') + ' - ' + local.productName,
          props: {}
        })
      )
    }
  )
  app.get('/group/:id', csrfProtection, async (req, res, next) => {
    try {
      const group_id = req.params.id
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const group = await Group.getGroupByID(group_id)

      if (!group) {
        return res.redirect('/notfound?path=' + req.path)
      }

      const canEdit = await Group.allowedToModify(group_id, user_id)
      const image = `${urlUtil.getBaseUrl()}/group/${group_id}/image.png`
      const name = Locales.getLocaleStringObject(req.locale, group.name)
      const description = Locales.getLocaleStringObject(
        req.locale,
        group.description
      )
      return app.next.render(
        req,
        res,
        '/groupinfo',
        await pageOptions(req, {
          title: `${name} - ${local.productName}`,
          description,
          props: {
            group,
            maps: await Map.getGroupMaps(group_id, canEdit),
            layers: await Layer.getGroupLayers(group_id, canEdit),
            stories: await Story.getGroupStories(group_id, canEdit),
            members: await Group.getGroupMembers(group_id),
            canEdit
          },
          twitterCard: {
            card: 'summary',
            title: name,
            description,
            image,
            imageType: 'image/png',
            imageWidth: 600,
            imageHeight: 600
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/group/:id/admin',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = Number.parseInt(req.session.user.maphubsUser.id)
        const group_id = req.params.id
        // confirm that this user is allowed to administer this group
        const role = await Group.getGroupRole(user_id, group_id)

        if (role === 'Administrator') {
          const group = await Group.getGroupByID(group_id)

          if (group) {
            const name = Locales.getLocaleStringObject(req.locale, group.name)
            return app.next.render(
              req,
              res,
              '/groupadmin',
              await pageOptions(req, {
                title:
                  name + ' ' + req.__('Settings') + ' - ' + local.productName,
                props: {
                  group,
                  maps: await Map.getGroupMaps(group_id, true),
                  layers: await Layer.getGroupLayers(group_id, true),
                  members: await Group.getGroupMembers(group_id),
                  account: await Account.getStatus(group_id)
                }
              })
            )
          } else {
            return res.redirect('/notfound')
          }
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get('/user/:username/groups', csrfProtection, (req, res, next) => {
    const username = req.params.username
    debug.log(username)

    if (!username) {
      nextError(next)
    }

    let canEdit = false

    function completeRequest(userCanEdit) {
      User.getUserByName(username)
        .then((user) => {
          if (user) {
            return Group.getGroupsForUser(user.id).then(async (groups) => {
              return app.next.render(
                req,
                res,
                '/usergroups',
                await pageOptions(req, {
                  title: 'Groups - ' + username,
                  props: {
                    user,
                    groups,
                    canEdit: userCanEdit
                  }
                })
              )
            })
          } else {
            return res.redirect('/notfound?path=' + req.path)
          }
        })
        .catch(nextError(next))
    }

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !req.session ||
      !req.session.user
    ) {
      completeRequest()
    } else {
      // get user id
      const user_id = req.session.user.maphubsUser.id
      // get user for logged in user
      User.getUser(user_id)
        .then((user) => {
          // flag if requested user is logged in user
          if (user.display_name === username) {
            canEdit = true
          }

          return completeRequest(canEdit)
        })
        .catch(nextError(next))
    }
  })
}