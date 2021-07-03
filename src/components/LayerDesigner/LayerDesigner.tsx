import React from 'react'
import { Row, Col, Button, Tabs, Tooltip } from 'antd'
import ColorLens from '@material-ui/icons/ColorLens'
import Label from '@material-ui/icons/Label'
import Place from '@material-ui/icons/Place'
import Code from '@material-ui/icons/Code'
import LabelSettings from './LabelSettings'
import MarkerSettings from './MarkerSettings'
import AdvancedLayerSettings from './AdvancedLayerSettings'

import MapStyles from '../Map/Styles'
import { SketchPicker, SwatchesPicker } from 'react-color'
import type { GLStyle } from '../../types/mapbox-gl-style'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false
})
const { TabPane } = Tabs
type ColorValue = {
  hex: string
  rgb: {
    r: number
    g: number
    b: number
    a: number
  }
}
type Props = {
  onColorChange: (...args: Array<any>) => void
  onStyleChange: (...args: Array<any>) => void
  onLabelsChange: (...args: Array<any>) => void
  onMarkersChange: (...args: Array<any>) => void
  onLegendChange: (...args: Array<any>) => void
  alpha: number
  style: Record<string, any>
  labels: Record<string, any>
  legend: string
  layer: Record<string, any>
  showAdvanced: boolean
}
type State = {
  color: string
  markers?: Record<string, any>
  showStyleEditor?: boolean
  showLegendEditor?: boolean
}
export default class LayerDesigner extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        alpha: number
        showAdvanced: boolean
      } = {
    alpha: 0.5,
    showAdvanced: true
  }

  constructor(props: Props) {
    super(props)
    const color = this.getColorFromStyle(props.style)
    this.state = {
      color
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    const color = this.getColorFromStyle(nextProps.style)
    this.setState({
      color
    })
  }

  getColorFromStyle = (style: GLStyle): string => {
    let color = 'rgba(255,0,0,0.65)'
    const prevColor = MapStyles.settings.get(style, 'color')

    if (prevColor) {
      color = prevColor
    }

    return color
  }
  setColorInStyle = (style: GLStyle, color: string): GLStyle => {
    style = MapStyles.settings.set(style, 'color', color)
    return style
  }
  onColorChange: any | ((color: string) => void) = (color: string) => {
    const { props } = this
    const { layer, onColorChange } = props
    const oldStyle = this.setColorInStyle(props.style, color)
    const { style, isOutlineOnly } = MapStyles.color.updateStyleColor(
      oldStyle,
      color
    )

    const legend = isOutlineOnly
      ? MapStyles.legend.outlineLegendWithColor(layer, color)
      : MapStyles.legend.legendWithColor(layer, color)

    this.setState({
      color
    })
    onColorChange(style, legend)
  }
  onColorPickerChange = (colorValue: ColorValue): void => {
    const color = `rgba(${colorValue.rgb.r},${colorValue.rgb.g},${colorValue.rgb.b},${colorValue.rgb.a})`
    this.onColorChange(color)
  }
  onStyleChange = (style: Record<string, any>): void => {
    this.props.onStyleChange(style)
  }
  onCodeStyleChange = (style: string): void => {
    style = JSON.parse(style)
    this.props.onStyleChange(style)
    this.hideStyleEditor()
  }
  onLabelsChange = (style: GLStyle, labels: Record<string, any>): void => {
    this.props.onLabelsChange(style, labels)
  }
  onMarkersChange = (style: GLStyle, markers: Record<string, any>): void => {
    this.props.onMarkersChange(style, markers)
  }
  onLegendChange = (legend: string): void => {
    this.props.onLegendChange(legend)
    this.hideLegendEditor()
  }
  showStyleEditor = (): void => {
    this.setState({
      showStyleEditor: true
    })
  }
  showLegendEditor = (): void => {
    this.setState({
      showLegendEditor: true
    })
  }
  hideStyleEditor = (): void => {
    this.setState({
      showStyleEditor: false
    })
  }
  hideLegendEditor = (): void => {
    this.setState({
      showLegendEditor: false
    })
  }
  onAdvancedSettingsChange = (style: GLStyle, legend: string): void => {
    this.props.onColorChange(style, legend)
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      onColorPickerChange,
      onLabelsChange,
      onMarkersChange,
      onAdvancedSettingsChange,
      onCodeStyleChange,
      hideStyleEditor,
      onLegendChange,
      hideLegendEditor
    } = this
    const { layer, style, labels, legend, showAdvanced } = props
    const { color, showStyleEditor, showLegendEditor } = state
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          border: '1px solid #ddd'
        }}
      >
        <style jsx global>
          {`
            .ant-tabs-content {
              height: 100%;
              width: 100%;
            }
            .ant-tabs-tabpane {
              height: 100%;
            }

            .ant-tabs-left-bar .ant-tabs-tab {
              padding: 8px 12px !important;
            }

            .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
              display: none;
            }
            .ant-tabs .ant-tabs-left-content {
              padding-left: 0;
            }
          `}
        </style>
        <Tabs
          defaultActiveKey='color'
          tabPosition='left'
          animated={false}
          style={{
            height: '100%'
          }}
        >
          <TabPane
            key='color'
            tab={
              <Tooltip title={t('Colors')} placement='right'>
                <span>
                  <ColorLens />
                </span>
              </Tooltip>
            }
          >
            <Tabs
              defaultActiveKey='palettes'
              type='card'
              animated={false}
              style={{
                height: '100%'
              }}
            >
              <TabPane key='palettes' tab={t('Palettes')}>
                <div
                  style={{
                    height: 'calc(100% - 50px)',
                    overflowY: 'auto'
                  }}
                >
                  <SwatchesPicker
                    width='100%'
                    height='100%'
                    onChange={onColorPickerChange}
                    colors={[
                      [
                        'rgba(183,28,28,0.65)',
                        'rgba(211,47,47,0.65)',
                        'rgba(244,67,54,0.65)',
                        'rgba(229,115,115,0.65)',
                        'rgba(255,205,210,0.65)'
                      ],
                      [
                        'rgba(136,14,79,0.65)',
                        'rgba(194,24,91,0.65)',
                        'rgba(233,30,99,0.65)',
                        'rgba(240,98,146,0.65)',
                        'rgba(248,187,208,0.65)'
                      ],
                      [
                        'rgba(74,20,140,0.65)',
                        'rgba(123,31,162,0.65)',
                        'rgba(156,39,176,0.65)',
                        'rgba(186,104,200,0.65)',
                        'rgba(225,190,231,0.65)'
                      ],
                      [
                        'rgba(49,27,146,0.65)',
                        'rgba(81,45,168,0.65)',
                        'rgba(103,58,183,0.65)',
                        'rgba(149,117,205,0.65)',
                        'rgba(209,196,233,0.65)'
                      ],
                      [
                        'rgba(26,35,126,0.65)',
                        'rgba(48,63,159,0.65)',
                        'rgba(63,81,181,0.65)',
                        'rgba(121,134,203,0.65)',
                        'rgba(197,202,233,0.65)'
                      ],
                      [
                        'rgba(13,71,161,0.65)',
                        'rgba(25,118,210,0.65)',
                        'rgba(33,150,243,0.65)',
                        'rgba(100,181,246,0.65)',
                        'rgba(187,222,251,0.65)'
                      ],
                      [
                        'rgba(1,87,155,0.65)',
                        'rgba(2,136,209,0.65)',
                        'rgba(3,169,244,0.65)',
                        'rgba(79,195,247,0.65)',
                        'rgba(179,229,252,0.65)'
                      ],
                      [
                        'rgba(0,96,100,0.65)',
                        'rgba(0,151,167,0.65)',
                        'rgba(0,188,212,0.65)',
                        'rgba(77,208,225,0.65)',
                        'rgba(178,235,242,0.65)'
                      ],
                      [
                        'rgba(0,77,64,0.65)',
                        'rgba(0,121,107,0.65)',
                        'rgba(0,150,136,0.65)',
                        'rgba(77,182,172,0.65)',
                        'rgba(178,223,219,0.65)'
                      ],
                      [
                        'rgba(25,77,51,0.65)',
                        'rgba(56,142,60,0.65)',
                        'rgba(76,175,80,0.65)',
                        'rgba(129,199,132,0.65)',
                        'rgba(200,230,201,0.65)'
                      ],
                      [
                        'rgba(51,105,30,0.65)',
                        'rgba(104,159,56,0.65)',
                        'rgba(139,195,74,0.65)',
                        'rgba(174,213,129,0.65)',
                        'rgba(220,237,200,0.65)'
                      ],
                      [
                        'rgba(130,119,23,0.65)',
                        'rgba(175,180,43,0.65)',
                        'rgba(205,220,57,0.65)',
                        'rgba(220,231,117,0.65)',
                        'rgba(240,244,195,0.65)'
                      ],
                      [
                        'rgba(245,127,23,0.65)',
                        'rgba(251,192,45,0.65)',
                        'rgba(255,235,59,0.65)',
                        'rgba(255,241,118,0.65)',
                        'rgba(255,249,196,0.65)'
                      ],
                      [
                        'rgba(255,111,0,0.65)',
                        'rgba(255,160,0,0.65)',
                        'rgba(255,193,7,0.65)',
                        'rgba(255,213,79,0.65)',
                        'rgba(255,236,179,0.65)'
                      ],
                      [
                        'rgba(230,81,0,0.65)',
                        'rgba(245,124,0,0.65)',
                        'rgba(255,152,0,0.65)',
                        'rgba(255,183,77,0.65)',
                        'rgba(255,224,178,0.65)'
                      ],
                      [
                        'rgba(191,54,12,0.65)',
                        'rgba(230,74,25,0.65)',
                        'rgba(255,87,34,0.65)',
                        'rgba(255,138,101,0.65)',
                        'rgba(255,204,188,0.65)'
                      ],
                      [
                        'rgba(62,39,35,0.65)',
                        'rgba(93,64,55,0.65)',
                        'rgba(121,85,72,0.65)',
                        'rgba(161,136,127,0.65)',
                        'rgba(215,204,200,0.65)'
                      ],
                      [
                        'rgba(38,50,56,0.65)',
                        'rgba(69,90,100,0.65)',
                        'rgba(96,125,139,0.65)',
                        'rgba(144,164,174,0.65)',
                        'rgba(207,216,220,0.65)'
                      ],
                      [
                        'rgba(0,0,0,0.65)',
                        'rgba(82,82,82,0.65)',
                        'rgba(150,150,150,0.65)',
                        'rgba(217,217,217,0.65)',
                        'rgba(255,255,255,0.65)'
                      ]
                    ]}
                  />
                </div>
              </TabPane>
              <TabPane key='morecolors' tab={t('More Colors')}>
                <SketchPicker
                  width='calc(100% - 20px)'
                  color={color}
                  onChangeComplete={onColorPickerChange}
                />
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane
            key='labels'
            tab={
              <Tooltip title={t('Labels')} placement='right'>
                <span>
                  <Label />
                </span>
              </Tooltip>
            }
          >
            <LabelSettings
              onChange={onLabelsChange}
              style={style}
              labels={labels}
              layer={layer}
            />
          </TabPane>
          {layer.data_type === 'point' && (
            <TabPane
              key='markers'
              tab={
                <Tooltip title={t('Markers')} placement='right'>
                  <span>
                    <Place />
                  </span>
                </Tooltip>
              }
            >
              <MarkerSettings
                onChange={onMarkersChange}
                style={style}
                color={color}
                layer={layer}
                t={t}
              />
            </TabPane>
          )}
          {showAdvanced && (
            <TabPane
              key='advanced'
              tab={
                <Tooltip title={t('Advanced')} placement='right'>
                  <span>
                    <Code />
                  </span>
                </Tooltip>
              }
            >
              <AdvancedLayerSettings
                layer={layer}
                style={style}
                onChange={onAdvancedSettingsChange}
              />
              <Row
                justify='center'
                align='middle'
                style={{
                  marginBottom: '20px',
                  textAlign: 'center'
                }}
              >
                <Col sm={24} md={12}>
                  <Button type='primary' onClick={this.showStyleEditor}>
                    {t('Style')}
                  </Button>
                </Col>
                <Col sm={24} md={12}>
                  <Button type='primary' onClick={this.showLegendEditor}>
                    {t('Legend')}
                  </Button>
                </Col>
              </Row>
            </TabPane>
          )}
        </Tabs>
        <CodeEditor
          visible={showStyleEditor}
          id='layer-style-editor'
          mode='json'
          code={JSON.stringify(style, undefined, 2)}
          title={t('Editing Layer Style')}
          onSave={onCodeStyleChange}
          onCancel={hideStyleEditor}
          t={t}
        />
        <CodeEditor
          visible={showLegendEditor}
          id='layer-legend-editor'
          mode='html'
          code={legend}
          title={t('Edit Layer Legend')}
          onSave={onLegendChange}
          onCancel={hideLegendEditor}
          t={t}
        />
      </div>
    )
  }
}
