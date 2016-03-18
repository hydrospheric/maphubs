const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var LayerMap = require('../views/layermap');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerMap layer={data.layer} geoJSON={data.geoJSON} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
