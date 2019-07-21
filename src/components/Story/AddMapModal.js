// @flow
import React from 'react'
import {Modal, ModalContent} from '../Modal/Modal'
import CardCarousel from '../CardCarousel/CardCarousel'
import SearchBox from '../SearchBox'
import { message } from 'antd'
import MessageActions from '../../actions/MessageActions'
import MapHubsComponent from '../MapHubsComponent'
import ErrorBoundary from '../ErrorBoundary'
import cardUtil from '../../services/card-util'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import request from 'superagent'
import {checkClientError} from '../../services/client-error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('AddMapToStory')

type Props = {
   onAdd: Function,
  onClose: Function,
  myMaps: Array<Object>,
  popularMaps: Array<Object>
}

type State = {
  show: boolean,
  searchActive: boolean,
  searchResults: Array<Object>,
  modalReady: boolean
}

export default class AddMapModal extends MapHubsComponent<Props, State> {
  static defaultProps = {
    myMaps: [],
    popularMaps: []
  }

  state = {
    show: false,
    searchActive: false,
    modalReady: false,
    searchResults: []
  }

  show = () => {
    this.setState({show: true})
  }

  onAdd = (map: Object) => {
    this.setState({show: false})
    this.props.onAdd(map)
  }

  close = () => {
    this.setState({show: false})
  }

  hide = () => {
    this.close()
  }

  handleSearch = (input: string) => {
    const {t} = this
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.maps && res.body.maps.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.maps})
              message.info(`${res.body.layers.length} ${t('Results')}`)
            } else {
              message.info(t('No Results Found'), 5)
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []})
  }

  modalReady = () => {
    this.setState({modalReady: true})
  }

  render () {
    const {t} = this
    const _this = this

    let myMaps = ''
    if (this.props.myMaps && this.props.myMaps.length > 0) {
      const myCards = this.props.myMaps.map((map, i) => {
        return cardUtil.getMapCard(map, i, [], _this.onAdd)
      })
      myMaps = (
        <div className='row' style={{width: '100%'}}>
          <div className='col s12 no-padding' style={{width: '100%'}}>
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('My Maps')}</h5>
            <div className='divider' />
            <CardCarousel cards={myCards} infinite={false} t={this.t} />
          </div>
        </div>
      )
    }

    const popularCards = this.props.popularMaps.map((map, i) => {
      return cardUtil.getMapCard(map, i, [], _this.onAdd)
    })

    let searchResults = ''
    let searchCards = []
    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        searchCards = this.state.searchResults.map((map, i) => {
          return cardUtil.getMapCard(map, i, [], _this.onAdd)
        })
        searchResults = (
          <div className='row'>
            <div className='col s12 no-padding'>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
              <div className='divider' />
              <CardCarousel infinite={false} cards={searchCards} t={this.t} />
            </div>
          </div>
        )
      } else {
        searchResults = (
          <div className='row'>
            <div className='col s12'>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
              <div className='divider' />
              <p><b>{t('No Results Found')}</b></p>
            </div>
          </div>
        )
      }
    }

    return (
      <Modal show={this.state.show} ready={this.modalReady} className='create-map-modal' dismissible={false} fixedFooter={false}>
        <ErrorBoundary>
          <ModalContent style={{padding: 0, margin: 0, height: '100%', overflow: 'hidden', width: '100%'}}>
            <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className='material-icons selected-feature-close' style={{fontSize: '35px'}}>close</i>
            </a>
            <div className='row' style={{marginTop: '10px', marginBottom: '10px', marginRight: '35px', marginLeft: '0px'}}>
              <div className='col s12'>
                <SearchBox label={t('Search Maps')} suggestionUrl='/api/maps/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
            <div className='row' style={{height: 'calc(100% - 55px)', width: '100%', overflow: 'auto', paddingRight: '3%', paddingLeft: '3%'}}>
              <div className='col s12 no-padding' style={{height: '100%', width: '100%'}}>
                {searchResults}
                {myMaps}
                <div className='row'>
                  <div className='col s12 no-padding'>
                    <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Popular Maps')}</h5>
                    <div className='divider' />
                    <CardCarousel cards={popularCards} infinite={false} t={this.t} />
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </ErrorBoundary>
      </Modal>
    )
  }
}
