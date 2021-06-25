import React from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import Actions from '../../actions/LayerActions'
import _debounce from 'lodash.debounce'

import Locales from '../../services/locales'
import _isequal from 'lodash.isequal'
import { Modal, Row, Col, Button } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined
} from '@ant-design/icons'
const { confirm } = Modal
type Props = {
  id: number
  tag: string
  label: LocalizedString
  type: string
  options: Array<Record<string, any>>
  // if type requires a list of options
  isRequired: boolean
  showOnMap: boolean
  isName: boolean
  isDescription: boolean
  onValid: (...args: Array<any>) => any
  onInvalid: (...args: Array<any>) => any
}
type State = {
  valid: boolean
}
export default class PresetForm extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        isDescription: boolean
        isName: boolean
        isRequired: boolean
        showOnMap: boolean
      } = {
    showOnMap: true,
    isRequired: false,
    isName: false,
    isDescription: false
  }

  constructor(props: Props) {
    super(props)
    // if loading with values from the database, assume they are valid
    let valid = false
    if (props.tag) valid = true
    this.state = {
      valid
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  onFormChange: any | ((values: any) => void) = (
    values: Record<string, any>
  ) => {
    const _this = this

    values.id = this.props.id
    values.label = Locales.formModelToLocalizedString(values, 'label')
    values.tag = this.props.tag
    Actions.updatePreset(_this.props.id, values)
  }
  onValid: any | (() => void) = () => {
    this.setState({
      valid: true
    })

    const debounced = _debounce(function () {
      if (this.props.onValid) this.props.onValid()
    }, 2500).bind(this)

    debounced()
  }
  onInvalid: any | (() => void) = () => {
    this.setState({
      valid: false
    })

    const debounced = _debounce(function () {
      if (this.props.onInvalid) this.props.onInvalid()
    }, 2500).bind(this)

    debounced()
  }
  isValid: any | (() => boolean) = () => {
    return this.state.valid
  }
  onRemove: any | (() => void) = () => {
    const { t } = this
    const { id } = this.props
    confirm({
      title: t('Confirm Removal'),
      content:
        t('Are you sure you want to remove this field?') +
        ' ' +
        t('Note: this will hide the field, but will not delete the raw data.') +
        ' ' +
        t('The field will still be included in data exports.'),
      okType: 'danger',

      onOk() {
        Actions.deletePreset(id)
      }
    })
  }
  onMoveUp: any | (() => void) = () => {
    Actions.movePresetUp(this.props.id)
  }
  onMoveDown: any | (() => void) = () => {
    Actions.movePresetDown(this.props.id)
  }

  render(): JSX.Element {
    const { t } = this
    const presetOptions = [
      {
        value: 'text',
        label: t('Text')
      },
      {
        value: 'localized',
        label: t('Localized Text')
      },
      {
        value: 'number',
        label: t('Number')
      },
      {
        value: 'radio',
        label: t('Radio Buttons (Choose One)')
      },
      {
        value: 'combo',
        label: t('Combo Box (Dropdown)')
      },
      {
        value: 'check',
        label: t('Check Box (Yes/No)')
      }
    ]
    let typeOptions = ''

    if (this.props.type === 'combo' || this.props.type === 'radio') {
      typeOptions = (
        <Row>
          <TextArea
            name='options'
            label={t('Options(seperate with commas)')}
            icon='list'
            validations='maxLength:500'
            validationErrors={{
              maxLength: t('Description must be 500 characters or less.')
            }}
            length={500}
            value={this.props.options}
            tooltipPosition='top'
            tooltip={t(
              'Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green'
            )}
            t={t}
          />
        </Row>
      )
    }

    let typeStartEmpty = true
    if (this.props.type) typeStartEmpty = false
    return (
      <>
        <Row>
          <Formsy
            ref='form'
            onChange={this.onFormChange}
            onValid={this.onValid}
            onInvalid={this.onInvalid}
            style={{
              width: '100%'
            }}
          >
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col sm={24} md={12}>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Select
                    name='type'
                    id='preset-type-select'
                    label={t('Field Type')}
                    options={presetOptions}
                    value={this.props.type}
                    startEmpty={typeStartEmpty}
                    required
                  />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <MultiTextInput
                    name='label'
                    id={`preset-${this.props.id}-label`}
                    label={{
                      en: 'Label',
                      fr: 'Étiquette',
                      es: 'Etiqueta',
                      it: 'Etichetta'
                    }}
                    validations='maxLength:50'
                    validationErrors={{
                      maxLength: t('Must be 50 characters or less.')
                    }}
                    length={50}
                    value={this.props.label}
                    required
                    t={t}
                  />
                </Row>
              </Col>
              <Col
                sm={24}
                md={12}
                style={{
                  textAlign: 'center'
                }}
              >
                <Row
                  justify='center'
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Toggle
                    name='isRequired'
                    labelOff={t('Optional')}
                    labelOn={t('Required')}
                    style={{
                      paddingTop: '25px'
                    }}
                    checked={this.props.isRequired}
                  />
                </Row>
                <Row
                  justify='center'
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Toggle
                    name='showOnMap'
                    labelOff={t('Hide in Map')}
                    labelOn={t('Show in Map')}
                    style={{
                      paddingTop: '25px'
                    }}
                    checked={this.props.showOnMap}
                  />
                </Row>
                <Row
                  justify='center'
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Toggle
                    name='isName'
                    labelOff={t('Regular Field')}
                    labelOn={t('Name Field')}
                    style={{
                      paddingTop: '25px'
                    }}
                    checked={this.props.isName}
                  />
                </Row>
                <Row
                  justify='center'
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Toggle
                    name='isDescription'
                    labelOff={t('Regular Field')}
                    labelOn={t('Description Field')}
                    style={{
                      paddingTop: '25px'
                    }}
                    checked={this.props.isDescription}
                  />
                </Row>
              </Col>
            </Row>
            {typeOptions}
          </Formsy>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Col span={16}>
              <Button
                type='primary'
                onClick={this.onMoveUp}
                icon={<ArrowUpOutlined />}
              >
                {t('Move Up')}
              </Button>
              <Button
                type='primary'
                style={{
                  marginLeft: '5px'
                }}
                onClick={this.onMoveDown}
                icon={<ArrowDownOutlined />}
              >
                {t('Move Down')}
              </Button>
            </Col>
            <Col
              span={8}
              style={{
                textAlign: 'right'
              }}
            >
              <Button
                type='danger'
                onClick={this.onRemove}
                icon={<DeleteOutlined />}
              >
                {t('Remove')}
              </Button>
            </Col>
          </Row>
        </Row>
      </>
    )
  }
}
