const React  = require('react');
const ReactDOM = require('react-dom');

const HubBuilder = require('../views/hubbuilder');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubBuilder locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
