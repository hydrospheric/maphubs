// @flow
import React from 'react'
import { message } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {|
  onSubmit: Function,
  type: string
|}

export default class EmptyLocalSource extends MapHubsComponent<Props, LocaleStoreState> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  onSubmit = () => {
    const {t} = this
    const _this = this
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {},
      is_empty: true,
      empty_data_type: this.props.type
    }

    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
      } else {
        message.success(t('Layer Saved'), 1, _this.props.onSubmit)
      }
    })
  }

  render () {
    const {t} = this
    return (
      <div className='row'>
        <p>{t('Creating a new layer of type:') + ' ' + this.props.type}</p>
        <div className='right'>
          <button className='waves-effect waves-light btn' onClick={this.onSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
        </div>
      </div>
    )
  }
}
