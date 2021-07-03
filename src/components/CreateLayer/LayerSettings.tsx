import React from 'react'
import Formsy from 'formsy-react'
import { notification, Row, Col, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import MultiTextInput from '../forms/MultiTextInput'
import SelectGroup from '../Groups/SelectGroup'
import Select from '../forms/select'
import Licenses from './licenses'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import type { Group } from '../../stores/GroupStore'
import Locales from '../../services/locales'
type Props = {
  onSubmit: (...args: Array<any>) => void
  onValid?: (...args: Array<any>) => void
  onInValid?: (...args: Array<any>) => void
  submitText: string
  showGroup: boolean
  showPrev?: boolean
  onPrev?: (...args: Array<any>) => void
  prevText?: string
  warnIfUnsaved: boolean
  groups: Array<Group>
}
type DefaultProps = {
  showGroup: boolean
  warnIfUnsaved: boolean
  showPrev: boolean
  groups: Array<Group>
}
type LayerSettingsState = {
  canSubmit: boolean
  pendingChanges: boolean
}
type State = LocaleStoreState & LayerStoreState & LayerSettingsState
export default class LayerSettings extends React.Component<Props, State> {
  props: Props
  static defaultProps: DefaultProps = {
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

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  unloadHandler: any

  componentDidMount(): void {
    const { props, state, unloadHandler } = this
    const { warnIfUnsaved } = props
    const { pendingChanges } = state

    this.unloadHandler = (e) => {
      if (warnIfUnsaved && pendingChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onFormChange = (): void => {
    this.setState({
      pendingChanges: true
    })
  }
  onValid = (): void => {
    this.setState({
      canSubmit: true
    })

    if (this.props.onValid) {
      this.props.onValid()
    }
  }
  onInvalid = (): void => {
    this.setState({
      canSubmit: false
    })

    if (this.props.onInValid) {
      this.props.onInValid()
    }
  }
  onSubmit = (model: Record<string, any>): void => {
    const { t, props, state, setState } = this

    const { owned_by_group_id, _csrf } = state
    const { groups, onSubmit } = props

    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    model.source = Locales.formModelToLocalizedString(model, 'source')
    let initLayer = false

    if (!owned_by_group_id) {
      initLayer = true
    }

    if (!model.group && owned_by_group_id) {
      // editing settings on an existing layer
      model.group = owned_by_group_id
    } else if (!model.group && groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = groups[0].group_id
    }

    if (!model.private) {
      model.private = false
    }

    LayerActions.saveSettings(model, initLayer, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setState({
          pendingChanges: false
        })

        onSubmit()
      }
    })
  }
  onPrev = (): void => {
    if (this.props.onPrev) this.props.onPrev()
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      onPrev,
      onSubmit,
      onFormChange,
      onValid,
      onInvalid
    } = this
    const { status, license, name, description, source, canSubmit } = state
    const { showGroup, groups, submitText, showPrev, prevText } = props

    if (showGroup && (!groups || groups.length === 0)) {
      return (
        <div className='container'>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <h5>{t('Please Join a Group')}</h5>
            <p>{t('Please create or join a group before creating a layer.')}</p>
          </Row>
        </div>
      )
    }

    return (
      <div
        style={{
          marginRight: '2%',
          marginLeft: '2%',
          marginTop: '10px'
        }}
      >
        <Formsy
          onValidSubmit={onSubmit}
          onChange={onFormChange}
          onValid={onValid}
          onInvalid={onInvalid}
        >
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Col
              sm={24}
              md={12}
              style={{
                padding: '0px 20px'
              }}
            >
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <MultiTextInput
                  name='name'
                  id='layer-name'
                  label={{
                    en: 'Name',
                    fr: 'Nom',
                    es: 'Nombre',
                    it: 'Nome',
                    id: 'Nama',
                    pt: 'Nome'
                  }}
                  value={name}
                  validations='maxLength:100'
                  validationErrors={{
                    maxLength: t('Must be 100 characters or less.')
                  }}
                  length={100}
                  tooltipPosition='top'
                  tooltip={t('Short Descriptive Name for the Layer')}
                  required
                  t={t}
                />
              </Row>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <MultiTextArea
                  name='description'
                  label={{
                    en: 'Description',
                    fr: 'Description',
                    es: 'Descripción',
                    it: 'Descrizione',
                    id: 'Deskripsi',
                    pt: 'Descrição'
                  }}
                  value={description}
                  validations='maxLength:1000'
                  validationErrors={{
                    maxLength: t('Description must be 1000 characters or less.')
                  }}
                  length={1000}
                  tooltipPosition='top'
                  tooltip={t('Brief Description of the Layer')}
                  required
                  t={t}
                />
              </Row>
              {showGroup && (
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <SelectGroup
                    groups={groups}
                    type='layer'
                    canChangeGroup={status !== 'published'}
                    editing={status === 'published'}
                  />
                </Row>
              )}
            </Col>
            <Col
              sm={24}
              md={12}
              style={{
                padding: '0px 20px'
              }}
            >
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <MultiTextInput
                  name='source'
                  id='layer-source'
                  label={{
                    en: 'Source',
                    fr: 'Source',
                    es: 'Fuente',
                    it: 'Sorgente',
                    pt: 'Fonte',
                    id: 'Sumber'
                  }}
                  value={source}
                  validations='maxLength:300'
                  validationErrors={{
                    maxLength: t('Must be 300 characters or less.')
                  }}
                  length={300}
                  tooltipPosition='top'
                  tooltip={t('Short Description of the Layer Source')}
                  required
                  t={t}
                />
              </Row>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <Select
                  name='license'
                  id='layer-license-select'
                  label={t('License')}
                  startEmpty={false}
                  value={license || 'none'}
                  options={Licenses.getLicenses(t)}
                  note={t('Select a license for more information')}
                  tooltipPosition='top'
                  tooltip={t('Layer License')}
                  required
                />
              </Row>
            </Col>
          </Row>
          <div className='container'>
            {showPrev && (
              <div className='left'>
                <Button type='primary' onClick={onPrev}>
                  {prevText}
                </Button>
              </div>
            )}
            <div
              style={{
                float: 'right'
              }}
            >
              <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                {submitText}
              </Button>
            </div>
          </div>
        </Formsy>
      </div>
    )
  }
}
