// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {
  maps: Array<Object>,
  user: Object,
  myMaps: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class UserMaps extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    maps: [],
    user: {},
    myMaps: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const cards = this.props.maps.map(cardUtil.getMapCard)

    let createMaps = ''
    if (this.props.myMaps) {
      createMaps = (
        <div>
          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/map/new' icon='add'
              tooltip={this.__('Create New Map')} tooltipPosition='top' />
          </div>
        </div>
      )
    }

    let myMaps = ''
    if (!this.props.maps || this.props.maps.length === 0) {
      myMaps = (
        <div className='row' style={{height: 'calc(100% - 100px)'}}>
          <div className='valign-wrapper' style={{height: '100%'}}>
            <div className='valign align-center center-align' style={{width: '100%'}}>
              <h5>{this.__('Click the button below to create your first map')}</h5>
            </div>
          </div>
        </div>
      )
    } else {
      myMaps = (
        <div className='row'>
          <div className='col s12'>
            <h4>{this.__('My Maps')}</h4>
            <CardCarousel infinite={false} cards={cards} t={this.t} />
          </div>
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 70px)'}}>
          {myMaps}
          {createMaps}
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
