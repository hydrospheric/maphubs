//@flow
var knex = require('../../connection.js');
var log = require('../log.js');
var debug = require('../debug')('oauth-db/users');


function translateUserObject(data: Object) {

  var user = {
    id: data.id,
    display_name: data.display_name,
    pass_crypt: data.pass_crypt,
    description: data.description,
    email: data.email
  };

  return user;
}

exports.find = function(id: number, done: Function) {
  debug.log('find by id: ' + id);
  return knex.select('*')
    .from('users')
    .where('id', id)
    .then((data) => {
      if (data.length === 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        return done('User Not Found: ' + id, null);
      }

    }).catch((err) => {
      log.error(err);
      return done(err, null);
    });

};

exports.findByEmail = function(email: string, done: Function) {
  debug.log('find by email: ' + email);
  return knex.select('*')
    .from('users')
    .where('email', email)
    .then((data) => {
      if (data.length === 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        debug.log('email not found: ' + email);
        return done(null, null);
      }

    }).catch((err) => {
      log.error(err);
      return done(err, null);
    });

};

exports.findByUsername = function(username: string, done: Function) {
  debug.log('find by username: ' + username);

  username = username.toLowerCase();

  return knex.select('*')
    .from('users')
    .where(knex.raw('lower(display_name)'), '=', username)
    .then((data) => {
      if (data.length === 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        return done(null, null);
      }

    }).catch((err) => {
      log.error(err);
      return done(err, null);
    });
};
