/* eslint-disable unicorn/numeric-separators-style */
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'
import Layout from '../../src/components/Layout'
import slugify from 'slugify'
import Comments from '../../src/components/Comments'
import FeatureProps from '../../src/components/Feature/FeatureProps'
import FeatureNotes from '../../src/components/Feature/FeatureNotes'
import InteractiveMap from '../../src/components/Map/InteractiveMap'
import { Tabs, Row, Col } from 'antd'
import useT from '../../src/hooks/useT'

import {
  FeatureArea,
  FeatureLocation,
  FeatureExport,
  FeaturePhoto,
  ForestReportEmbed
} from '../../src/components/Feature'

import ErrorBoundary from '../../src/components/ErrorBoundary'
import { getLayer } from '../../src/components/Feature/Map/layer-feature'
import getConfig from 'next/config'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { FeatureInfo } from '../../src/types/feature'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const TabPane = Tabs.TabPane

const FeaturePage = (): JSX.Element => {
  const router = useRouter()
  const [session] = useSession()
  const { t, locale } = useT()
  const mapRef = useRef(null)
  const [tab, setTab] = useState('data')
  const [frActive, setFrActive] = useState(false)

  const [layer_id, mhid] = router.query.feature as string[]

  const { data } = useSWR(`
  {
    featureInfo(layer_id: "${layer_id}", mhid: "${mhid}") {
      feature:  {
        name
        type
        features
        layer_id
        bbox
        mhid
      }
      notes
      photo
      layer
      canEdit
    }
    mapConfig
  }
  `)
  const stickyData: {
    featureInfo: FeatureInfo
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || { featureInfo: {} }
  const { featureInfo, mapConfig } = stickyData
  const { feature, notes, photo, layer, canEdit } = featureInfo

  const maplayer = getLayer(layer, feature)

  // TODO: initialize redux FR State

  /*
    const layer = getLayer(props.layer, feature)
    let glStyle = {}

    if (layer.style) {
      glStyle = JSON.parse(JSON.stringify(layer.style))
    }

    this.FRState = new FRContainer({
      geoJSON: feature,
      featureLayer: layer,
      glStyle,
      mapLayers: [layer],
      mapConfig,
      FRRemainingThreshold: mapConfig
        ? mapConfig.FRRemainingThreshold
        : undefined
    })
    */

  const selectTab = (selectedTab: string) => {
    setTab(selectedTab)

    if (selectedTab === 'forestreport' || tab === 'forestreport') {
      setFrActive(true)
    }
  }

  const frToggle = (id: string): void => {
    if (mapRef.current) {
      switch (id) {
        case 'remaining': {
          mapRef.current.toggleVisibility(99999901)
          break
        }
        case 'loss': {
          mapRef.current.toggleVisibility(99999905)
          break
        }
        case 'glad': {
          mapRef.current.toggleVisibility(99999902)
          break
        }
        case 'ifl': {
          mapRef.current.toggleVisibility(99999903)
          break
        }
        case 'iflloss': {
          mapRef.current.toggleVisibility(99999904)
          break
        }
        // No default
      }
    }
  }

  let geojsonFeature
  let geoJSONProps

  if (feature.features && feature.features.length > 0) {
    geojsonFeature = feature.features[0]
    geoJSONProps = feature.features[0].properties
  }

  const baseUrl = urlUtil.getBaseUrl()
  // fix possible error if layer.name doesn't translate correctly
  let layerName = 'unknown'

  if (layer.name) {
    const translatedLayerName = t(layer.name)

    if (translatedLayerName && typeof translatedLayerName === 'string') {
      layerName = translatedLayerName
    }
  }

  const layerUrl = `${baseUrl}/layer/info/${layer.layer_id}/${slugify(
    layerName
  )}`
  let gpxLink

  if (layer.data_type === 'polygon') {
    gpxLink = `${baseUrl}/api/feature/gpx/${layer.layer_id}/${mhid}/feature.gpx`
  }

  // const firstSource = Object.keys(layer.style.sources)[0]
  // const presets = MapStyles.settings.getSourceSetting(layer.style, firstSource, 'presets')
  const presets = layer.presets
  let isPolygon

  if (
    geojsonFeature &&
    geojsonFeature.geometry &&
    (geojsonFeature.geometry.type === 'Polygon' ||
      geojsonFeature.geometry.type === 'MultiPolygon')
  ) {
    isPolygon = true
  }

  const { mapLayers, glStyle } = FRState.state

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('')}>
        <div
          style={{
            height: 'calc(100% - 52px)',
            marginTop: '0px'
          }}
        >
          <Row
            style={{
              height: '100%',
              margin: 0
            }}
          >
            <Col
              span={12}
              style={{
                height: '100%'
              }}
            >
              <style jsx global>
                {`
                  .ant-tabs-content {
                    height: calc(100% - 44px);
                  }
                  .ant-tabs-tabpane {
                    height: 100%;
                  }

                  .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
                    display: none;
                  }

                  .ant-tabs-nav-container {
                    margin-left: 5px;
                  }
                `}
              </style>
              <Row
                style={{
                  height: '100%',
                  overflowY: 'hidden'
                }}
              >
                <Tabs
                  defaultActiveKey='data'
                  onChange={selectTab}
                  style={{
                    height: '100%',
                    width: '100%'
                  }}
                  tabBarStyle={{
                    marginBottom: 0
                  }}
                  animated={false}
                >
                  <TabPane
                    tab={t('Info')}
                    key='data'
                    style={{
                      height: '100%'
                    }}
                  >
                    <Row
                      style={{
                        height: '100%'
                      }}
                    >
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          border: '1px solid #ddd'
                        }}
                      >
                        <FeaturePhoto photo={photo} canEdit={canEdit} t={t} />
                        <div
                          style={{
                            marginLeft: '5px',
                            overflowY: 'auto'
                          }}
                        >
                          <p
                            style={{
                              fontSize: '16px'
                            }}
                          >
                            <b>{t('Layer:')} </b>
                            <a href={layerUrl}>{t(layer.name)}</a>
                          </p>
                          <FeatureLocation
                            geojson={geojsonFeature}
                            t={t}
                            locale={locale}
                          />
                          {isPolygon && (
                            <FeatureArea geojson={geojsonFeature} />
                          )}
                        </div>
                      </Col>
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          border: '1px solid #ddd'
                        }}
                      >
                        <div
                          style={{
                            overflow: 'auto',
                            height: 'calc(100% - 53px)'
                          }}
                        >
                          <FeatureProps
                            data={geoJSONProps}
                            presets={presets}
                            t={t}
                          />
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  {MAPHUBS_CONFIG.FR_ENABLE && session?.user && (
                    <TabPane
                      tab={t('Forest Report')}
                      key='forestreport'
                      style={{
                        height: '100%',
                        overflow: 'hidden',
                        padding: 0
                      }}
                    >
                      {frActive && (
                        <ForestReportEmbed onModuleToggle={frToggle} />
                      )}
                    </TabPane>
                  )}
                  {MAPHUBS_CONFIG.enableComments && (
                    <TabPane tab={t('Discussion')} key='discussion'>
                      <ErrorBoundary t={t}>
                        <Comments />
                      </ErrorBoundary>
                    </TabPane>
                  )}
                  <TabPane
                    tab={t('Notes')}
                    key='notes'
                    style={{
                      position: 'relative',
                      height: '100%'
                    }}
                  >
                    <FeatureNotes
                      initialNotes={notes}
                      canEdit={canEdit}
                      layer_id={layer.layer_id}
                      mhid={mhid}
                    />
                  </TabPane>
                  <TabPane
                    tab={t('Export')}
                    key='export'
                    style={{
                      position: 'relative',
                      height: '100%',
                      padding: '10px'
                    }}
                  >
                    <FeatureExport
                      mhid={mhid}
                      name={feature.name}
                      layer_id={layer.layer_id}
                      data_type={layer.data_type}
                      disable_export={layer.disable_export}
                    />
                  </TabPane>
                </Tabs>
              </Row>
            </Col>
            <Col
              span={12}
              style={{
                height: '100%'
              }}
            >
              <InteractiveMap
                ref={mapRef}
                height='100%'
                fitBounds={feature.bbox}
                layers={mapLayers}
                style={glStyle}
                map_id={layer.layer_id}
                mapConfig={mapConfig}
                disableScrollZoom={false}
                title={layer.name}
                hideInactive
                showTitle={false}
                showLegendLayersButton={false}
                gpxLink={gpxLink}
                t={t}
                locale={locale}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              />
            </Col>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default FeaturePage
