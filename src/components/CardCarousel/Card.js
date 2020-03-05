// @flow
import React from 'react'
import GroupTag from '../Groups/GroupTag'
import Lock from '@material-ui/icons/Lock'
import LockOpen from '@material-ui/icons/LockOpenTwoTone'
import { Card, Tooltip } from 'antd'

export type CardConfig = {|
  title?: LocalizedString,
  description?: LocalizedString,
  showDescription?: boolean,
  image_url?: string,
  link: string,
  group?: {
    group_id: string,
    name: LocalizedString
  },
  data: Object,
  type: string,
  private?: boolean,
  public?: boolean,
  draft?: boolean,
  onClick?: Function
|}

type Props = {
  t: Function,
  showAddButton?: boolean
} & CardConfig

export default class MapHubsCard extends React.PureComponent<Props, void> {
  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data)
    } else if (this.props.link) {
      if (typeof window !== 'undefined') {
        window.location = this.props.link
      }
    }
  }

  render () {
    const {group, showAddButton, type, t, image_url, showDescription} = this.props

    let iconName = ''
    let toolTipText = ''
    if (type) {
      if (type === 'layer') {
        iconName = 'layers'
        toolTipText = t('Layer')
      } else if (type === 'group') {
        iconName = 'supervisor_account'
        toolTipText = t('Group')
      } else if (type === 'story') {
        iconName = 'library_books'
        toolTipText = t('Story')
      } else if (type === 'map') {
        iconName = 'map'
        toolTipText = t('Map')
      }
    }

    let addButton = ''
    if (showAddButton) {
      addButton = (
        <a
          className='btn-floating halfway-fab waves-effect waves-light red'
          style={{top: '10px', right: '10px'}}
        >
          <i className='material-icons'>add</i>
        </a>
      )
    }
    let image = ''
    if (type === 'story' && !image_url) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
          {addButton}
        </div>
      )
    } else if (type === 'story' && image_url) {
      image = (
        <div style={{height: '150px', width: '200px', backgroundImage: 'url(' + image_url + ')', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          {addButton}
        </div>

      )
    } else if (type === 'group' && !image_url) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>supervisor_account</i>
          {addButton}
        </div>
      )
    } else if (type === 'group' && image_url) {
      image = (
        <div className='card-image'>
          <img className='responsive-img' style={{height: '150px', width: 'auto', margin: 'auto'}} src={image_url} />
          {addButton}
        </div>
      )
    } else {
      image = (
        <div className='card-image'>
          <img width='200' height='150' src={image_url} />
          {addButton}
        </div>
      )
    }

    return (
      <Card
        hoverable
        style={{ width: 200, height: 300 }}
        onClick={this.onClick}
        bodyStyle={{height: '100%', padding: '0'}}
      >
        <style jsx global>{`
          .card-image {
            border-bottom: 1px solid #757575;
            display: flex;
          }
        `}
        </style>
        {image}

        {this.props.private &&
          <div style={{position: 'absolute', top: '5px', right: '5px'}}>
            <Tooltip title={t('Private')} placement='bottom'>
              <Lock style={{color: '#323333'}} />
            </Tooltip>
          </div>}
        <div className='card-content word-wrap' style={{height: '150x', padding: '5px'}}>

          <b>{t(this.props.title)}</b> <br />
          {
            showDescription &&
              <p className='fade' style={{fontSize: '12px'}}> {t(this.props.description)}</p>
          }
          {group &&
            <div className='valign-wrapper' style={{position: 'absolute', bottom: 5, left: 5}}>
              <GroupTag group={group.group_id} />
            </div>}
          {this.props.public &&
            <div style={{position: 'absolute', bottom: '2px', right: '30px'}}>
              <Tooltip
                title={t('Public Sharing Enabled')}
                placement='top'
              >
                <LockOpen style={{color: 'green'}} />
              </Tooltip>
            </div>}
          {this.props.draft &&
            <>
              <div style={{position: 'absolute', top: '5px', right: '75px'}}>
                <span style={{color: 'red', fontWeight: 600}}>{t('DRAFT')}</span>
              </div>
              <div style={{position: 'absolute', bottom: '5px', right: '75px'}}>
                <span style={{color: 'red', fontWeight: 600}}>{t('DRAFT')}</span>
              </div>
            </>}
          <Tooltip title={toolTipText} placement='top'>
            <i
              className='material-icons'
              style={{position: 'absolute', bottom: '6px', right: '6px'}}
            >
              {iconName}
            </i>
          </Tooltip>
        </div>
      </Card>
    )
  }
}
