import React, { useState } from 'react'
import Formsy from 'formsy-react'
import { notification, Row, Col, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import MultiTextInput from '../forms/MultiTextInput'
import SelectGroup from '../Groups/SelectGroup'
import Select from '../forms/select'
import Licenses from './licenses'
import LayerActions from '../../actions/LayerActions'
import Locales from '../../services/locales'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import { useSelector } from 'react-redux'
import { Group } from '../../types/group'
type Props = {
  onSubmit: () => void
  onValid?: () => void
  onInValid?: () => void
  submitText: string
  showGroup: boolean
  warnIfUnsaved?: boolean
  groups: Group[]
}

const LayerSettings = ({
  showGroup,
  groups,
  submitText,
  warnIfUnsaved,
  onValid,
  onInValid,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(false)

  const layerState = useSelector((state: { layer: any }) => state.layer)

  useUnload((e) => {
    e.preventDefault()
    if (warnIfUnsaved && pendingChanges) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const submit = (model: Record<string, any>): void => {
    const { owned_by_group_id } = layerState
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
        setPendingChanges(false)
        onSubmit()
      }
    })
  }

  const { status, license, name, description, source } = layerState

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
        onValidSubmit={submit}
        onChange={() => {
          setPendingChanges(true)
        }}
        onValid={() => {
          setCanSubmit(true)
          if (onValid) onValid()
        }}
        onInvalid={() => {
          setCanSubmit(false)
          if (onInValid) onInValid()
        }}
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
                inputName='name'
                id='layer-name'
                label={{
                  en: 'Name',
                  fr: 'Nom',
                  es: 'Nombre',
                  it: 'Nome',
                  id: 'Nama',
                  pt: 'Nome'
                }}
                initialValue={name}
                validations='maxLength:100'
                validationErrors={{
                  maxLength: t('Must be 100 characters or less.')
                }}
                length={100}
                tooltipPosition='top'
                tooltip={t('Short Descriptive Name for the Layer')}
                required
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
                inputName='source'
                id='layer-source'
                label={{
                  en: 'Source',
                  fr: 'Source',
                  es: 'Fuente',
                  it: 'Sorgente',
                  pt: 'Fonte',
                  id: 'Sumber'
                }}
                initialValue={source}
                validations='maxLength:300'
                validationErrors={{
                  maxLength: t('Must be 300 characters or less.')
                }}
                length={300}
                tooltipPosition='top'
                tooltip={t('Short Description of the Layer Source')}
                required
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
LayerSettings.defaultProps = {
  showGroup: true
}
export default LayerSettings
