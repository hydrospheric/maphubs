import React from 'react'
import Formsy from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onSubmit: () => void
}
type State = {
  canSubmit: boolean
  selectedSource?: string
} & LocaleStoreState &
  LayerStoreState
export default class EarthEngineSource extends React.Component<Props, State> {
  props: Props
  state: State = {
    canSubmit: false
  }

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }
  submit = (model: Record<string, any>): void => {
    const { t, props, state } = this
    const { onSubmit } = props
    const { _csrf } = state

    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'Earth Engine',
        external_layer_config: {
          type: 'earthengine',
          min: Number.parseInt(model.min, 10),
          max: Number.parseInt(model.max, 10),
          image_id: model.image_id
        }
      },
      _csrf,
      (err) => {
        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          message.success(t('Layer Saved'), 1, () => {
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()

            onSubmit()
          })
        }
      }
    )
  }
  sourceChange = (value: string): void => {
    this.setState({
      selectedSource: value
    })
  }

  render(): JSX.Element {
    const { t, state, submit, enableButton, disableButton } = this
    const { canSubmit } = state
    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Formsy
          onValidSubmit={submit}
          onValid={enableButton}
          onInvalid={disableButton}
        >
          <div>
            <p>{t('Earth Engine Source')}</p>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='image_id'
                label={t('Image ID/Asset ID')}
                icon='info'
                validations='maxLength:200'
                validationErrors={{
                  maxLength: t('Must be 200 characters or less.')
                }}
                length={200}
                tooltipPosition='top'
                tooltip={t('EarthEngine Image ID or Asset ID')}
                required
                t={t}
              />
            </Row>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='min'
                label={t('Min (Optional)')}
                icon='info'
                t={t}
              />
            </Row>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='max'
                label={t('Max (Optional)')}
                icon='info'
                t={t}
              />
            </Row>
          </div>
          <div
            style={{
              float: 'right'
            }}
          >
            <Button type='primary' htmlType='submit' disabled={!canSubmit}>
              {t('Save and Continue')}
            </Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
