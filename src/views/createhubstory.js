import React from 'react';
import PropTypes from 'prop-types';
var HubNav = require('../components/Hub/HubNav');
var HubBanner = require('../components/Hub/HubBanner');
var StoryEditor = require('../components/Story/StoryEditor');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var HubActions = require('../actions/HubActions');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateHubStory = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story_id: PropTypes.number.isRequired,
    hub: PropTypes.object.isRequired,
    myMaps: PropTypes.array,
    popularMaps: PropTypes.array,
    locale: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      hub: {}
    };
  },

  getInitialState() {
    HubActions.loadHub(this.props.hub);
    return {

    };
  },

  render() {
    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner editing={false} subPage={true} hubid={this.props.hub.hub_id}/>
          </div>
          <div className="row no-margin">
            <StoryEditor storyType="hub"
              story={{story_id: this.props.story_id, published: false}}
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              hub_id={this.props.hub.hub_id}/>
          </div>
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
});

module.exports = CreateHubStory;
