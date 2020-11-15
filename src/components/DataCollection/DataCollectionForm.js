// @flow
import type {Element} from "React";import React from 'react'
import {Button} from 'antd'
import Formsy from 'formsy-react'
import FormField from './FormField'
import MapHubsComponent from '../MapHubsComponent'
import Locales from '../../services/locales'

type Props = {|
  presets: Array<Object>,
  values?: Object,
  showSubmit: boolean,
  onSubmit?: Function,
  onValid?: Function,
  onInValid?: Function,
  onChange?: Function,
  submitText?: string,
  style?: Object
|}

type State = {
  canSubmit: boolean,
  submitText: string
}

export default class DataCollectionForm extends MapHubsComponent<Props, State> {
  static defaultProps: any | {|showSubmit: boolean|} = {
    showSubmit: true
  }

  constructor (props: Props) {
    super(props)
    let submitText = ''
    if (props.submitText) {
      submitText = props.submitText
    } else if (this.state && this.state.locale) {
      submitText = Locales.getLocaleString(this.state.locale, 'Submit')
    } else {
      submitText = 'Submit'
    }
    this.state = {
      canSubmit: false,
      submitText
    }
  }

  onSubmit: any | ((model: any) => void) = (model: Object) => {
    if (this.props.onSubmit) this.props.onSubmit(model)
  }

  onValid: any | (() => void) = () => {
    this.setState({canSubmit: true})
    if (this.props.onValid) this.props.onValid()
  }

  onInValid: any | (() => void) = () => {
    this.setState({canSubmit: false})
    if (this.props.onInValid) this.props.onInValid()
  }

  onChange: any | ((model: any) => void) = (model: Object) => {
    if (this.props.onChange) this.props.onChange(model)
  }

  render (): Element<"div"> {
    const {t} = this
    const {style, showSubmit, presets, values} = this.props
    let submit = ''
    if (showSubmit) {
      submit = (
        <div style={{float: 'right'}}>
          <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{this.state.submitText}</Button>
        </div>
      )
    }

    return (
      <div style={style}>
        <Formsy
          onValidSubmit={this.onSubmit}
          onChange={this.onChange}
          onValid={this.onValid} onInvalid={this.onInValid}
        >
          {
            presets.map((preset) => {
              let value
              if (values && values[preset.tag]) {
                value = values[preset.tag]
              }
              if (preset.tag !== 'photo_url') {
                return (
                  <FormField t={t} key={preset.tag} preset={preset} value={value} />
                )
              }
            })
          }
          {submit}
        </Formsy>
      </div>
    )
  }
}
