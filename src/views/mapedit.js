// @flow
import React from 'react'
import Header from '../components/header'
import MapMaker from '../components/MapMaker/MapMaker'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

import type {Layer} from '../stores/layer-store'
import type {Group} from '../stores/GroupStore'

type Props = {
  map: Object,
  layers: Array<Layer>,
  popularLayers:Array<Layer>,
  myLayers: Array<Layer>,
  groups: Array<Group>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

export default class MapEdit extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    popularLayers: [],
    myLayers: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  mapCreated = (mapId: string, title: LocalizedString) => {
    window.location = '/map/view/' + mapId + '/' + slugify(this._o_(title))
  }

  render () {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 52px)', overflow: 'hidden'}}>
          <MapMaker onCreate={this.mapCreated}
            mapConfig={this.props.mapConfig}
            mapLayers={this.props.layers}
            basemap={this.props.map.basemap}
            map_id={this.props.map.map_id} title={this.props.map.title}
            owned_by_group_id={this.props.map.owned_by_group_id}
            position={this.props.map.position}
            settings={this.props.map.settings}
            popularLayers={this.props.popularLayers}
            myLayers={this.props.myLayers}
            groups={this.props.groups}
            edit />
        </main>
      </ErrorBoundary>
    )
  }
}
