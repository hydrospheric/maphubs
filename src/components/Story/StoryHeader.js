import React from 'react';
import PropTypes from 'prop-types';

var urlUtil = require('../../services/url-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var moment = require('moment-timezone');
var Gravatar = require('../user/Gravatar');

import {addLocaleData, IntlProvider, FormattedRelative, FormattedDate} from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';

addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(it);

var StoryHeader = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: PropTypes.object.isRequired,
    baseUrl: PropTypes.string,
    short:  PropTypes.bool
  },

  getDefaultProps(){
    return {
      baseUrl: '',
      short: false
    };
  },


  render(){

    var linkUrl = '';
    var author = '';
    var userImage='';
    var guessedTz = moment.tz.guess();
    var updatedTime = moment.tz(this.props.story.updated_at, guessedTz).format();

    var time = '';
    if(this.props.short){
      var daysOld = moment().diff(moment(this.props.story.updated_at), 'days');
      if(daysOld < 7){
        time = (
          <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
            <IntlProvider locale={this.state.locale}>
              <FormattedRelative value={updatedTime}/>
            </IntlProvider>
          </p>
        );
      }else{
        time = (
          <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
            <IntlProvider locale={this.state.locale}>
              <FormattedDate value={updatedTime} month="short" day="numeric"/>
            </IntlProvider>&nbsp;
          </p>
        );
      }
    }else{
      time = (
        <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
          <IntlProvider locale={this.state.locale}>
            <FormattedDate value={updatedTime} month="short" day="numeric"/>
          </IntlProvider>&nbsp;
          (<IntlProvider locale={this.state.locale}>
            <FormattedRelative value={updatedTime}/>
          </IntlProvider>)
        </p>
      );
    }

    if(this.props.story.display_name){
      if(this.props.story.emailhash){
        userImage = (
            <Gravatar size={36} emailHash={this.props.story.emailhash} />

        );
      }
      var baseUrl = urlUtil.getBaseUrl();
      linkUrl = baseUrl + '/user/' + this.props.story.display_name;
      author = (
        <div style={{height: '40px', marginBottom: '10px', width: '100%'}}>
          <div className="valign-wrapper" style={{width: '36px', float: 'left'}}>
            <a className="valign" style={{marginTop: '4px'}} href={linkUrl + '/stories'}>{userImage}</a>
          </div>
          <div style={{marginLeft: '46px', width: 'calc(100% - 46px)'}}>
            <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}} className="truncate"><a className="valign" style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}} href={linkUrl + '/stories'}>{this.props.story.display_name}</a></p>
            {time}
          </div>
        </div>
      );
    }else if(this.props.story.hub_id){
      var hubLogoUrl = '/hub/' + this.props.story.hub_id + '/images/logo/thumbnail';
      userImage = (
          <img className="circle valign" height="36" width="36" style={{height: '36px', width: '36px', border: '1px solid #bbbbbb'}} src={hubLogoUrl} alt="Hub Logo"  />
      );
      var authorText = '';
      if(this.props.story.author){
        authorText = this.props.story.author + ' - ';
      }

      var hubUrl = baseUrl + '/hub/' + this.props.story.hub_id;
      linkUrl = hubUrl;
      author = (
          <div style={{height: '40px', marginBottom: '10px'}}>
            <div className="valign-wrapper" style={{width: '36px', float: 'left'}}>
              <a className="valign" style={{marginTop: '4px'}} href={linkUrl + '/stories'}>{userImage}</a>
            </div>
            <div style={{marginLeft: '46px'}}>
              <p  style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}} className="truncate">{authorText} <a className="valign" style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}} href={linkUrl + '/stories'}>{this.props.story.hub_name}</a></p>
              {time}
            </div>
          </div>
      );
    }



   return (
     <div>
       {author}
     </div>
   );
  }

});

module.exports = StoryHeader;
