import React from 'react'
import Header from '../components/header'
import MapMaker from '../components/MapMaker/MapMaker'
import slugify from 'slugify'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type { Layer } from '../types/layer'
import type { Group } from '../stores/GroupStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  map: Record<string, any>
  layers: Array<Layer>
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
export default class MapEdit extends React.Component<Props, void> {
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
        myLayers: Array<any>
        popularLayers: Array<any>
      } = {
    popularLayers: [],
    myLayers: []
  }

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

    const baseMapContainerInit: {
      baseMap: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      baseMap: props.map.basemap,
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }

  mapCreated: any | ((mapId: string, title: LocalizedString) => void) = (
    mapId: string,
    title: LocalizedString
  ) => {
    window.location = '/map/view/' + mapId + '/' + slugify(this.t(title))
  }

  render(): JSX.Element {
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...this.props.headerConfig} />
          <main
            style={{
              height: 'calc(100% - 52px)',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <MapMaker
              onCreate={this.mapCreated}
              mapConfig={this.props.mapConfig}
              mapLayers={this.props.layers}
              map_id={this.props.map.map_id}
              title={this.props.map.title}
              owned_by_group_id={this.props.map.owned_by_group_id}
              position={this.props.map.position}
              settings={this.props.map.settings}
              popularLayers={this.props.popularLayers}
              myLayers={this.props.myLayers}
              groups={this.props.groups}
              edit
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
