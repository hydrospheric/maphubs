/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw(`
    INSERT INTO omh.page (page_id, config) VALUES ('header', '{"logoLinkUrl": "/"}');
    `)
}

exports.down = function () {
  return Promise.resolve()
}
