import React from 'react';
import ReactDOM from 'react-dom';

require('babel-polyfill');
require('jquery');
require("materialize-css");
import Search from '../views/search';

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <Search {...data}/>,
    document.querySelector('#app')
  );
});
