// @flow
import React from 'react'
import Header from '../components/header'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {CardConfig} from '../components/CardCarousel/Card'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import {Tooltip} from 'react-tippy'
import { Row, Col } from 'antd'

type Props = {
  group: Group,
  maps: Array<Object>,
  layers: Array<Object>,
  stories: Array<Object>,
  members: Array<Object>,
  canEdit: boolean,
  headerConfig: Object,
  locale: string,
  _csrf: string,
  user: Object
}

type State = {
  mapCards: Array<CardConfig>,
  layerCards: Array<CardConfig>,
  storyCards: Array<CardConfig>
}

export default class GroupInfo extends MapHubsComponent<Props, State> {
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
    layers: [],
    stories: [],
    members: [],
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {
      mapCards: props.maps.map(cardUtil.getMapCard),
      layerCards: props.layers.map(cardUtil.getLayerCard),
      storyCards: props.stories.map(cardUtil.getStoryCard)
    }
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
  }

  render () {
    const {t} = this
    const groupId = this.props.group.group_id ? this.props.group.group_id : ''
    let editButton = ''

    if (this.props.canEdit) {
      editButton = (
        <div ref={(el) => { this.menuButton = el }}className='fixed-action-btn action-button-bottom-right'>
          <a className='btn-floating btn-large red red-text'>
            <i className='large material-icons'>more_vert</i>
          </a>
          <ul>
            <li>
              <FloatingButton
                href='/createlayer' icon='add' color='green'
                tooltip={t('Add New Layer')} tooltipPosition='left' />
            </li>
            <li>
              <FloatingButton
                href={`/group/${groupId}/admin`} icon='settings' color='blue'
                tooltip={t('Manage Group')} tooltipPosition='left' />
            </li>
          </ul>
        </div>
      )

      var addButtons = (
        <div className='valign-wrapper'>
          <a className='btn valign' style={{margin: 'auto'}} href={'/map/new?group_id=' + groupId}>{t('Make a Map')}</a>
          <a className='btn valign' style={{margin: 'auto'}} href={'/createlayer?group_id=' + groupId}>{t('Add a Layer')}</a>
          <a className='btn valign' style={{margin: 'auto'}} href={'/createstory?group_id=' + groupId}>{t('Write a Story')}</a>
        </div>
      )
    }

    let descriptionWithLinks = ''

    if (this.props.group.description) {
      const localizedDescription = this.t(this.props.group.description)
      // regex for detecting links
      const regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>")
    }
    let status = t('DRAFT')
    if (this.props.group.published) {
      status = t('Published')
    }

    const allCards = cardUtil.combineCards([this.state.mapCards, this.state.layerCards, this.state.storyCards])

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <h4>{this.t(this.props.group.name)}</h4>
          <Row>
            <Col span={12}>
              <img alt={t('Group Photo')} width='300' className='' src={'/img/resize/600?url=/group/' + groupId + '/image'} />
            </Col>
            <Col span={12}>
              <Row>
                <p><b>{t('Description: ')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}} />
              </Row>
              <Row>
                <p><b>{t('Status: ')}</b>{status}</p>
              </Row>
              <Row>
                <p><b>{t('Location: ')}</b>{this.props.group.location}</p>
              </Row>
              {this.props.group.unofficial &&
                <Row>
                  <p><b>{t('Unofficial Group')}</b> - {t('This group is maintained by Maphubs using public data and is not intended to represent the listed organization. If you represent this group and would like to take ownership please contact us.')}</p>
                </Row>
              }
            </Col>
          </Row>
          <div className='divider' />
          <Row>
            <Row>
              <CardCarousel cards={allCards} infinite={false} t={this.t} />
            </Row>
            {addButtons}
          </Row>
        </div>
        <div className='divider' />
        <div className='container'>
          <div>
            <ul className='collection with-header'>
              <li className='collection-header'>
                <h5>{t('Members')}</h5>
              </li>
              {this.props.members.map(function (user, i) {
                let icon = ''
                if (user.role === 'Administrator') {
                  icon = (
                    <Tooltip
                      title={t('Group Administrator')}
                      position='top' inertia followCursor>
                      <i className='secondary-content material-icons'>
                        supervisor_account
                      </i>
                    </Tooltip>
                  )
                }
                let image = ''
                if (user.image) {
                  image = (<img alt={t('Profile Photo')} className='circle' src={user.image} />)
                } else {
                  image = (<i className='material-icons circle'>person</i>)
                }
                return (
                  <li className='collection-item avatar' key={user.id}>
                    {image}
                    <span className='title'>{user.display_name}</span>
                    {icon}
                  </li>
                )
              })}
            </ul>
          </div>
          {editButton}
        </div>
      </ErrorBoundary>
    )
  }
}
