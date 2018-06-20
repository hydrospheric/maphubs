// @flow
import React from 'react'
import BaseMapStore from '../../stores/map/BaseMapStore'
import LegendItem from './LegendItem'
import MapHubsComponent from '../MapHubsComponent'
import type {BaseMapStoreState} from '../../stores/map/BaseMapStore'

import MapStyles from './Styles'

type Props = {|
  title?: LocalizedString,
  layers: Array<Object>,
  hideInactive: boolean,
  collapsible: boolean,
  collapseToBottom: boolean,
  showLayersButton: boolean,
  mapLayersActivatesID?: string,
  openLayersPanel?: Function,
  maxHeight: string,
  style: Object
|}

type State = {|
  collapsed: boolean
|} & BaseMapStoreState

export default class MiniLegend extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    layers: [],
    hideInactive: true,
    collapsible: true,
    collapseToBottom: false,
    showLayersButton: true,
    maxHeight: '100%',
    style: {}
  }

  state: State = {
    collapsed: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(BaseMapStore)
  }

  toggleCollapsed = (e: Event) => {
    if (this.props.collapsible && e.target.id !== 'legend-settings') {
      this.setState({
        collapsed: !this.state.collapsed
      })
    }
  }

  openLayersPanel = () => {
    if(this.props.openLayersPanel) {
      this.props.openLayersPanel()
    }
  }


  render () {
    const _this = this
    const {collapsed} = this.state

    let layersButton = ''
    if (this.props.showLayersButton) {
      layersButton = (
        <a
          href='#'
          className='sidenav-trigger'
          data-target={this.props.mapLayersActivatesID}
          onClick={this.openLayersPanel}
          style={{
            position: 'absolute',
            right: '20px',
            top: '0px',
            display: 'inherit',
            height: '32px',
            zIndex: '100',
            borderRadius: '4px',
            lineHeight: '32px',
            textAlign: 'center',
            width: '32px'
          }}
        >
          <i className='material-icons'
            id='legend-settings'
            style={{height: '32px',
              lineHeight: '32px',
              width: '32px',
              color: '#000',
              cursor: 'pointer',
              borderStyle: 'none',
              textAlign: 'center',
              fontSize: '18px'}}
          >settings</i>
        </a>
      )
    }

    let titleText = ''
    let titleFontSize = '15px'
    if (this.props.title) {
      titleText = this._o_(this.props.title)
      if (titleText) {
        if (titleText.length > 80) {
          titleFontSize = '8px'
        } else if (titleText.length > 60) {
          titleFontSize = '11px'
        } else if (titleText.length > 40) {
          titleFontSize = '13px'
        }
      } else {
        // if localized text is empty
        titleText = this.__('Legend')
      }
    } else {
      titleText = this.__('Legend')
    }

    let title = ''
    if (this.props.collapsible) {
      let iconName
      if (this.props.collapseToBottom) {
        if (collapsed) {
          iconName = 'keyboard_arrow_up'
        } else {
          iconName = 'keyboard_arrow_down'
        }
      } else {
        if (collapsed) {
          iconName = 'keyboard_arrow_down'
        } else {
          iconName = 'keyboard_arrow_up'
        }
      }

      title = (
        <div className='row no-margin' style={{height: '32px', width: '100%'}}>
          <div className='col s10 no-padding valign-wrapper' style={{height: '32px'}}>
            <h6 className='black-text valign word-wrap' style={{
              padding: '0.2rem',
              marginLeft: '2px',
              marginTop: '0px',
              marginBottom: '2px',
              fontWeight: '500',
              fontSize: titleFontSize
            }}>{titleText}</h6>
          </div>
          <div className='col s2 no-padding valign'>
            {layersButton}
            <i ref='titleIcon' className='material-icons icon-fade-in' style={{float: 'right', marginRight: 0, height: '100%', lineHeight: '32px'}}>{iconName}</i>
          </div>
        </div>
      )
    } else {
      title = (
        <div className='row no-margin valign-wrapper' style={{height: '32px', width: '100%'}}>
          <h6 className='black-text valign' style={{
            padding: '0.2rem',
            marginLeft: '2px',
            fontWeight: '500',
            fontSize: titleFontSize
          }}>{titleText}</h6>
          <div className='col s2 no-padding valign'>
            {layersButton}
          </div>
        </div>
      )
    }

    let allowScroll = true
    if (collapsed || this.props.layers.length === 1) {
      allowScroll = false
    }

    let contentHeight = `calc(${this.props.maxHeight} - 32px)`
    let legendHeight = this.props.maxHeight
    if (collapsed) {
      contentHeight = '0px'
      legendHeight = '0px'
    }

    // var style = this.props.style;
    // style.height = '9999px'; //needed for the flex box to work correctly

    return (
      <div style={this.props.style}>
        <ul ref='legend' className='collapsible'
          style={{
            zIndex: 1,
            textAlign: 'left',
            margin: 0,
            position: 'absolute',
            height: legendHeight,
            width: '100%',
            boxShadow: 'none',
            pointerEvents: 'none',
            border: 'none'}}>
          <li className='z-depth-1 active'
            style={{
              backgroundColor: '#FFF',
              height: 'auto',
              pointerEvents: 'auto',
              borderTop: '1px solid #ddd',
              borderRight: '1px solid #ddd',
              borderLeft: '1px solid #ddd'}}>
            <div className='collapsible-header no-padding' style={{height: '32px', minHeight: '32px'}} onClick={this.toggleCollapsed}>
              {title}
            </div>
            <div className='collapsible-body'
              style={{
                display: collapsed ? 'none' : 'flex',
                maxHeight: contentHeight,
                flexDirection: 'column',
                borderBottom: 'none'}}>
              <div className='no-margin'
                style={{
                  overflowX: 'hidden',
                  overflowY: allowScroll ? 'auto' : 'hidden',
                  maxHeight: contentHeight,
                  padding: '5px'}}>
                {
                  this.props.layers.map((layer) => {
                    let active = MapStyles.settings.get(layer.style, 'active')
                    if (typeof active === 'undefined') {
                      layer.style = MapStyles.settings.set(layer.style, 'active', true)
                      active = true
                    }
                    if (_this.props.hideInactive && !active) {
                      return null
                    }
                    return (<LegendItem key={layer.layer_id} layer={layer} />)
                  })
                }

                <div className='base-map-legend' style={{lineHeight: '0.75em', padding: '2px'}}>
                  <span style={{fontSize: '6px', float: 'left', backgroundColor: '#FFF'}}
                    className='grey-text align-left'>{this.__('Base Map')} - <span className='no-margin no-padding' dangerouslySetInnerHTML={{__html: this.state.attribution}} /></span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
