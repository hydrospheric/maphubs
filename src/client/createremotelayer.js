import React from 'react';
import ReactDOM from 'react-dom';

import CreateRemoteLayer from '../views/createremotelayer';

require('babel-polyfill');

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('../../node_modules/react-colorpickr/dist/colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateRemoteLayer {...data}/>,
    document.querySelector('#app')
  );
});
