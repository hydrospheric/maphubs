var React = require('react');
var Header =require('../components/header');

var ReactDisqusThread = require('react-disqus-thread');
var slug = require('slug');

var StoryHeader = require('../components/Story/StoryHeader');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');


var UserStory = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object.isRequired,
    username: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      story: {},
      canEdit: false
    };
  },

  render() {
    var story = this.props.story;


    var button = '';
    if(this.props.canEdit){
      button = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red tooltipped"
            href={'/user/'+ this.props.username + '/story/' + this.props.story.story_id + '/edit/' + slug(this.props.story.title)}
            data-delay="50" data-position="left" data-tooltip={this.__('Edit')}>
            <i className="large material-icons">mode_edit</i>
          </a>

        </div>
      );
    }
    var title = story.title.replace('&nbsp;', '');
    /*eslint-disable react/no-danger*/
    return (
      <div>
        <Header />
        <main>
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <StoryHeader story={story} />
            </div>
            <div className="row">
              <h3 className="story-title">{title}</h3>
              <div className="story-content" dangerouslySetInnerHTML={{__html: story.body}}></div>
            </div>
              <hr />
              <div className="row">
                <div className="addthis_sharing_toolbox"></div>
                <ReactDisqusThread
                      shortname="maphubs"
                      identifier={'maphubs-story-' + story.story_id}
                      title={title}
                      />
                </div>

              </div>
          {button}
        </main>
      </div>
    );
      /*eslint-enable react/no-danger*/
  }
});

module.exports = UserStory;
