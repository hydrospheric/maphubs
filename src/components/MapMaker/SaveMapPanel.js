//@flow
import React from 'react';
import MapMakerStore from '../../stores/MapMakerStore';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import NotificationActions from '../../actions/NotificationActions';
import SelectGroup from '../Groups/SelectGroup';
import Toggle from '../forms/toggle';
import MapHubsComponent from '../MapHubsComponent';

export default class SaveMapPanel extends MapHubsComponent {

  props: {
    onSave: Function,
    groups: Array<Object>
  }

  constructor(props: Object){
    super(props);
    this.stores.push(MapMakerStore);
    this.stores.push(UserStore);
    var ownedByGroup = false;
    if(this.props.groups && this.props.groups.length > 0){
      //suggest a group by default if user is member of groups
      ownedByGroup = true;
    }
    this.state = {
      canSave: false,
      ownedByGroup
    };
  }

  enableSaveButton = () => {
    this.setState({
      canSave: true
    });
  }

  disableSaveButton = () => {
    this.setState({
      canSave: false
    });
  }

  recheckLogin = () => {
    UserActions.getUser((err) => {
      if(err){
        NotificationActions.showNotification({message: this.__('Not Logged In - Please Login Again'), dismissAfter: 3000, position: 'topright'});
      }
    });
  }

  onSave = (model: Object) => {
    var _this = this;
    if(!model.title || model.title === ''){
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'topright'});
      return;
    }

    if(!model.group && this.props.groups.length === 1){
        //creating a new layer when user is only the member of a single group (not showing the group dropdown)
        model.group = this.props.groups[0].group_id;
      }
    this.setState({saving: true});
    this.props.onSave(model, () =>{
      _this.setState({saving: false});
    });
  }

  onOwnedByGroup = (ownedByGroup: string) =>{
    this.setState({ownedByGroup});
  }

  render(){

    var groups = '', groupToggle = '', editing = false;
    if(this.props.groups && this.props.groups.length > 0){
   
        if(this.state.map_id && this.state.map_id > 0){
          editing = true;
        }else{
          //if the user is in a group, show group options
          groupToggle = (
            <div className="row">   
              <Toggle name="ownedByGroup" labelOff={this.__('Owned by Me')} labelOn={this.__('Owned by My Group')} 
              checked={this.state.ownedByGroup} className="col s12"
              onChange={this.onOwnedByGroup}
                  dataPosition="right" dataTooltip={this.__('Select who should own this map')}
                />
            </div>  
          );
        }
  
      if(this.state.ownedByGroup){
        //show group selection
         groups = (
          <div className="row">       
            <SelectGroup groups={this.props.groups} group_id={this.state.owned_by_group_id} type="map" canChangeGroup={!editing} editing={editing}/>
          </div>        
        );
      }
     
    }else{
      //owned by the user account is the default, display a message about groups?
    }

    if(this.state.loggedIn){
     return (
        <Formsy.Form onValidSubmit={this.onSave} onValid={this.enableSaveButton} onInvalid={this.disableSaveButton}>
          <div className="row">
            <TextInput name="title"
              defaultValue={this.state.title} value={this.state.title}
              label={this.__('Map Title')}
              className="col s12" length={200}
               required/>
          </div>
          {groupToggle}
          {groups}
          <div className="row">
            <div className="col s12 valign-wrapper">
                  <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} 
                  disabled={(!this.state.canSave || this.state.saving)}>{this.__('Save Map')}</button>
            </div>
          </div>

        </Formsy.Form>
      );
    }else{
     return (
        <div>
          <div className="row center-align">
            <p>{this.__('You must login or sign up before saving a map.')}</p>
          </div>
          <div className="row center-align">
            <a className="btn" href="/login" target="_blank" rel="noopener noreferrer">{this.__('Login')}</a>
          </div>
          <div className="row center-align">
            <a className="btn" onClick={this.recheckLogin}>{this.__('Retry')}</a>
          </div>
        </div>
      );
    }

  }
}