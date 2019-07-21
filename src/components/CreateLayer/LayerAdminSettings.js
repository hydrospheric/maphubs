// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { Row, Col } from 'antd'
import SelectGroup from '../Groups/SelectGroup'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
import MapHubsComponent from '../MapHubsComponent'
import Toggle from '../forms/toggle'

import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import type {Group} from '../../stores/GroupStore'
import CodeEditor from '../LayerDesigner/CodeEditor'

type Props = {|
  onSubmit: Function,
  onValid?: Function,
  onInValid?: Function,
  submitText: string,
  warnIfUnsaved: boolean,
  groups: Array<Group>
|}

type State = {
  canSubmit: boolean,
  pendingChanges: boolean
} & LocaleStoreState & LayerStoreState

export default class LayerAdminSettings extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    showGroup: true,
    warnIfUnsaved: false,
    showPrev: false,
    groups: []
  }

  state: State = {
    canSubmit: false,
    pendingChanges: false,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    const {t} = this
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingChanges) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
    if (this.refs.pageEditor) {
      this.refs.pageEditor.show()
    }
  }

  onFormChange = () => {
    this.setState({pendingChanges: true})
  }

  onValid = () => {
    this.setState({
      canSubmit: true
    })
    if (this.props.onValid) {
      this.props.onValid()
    }
  }

  onInvalid = () => {
    this.setState({
      canSubmit: false
    })
    if (this.props.onInValid) {
      this.props.onInValid()
    }
  }

  onSubmit = (model: Object) => {
    const {t} = this
    const _this = this

    if (!model.group && this.state.owned_by_group_id) {
      // editing settings on an existing layer
      model.group = this.state.owned_by_group_id
    }

    LayerActions.saveAdminSettings(model, _this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
      } else {
        _this.setState({pendingChanges: false})
        _this.props.onSubmit()
      }
    })
  }

  saveExternalLayerConfig = (config: Object) => {
    const {t} = this
    const _this = this
    LayerActions.saveExternalLayerConfig(config, _this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
      } else {
        _this.setState({pendingChanges: false})
        _this.props.onSubmit()
      }
    })
  }

  render () {
    const {t} = this
    const {is_external, external_layer_config, allow_public_submit, disable_export, owned_by_group_id} = this.state

    let elcEditor = ''
    if (is_external && external_layer_config) {
      elcEditor = (
        <div className='row' style={{height: '300px'}}>
          <CodeEditor ref='pageEditor' id='layer-elc-editor' mode='json'
            code={JSON.stringify(external_layer_config, undefined, 2)}
            title={t('External Layer Config')}
            onSave={this.saveExternalLayerConfig} modal={false} />
        </div>
      )
    }
    return (
      <div style={{marginRight: '2%', marginLeft: '2%', marginTop: '10px'}}>
        <Formsy onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
          <Row>
            <Col span={12}>
              <Row>
                <Toggle
                  name='disableExport'
                  labelOff={t('Allow Export')}
                  labelOn={t('Disable Export')}
                  checked={disable_export}
                />
              </Row>
              <Row>
                <Toggle
                  name='allowPublicSubmit'
                  labelOff={t('Disabled')}
                  labelOn={t('Allow Public Data Submission')}
                  checked={allow_public_submit}
                />
              </Row>
              {elcEditor}
            </Col>
            <Col span={12}>
              <Row>
                <SelectGroup
                  groups={this.props.groups}
                  type='layer'
                  group_id={owned_by_group_id}
                  canChangeGroup editing={false} />
              </Row>
            </Col>
          </Row>
          <div className='container'>
            <div className='right'>
              <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}>{this.props.submitText}</button>
            </div>
          </div>
        </Formsy>
      </div>
    )
  }
}
