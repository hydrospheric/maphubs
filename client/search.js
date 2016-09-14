const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var Search = require('../views/search');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Search locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
