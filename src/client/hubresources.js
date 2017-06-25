import React from 'react';
import ReactDOM from 'react-dom';

import HubResources from '../views/hubresources';

require('jquery');
require("materialize-css");


require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubResources {...data}/>,
    document.querySelector('#app')
  );
});
