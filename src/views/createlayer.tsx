import type { Node, Element } from 'React'
import React from 'react'
import slugify from 'slugify'
import { Steps, Row } from 'antd'
import Header from '../components/header'
import Step1 from '../components/CreateLayer/Step1'
import Step2 from '../components/CreateLayer/Step2'
import Step3 from '../components/CreateLayer/Step3'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import LayerStore from '../stores/layer-store'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import type { Group } from '../stores/GroupStore'
import type { Layer } from '../types/layer'
import type { LayerStoreState } from '../stores/layer-store'
import type { LocaleStoreState } from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import $ from 'jquery'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const debug = debugFactory('CreateLayer')
const Step = Steps.Step
type Props = {
  groups: Array<Group>
  layer: Layer
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  step: number
} & LayerStoreState &
  LocaleStoreState
export default class CreateLayer extends React.Component<Props, State> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }
  state: State = {
    step: 1
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

    Reflux.rehydrate(LayerStore, props.layer)
  }

  componentDidMount() {
    const _this = this

    window.addEventListener('onunload', (e) => {
      if (
        _this.state.layer_id &&
        _this.state.layer_id !== -1 &&
        !_this.state.complete
      ) {
        $.ajax({
          type: 'POST',
          url: '/api/layer/admin/delete',
          contentType: 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({
            layer_id: _this.state.layer_id,
            _csrf: _this.state._csrf
          }),
          async: false,

          success() {},

          error(msg) {
            debug.log(msg)
          }
        })
      }
    })

    this.unloadHandler = (e) => {
      if (!_this.state.complete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  unloadHandler: any

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  submit: any | ((layerId: number, name: LocalizedString) => void) = (
    layerId: number,
    name: LocalizedString
  ) => {
    window.location = '/layer/info/' + layerId + '/' + slugify(this.t(name))
  }
  nextStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step + 1
    })
  }
  prevStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step - 1
    })
  }

  render(): Element<'div'> | Node {
    const { t } = this
    const { headerConfig, groups, mapConfig } = this.props
    const { step } = this.state

    if (!groups || groups.length === 0) {
      return (
        <div>
          <Header {...headerConfig} />
          <main>
            <div className='container'>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <h5>{t('Please Join a Group')}</h5>
                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
              </Row>
            </div>
          </main>
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...headerConfig} />
          <main
            style={{
              height: '100%'
            }}
          >
            <div
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                marginTop: '10px',
                height: '100%'
              }}
            >
              <Row
                style={{
                  padding: '20px'
                }}
              >
                <Steps size='small' current={step - 1}>
                  <Step title={t('Data')} />
                  <Step title={t('Metadata')} />
                  <Step title={t('Style')} />
                  <Step title={t('Complete')} />
                </Steps>
              </Row>
              <Row
                style={{
                  height: 'calc(100% - 65px)'
                }}
              >
                {step === 1 && (
                  <Step1 onSubmit={this.nextStep} mapConfig={mapConfig} />
                )}
                {step === 2 && (
                  <Step2
                    groups={groups}
                    showPrev
                    onPrev={this.prevStep}
                    onSubmit={this.nextStep}
                  />
                )}
                {step === 3 && (
                  <Step3
                    onPrev={this.prevStep}
                    onSubmit={this.submit}
                    mapConfig={mapConfig}
                  />
                )}
              </Row>
            </div>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
