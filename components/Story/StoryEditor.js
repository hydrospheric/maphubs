var React = require('react');
var ReactDOM = require('react-dom');
var slug = require('slug');
var Editor = require('react-medium-editor');
var $ = require('jquery');
var debounce = require('lodash.debounce');
var MessageActions = require('../../actions/MessageActions');
var NotificationActions = require('../../actions/NotificationActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var CreateMap = require('../CreateMap/CreateMap');
var CreateMapActions = require('../../actions/CreateMapActions');
var ImageCrop = require('../ImageCrop');
var checkClientError = require('../../services/client-error-response').checkClientError;

var request = require('superagent');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

import Progress from '../Progress';


var StoryEditor = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object,
    hub_id: React.PropTypes.string,
    storyType: React.PropTypes.string,
    username: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      story: {},
      hub_id: null,
      storyType: 'unknown'
    };
  },

  getInitialState() {
    return {
      title: this.props.story.title,
      body: this.props.story.body,
      author: this.props.story.author,
      story_id: this.props.story.story_id,
      unsavedChanges: false,
      saving: false
    };
  },
 componentDidMount(){
   var _this = this;

   $('.storybody').on('focus', function(){
     NotificationActions.dismissNotification();
   });

   $('.storybody').on('click', function(){
     var debounced = debounce(function(){
       _this.saveSelectionRange();
     }, 500).bind(this);
     debounced();
   });
   this.addMapCloseButtons();

   window.onbeforeunload = function(){
     if(_this.state.unsavedChanges){
       return _this.__('You have not saved the edits for your story, your changes will be lost.');
     }
   };
 },

  handleBodyChange(body) {
    var _this = this;
    _this.setState({body, unsavedChanges: true});
    var debounced = debounce(function(){
      _this.saveSelectionRange();
    }, 500).bind(this);
    debounced();
 },

 handleTitleChange(title) {
  this.setState({title, unsavedChanges: true});
},

handleAuthorChange(author) {
 this.setState({author, unsavedChanges: true});
},

getFirstLine(){
  var first_line = $('.storybody')
    .contents()
     .filter(function() {
         return !!$.trim(this.innerHTML||this.data);
     })
      .first().text();
  return  first_line;
},

getFirstImage(){
  var first_img = $('.storybody').find('img').first().attr('src');
  return first_img;
},

save(){
  var _this = this;

  if(!this.state.title || this.state.title == ''){
    NotificationActions.showNotification({message: _this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'});
    return;
  }

  //remove the map buttons so they are not saved
  this.removeMapCloseButtons();
  var body = $('.storybody').html();
  this.setState({saving: true});

  //get first line
  var firstline = this.getFirstLine();

  //get first image
  var firstimage = this.getFirstImage();

  var url = '';
  var story = {
      title: this.state.title,
      body,
      author: this.state.author,
      firstline,
      firstimage
  };


  if(this.props.storyType == 'hub'){
    if(this.state.story_id && this.state.story_id > 0){
      //saving an existing hub story
      story.story_id = this.state.story_id;
      url = '/api/hub/story/save';

    }else{
      //creating a new hub story
      url = '/api/hub/story/create';
    }

  }else if(this.props.storyType == 'user'){
    if(this.state.story_id && this.state.story_id > 0){
      //saving an existing user story
      story.story_id = this.state.story_id;
      url = '/api/user/story/save';
    }else{
      //creating a new user story
        url = '/api/user/story/create';
    }
  }

  request.post(url)
  .type('json').accept('json')
  .send(story)
  .end(function(err, res){
    checkClientError(res, err, function(err){
        _this.setState({saving: false});
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          var story_id = _this.state.story_id;
          if(res.body.story_id){
            story_id = res.body.story_id;
            _this.setState({story_id, unsavedChanges: false});
          }else{
            _this.setState({unsavedChanges: false});
          }
          _this.addMapCloseButtons(); //put back the close buttons
          NotificationActions.showNotification({message: _this.__('Story Saved!'), action: _this.__('View Story'),
            dismissAfter: 10000,
            onDismiss(){

            },
            onClick(){
              if(_this.props.storyType == 'user'){
                window.location = '/user/' + _this.props.username + '/story/' + story_id + '/' + slug(story.title);
              }else{
                window.location = '/story/' + story_id + '/' + slug(story.title);
              }

            }
          });
        }
    },
    function(cb){
      cb();
    });
  });

},

delete(){
  var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Delete'),
    message: _this.__('Please confirm removal of ') + this.state.title,
    onPositiveResponse(){
      request.post('/api/story/delete')
      .type('json').accept('json')
      .send({story_id: _this.state.story_id})
      .end(function(err, res){
        checkClientError(res, err, function(err){
            if(err){
              MessageActions.showMessage({title: _this.__('Error'), message: err});
            }else{

              NotificationActions.showNotification({
                message: _this.__('Story Deleted!'),
                onDismiss(){
                  window.location = '/';
                }
              });
            }
        },
        function(cb){
          cb();
        });
      });
    }
  });
},

