// @flow
import React from 'react'
import { message, notification } from 'antd'
import Formsy from 'formsy-react'
import TextInput from '../forms/textInput'
import UserActions from '../../actions/UserActions'
import _isequal from 'lodash.isequal'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {
  text: LocalizedString,
  t: Function
}

type State = {
  valid: boolean,
  placeholder?: string,
  email: string
} & LocaleStoreState

export default class MailingList extends MapHubsComponent<Props, State> {
  state: State = {
    valid: false,
    email: ''
  }

  static defaultProps = {
    text: {en: '', fr: '', es: '', it: ''}
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes

    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onValid = () => {
    this.setState({
      valid: true
    })
  }

  onInvalid = () => {
    this.setState({
      valid: false
    })
  }

  onSubmit = (model: Object) => {
    const {t} = this
    const _this = this
    if (this.state.valid) {
      UserActions.joinMailingList(model.email, this.state._csrf, (err) => {
        if (err) {
          notification.error({
            message: err.title || t('Error'),
            description: err.detail || err.toString() || err,
            duration: 0
          })
        } else {
          _this.setState({email: _this.state.email, placeholder: t('Thanks for signing up!')})
          message.info(t('Added ' + model.email + ' to the list. Thanks for joining!'))
        }
      })
    } else {
      message.error(t('Please enter a valid email address'))
    }
  }

  render () {
    const {t} = this
    const _this = this

    const placeholder = this.state.placeholder ? this.state.placeholder : t('Sign up for our mailing list')
    return (
      <div className='container valign-wrapper' style={{height: '62px'}}>
        <div className='col s6 valign right-align'>
          <b style={{fontSize: '14px'}}>{this.t(this.props.text)}</b>
        </div>
        <div className='col s6 valign'>
          <Formsy onSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInvalid}>
            <div>
              <TextInput name='email' label={null} placeholder={placeholder}
                className='left no-margin no-padding mailing-list-text-input'
                validations={{isEmail: true}} validationErrors={{
                  isEmail: t('Not a valid email address.')
                }}
                showCharCount={false}
                useMaterialize={false}
                value={this.state.email}
                onClick={() => {
                  _this.setState({placeholder: t('Enter your email address')})
                }}
                required />
              <button type='submit' className='left waves-effect waves-light btn'
                style={{
                  borderTopLeftRadius: '0px',
                  borderTopRightRadius: '25px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '25px',
                  boxShadow: 'none',
                  height: '40px',
                  width: '25%',
                  paddingLeft: 0,
                  paddingRight: 0,
                  textTransform: 'none'
                }}>{t('Sign up')}</button>
            </div>
          </Formsy>
        </div>
        <style jsx global>{`
          .mailing-list-text-input {
            width: 75%;
          }

          .mailing-list-text-input input {
            margin: 0 !important;
            height: 38px !important;
            border: 1px solid #aaa !important;
            border-bottom-left-radius: 25px !important;
            border-bottom-right-radius: 0px !important;
            border-top-left-radius: 25px !important;
            border-top-right-radius: 0px !important;
            padding-left: 10px !important;
            width: 100% !important;
            background-color: white !important;
            }

          .mailing-list-text-input input:focus {
            border: 1px solid #aaa !important;
            box-shadow: none !important;
          }
        `}</style>
      </div>
    )
  }
}
