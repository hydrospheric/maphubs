/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.layers ADD COLUMN settings json;'),
    knex.raw('ALTER TABLE omh.map_layers ADD COLUMN settings json;')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.layers DROP COLUMN settings;'),
    knex.raw('ALTER TABLE omh.map_layers DROP COLUMN settings;')
  ])
}