getSelectionRange(){
  var sel, range;
  if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();

      if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          return range;
      }
  } else if ( (sel = document.selection) && sel.type != "Control") {
      // IE < 9
      var originalRange = sel.createRange();
      originalRange.collapse(true);
      range = sel.createRange();
      return range;
  }
},

pasteHtmlAtCaret(html) {
    var sel, savedRange = this.savedSelectionRange;
    var selection = window.getSelection();

    var range = document.createRange();
    range.setStart(savedRange.startContainer, savedRange.startOffset);
    range.setEnd(savedRange.endContainer, savedRange.endOffset);
    selection.addRange(range);
    if (selection) {
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // only relatively recently standardized and is not supported in
        // some browsers (IE9, for one)
        var el = document.createElement("p");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node;
        while ( (node = el.firstChild) ) {
            frag.appendChild(node);
        }
        range.insertNode(frag);

    } else if ( (sel = document.selection) && sel.type != "Control") {
        // IE < 9
        range.pasteHTML(html);
    }
    this.handleBodyChange($('.storybody').html());
},

onAddMap(map_id){
  if(this.state.editingMap){
    //refresh the iframe for this map
    $( '#map-' + map_id + ' iframe' ).attr( 'src', function ( i, val ) { return val; });
    this.setState({editingMap: false});
    return;
  }
  var url = urlUtil.getBaseUrl(config.host, config.port) + '/map/embed/' + map_id;
  this.pasteHtmlAtCaret('<div contenteditable="false" class="embed-map-container" id="map-' + map_id + '"><iframe src="' + url
  + '" style="" frameborder="0"></iframe>'
  + '</div>');
  this.addMapCloseButtons();
},

removeMap(map_id){
  var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Map Removal'),
    message: _this.__('Please confirm that you want to remove this map'),
    onPositiveResponse(){
      CreateMapActions.deleteMap(map_id, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          //remove from content
           $('#map-'+map_id).remove();
           _this.handleBodyChange($('.storybody').html());
        }
      });
    }
  });

},

addMapCloseButtons(){
  var _this = this;
  $('.embed-map-container').each(function(i, map){
    var map_id = map.id.split('-')[1];
    var removeButton = (
      <div>
        <a onClick={function(){_this.removeMap(map_id);}} className="btn-floating waves-effect waves-light omh-btn"><i className="material-icons">close</i></a>
        <a onClick={function(){_this.editMap(map_id);}} className="btn-floating waves-effect waves-light omh-btn"><i className="material-icons">edit</i></a>
      </div>
    );
    $(map).append( '<div class="map-remove-button" id="remove-button-' + map_id + '" style="position: absolute; top: 0; right: 0;"></div>');
    ReactDOM.render(removeButton, document.getElementById('remove-button-' + map_id));
  });
},

removeMapCloseButtons(){
  $('.map-remove-button').each(function(i, button){
    $(button).remove();
  });
},

onAddImage(data){
  this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
},

saveSelectionRange(){
  var sel = window.getSelection();

  if(sel.anchorNode && sel.anchorNode.parentNode
    && $.contains($('.storybody')[0], $(sel.anchorNode)[0])){

    var range = this.getSelectionRange();
    this.savedSelectionRange = {"startContainer": range.startContainer, "startOffset":range.startOffset,"endContainer":range.endContainer, "endOffset":range.endOffset};
  }else {
    this.savedSelectionRange = null;
  }
},

