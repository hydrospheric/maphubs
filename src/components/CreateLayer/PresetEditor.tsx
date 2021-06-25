import React from 'react'
import { Row, Button, List } from 'antd'
import PresetForm from './PresetForm'
import LayerStore from '../../stores/layer-store'
import Actions from '../../actions/LayerActions'

import _isequal from 'lodash.isequal'
import { PlusOutlined } from '@ant-design/icons'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onValid: (...args: Array<any>) => any
  onInvalid: (...args: Array<any>) => any
  warnIfUnsaved: boolean
}
type State = LayerStoreState
export default class PresetEditor extends React.Component<Props, State> {
  props: Props
  static defaultProps:
    | any
    | {
        warnIfUnsaved: boolean
      } = {
    warnIfUnsaved: true
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  unloadHandler: any

  componentDidMount() {
    const _this = this

    this.unloadHandler = (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingPresetChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): any | boolean {
    if (nextState.presets && !this.state.presets) {
      return true
    }

    return !_isequal(nextState.presets, this.state.presets)
  }

  addPreset: any | (() => void) = () => {
    Actions.addPreset()
  }
  onValid: any | (() => void) = () => {
    if (this.props.onValid) this.props.onValid()
  }
  onInvalid: any | (() => void) = () => {
    if (this.props.onInvalid) this.props.onInvalid()
  }

  render(): JSX.Element {
    const { t } = this

    const _this = this

    let presets = []

    if (this.state.presets) {
      presets = this.state.presets.toArray()
    }

    return (
      <>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={this.addPreset}
          >
            {t('Add Field')}
          </Button>
        </Row>
        <Row
          justify='center'
          style={{
            marginBottom: '20px'
          }}
        >
          <List
            dataSource={presets}
            bordered
            style={{
              width: '100%'
            }}
            renderItem={(preset) => (
              <List.Item>
                <PresetForm
                  {...preset}
                  onValid={_this.onValid}
                  onInvalid={_this.onInvalid}
                />
              </List.Item>
            )}
          />
        </Row>
      </>
    )
  }
}