showCreateMap(){
  if(!this.state.story_id || this.state.story_id == -1){
    NotificationActions.showNotification({message: this.__('Please Save Story Before Adding a Map'), dismissAfter: 5000, position: 'bottomleft'});
    return;
  }

  if(this.savedSelectionRange){
      CreateMapActions.showMapDesigner();
  }else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'});
  }
},

editMap(map_id){
  var _this = this;
  this.setState({editingMap: true});
  CreateMapActions.editMap(map_id, function(err){
    if(err){
      MessageActions.showMessage({title: _this.__('Error'), message: err});
    }
  });
},

showImageCrop(){

  if(this.savedSelectionRange){
    this.refs.imagecrop.show();
  }else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'});
  }

},

  render() {

    var createMap = '', author='';
    if(this.props.storyType == 'hub'){
      createMap = (
        <CreateMap onCreate={this.onAddMap} storyId={this.state.story_id}
          showTitleEdit={false} titleLabel={this.__('Add Map')} hubStoryMap/>
      );

      author = (
        <div className="story-author">
          <Editor
         tag="b"
         text={this.state.author}
         onChange={this.handleAuthorChange}
         options={{buttonLabels: 'fontawesome',
           placeholder: {text: this.__('Enter the Author')},
           disableReturn: true, buttons: []}}
         />
      </div>
      );
    }else if(this.props.storyType == 'user'){
      createMap = (
        <CreateMap onCreate={this.onAddMap} storyId={this.state.story_id}
          showTitleEdit={false} titleLabel={this.__('Add Map')} userStoryMap/>
      );
    }



    return (
      <div style={{position: 'relative'}}>
        <div className="edit-header omh-color" style={{opacity: 0.5}}>
          <p style={{textAlign: 'center', color: '#FFF'}}>{this.__('Editing Story')}</p>
        </div>
        <div className="container editor-container">
          <div className="story-title">
            <Editor
           tag="h3"
           text={this.state.title}
           onChange={this.handleTitleChange}
           options={{buttonLabels: 'fontawesome',
             placeholder: {text: this.__('Enter a Title for Your Story')},
             disableReturn: true, buttons: []}}
         />

        </div>
        {author}
       <div className="story-content">
         <Editor
           className="storybody"
           text={this.state.body}
           onChange={this.handleBodyChange}
           options={{buttonLabels: 'fontawesome',
             delay: 100,
             placeholder: {text: this.__('Type your Story Here')},
             buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']}}
         />
       </div>
     </div>
       <div className="row" style={{position: 'absolute', top: '25px', right: '5px'}}>
         <div className="col s12" style={{border: '1px solid RGBA(0,0,0,.7)'}}>
           <p style={{margin: '5px'}}>{this.__('Select Text to See Formatting Options')}</p>
         </div>
       </div>

       {createMap}

       <ImageCrop ref="imagecrop" onCrop={this.onAddImage} />

       <div className="fixed-action-btn action-button-bottom-right" style={{bottom: '115px'}}>
            <a onMouseDown={function(e){e.stopPropagation();}} className="btn-floating btn-large red">
              <i className="large material-icons">add</i>
            </a>
            <ul>

              <li>
                <a  onMouseDown={this.showCreateMap} className="btn-floating tooltipped green darken-1" data-delay="50" data-position="left" data-tooltip={this.__('Insert Map')}>
                  <i className="material-icons">map</i>
                </a>
              </li>
              <li>
                <a onMouseDown={this.showImageCrop} className="btn-floating tooltipped yellow" data-delay="50" data-position="left" data-tooltip={this.__('Insert Image')}>
                  <i className="material-icons">insert_photo</i>
                </a>
              </li>

            </ul>
          </div>
          <div className="fixed-action-btn action-button-bottom-right">
            <a className="btn-floating btn-large blue tooltipped" onClick={this.save} data-delay="50" data-position="left" data-tooltip={this.__('Save')}>
              <i className="large material-icons">save</i>
            </a>
          </div>
          <div className="fixed-action-btn action-button-bottom-right" style={{marginRight: '70px'}}>
            <a className="btn-floating btn-large red tooltipped" onClick={this.delete} data-delay="50" data-position="left" data-tooltip={this.__('Delete')}>
              <i className="large material-icons">delete</i>
            </a>
          </div>
          <Progress id="saving-story" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
      </div>
    );
  }
});

module.exports = StoryEditor;
