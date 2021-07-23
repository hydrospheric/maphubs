import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'
import Layout from '../../../src/components/Layout'
import { message } from 'antd'
import PublicShareModal from '../../../src/components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../../../src/components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import EmbedCodeModal from '../../../src/components/MapUI/EmbedCodeModal'
import QueueIcon from '@material-ui/icons/Queue'
import PhotoIcon from '@material-ui/icons/Photo'
import CodeIcon from '@material-ui/icons/Code'
import PrintIcon from '@material-ui/icons/Print'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import ShareIcon from '@material-ui/icons/Share'
import { Fab, Action } from 'react-tiny-fab'
import 'react-tiny-fab/dist/styles.css'
import getConfig from 'next/config'
import useT from '../../../src/hooks/useT'
import { Map } from '../../../src/types/map'
import { Layer } from '../../../src/types/layer'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(
  () => import('../../../src/components/Map/InteractiveMap'),
  {
    ssr: false
  }
)

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type UserMapState = {
  share_id?: string
  showEmbedCode?: boolean
}

const UserMap = (): JSX.Element => {
  const publicShare = false // TODO: support public share map
  const [session] = useSession()
  const router = useRouter()
  const { t } = useT()
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [showCopyMap, setShowCopyMap] = useState(false)
  const [showPublicShare, setShowPublicShare] = useState(false)

  const slug = router.query.usermap || []
  const map_id = slug[0]

  const { data } = useSWR([
    `
  {
    map(id: "{id}") {
      map_id
      title
      position
      style
      settings
      basemap
      created_at
      updated_at
      owned_by_group_id
      share_id
    }
    mapLayers(id: "{id}") {
      layer_id
      shortid
      name
      description
      source
      data_type
      style
      legend_html
    }
    allowedToModifyMap(id: "{id}")
    mapConfig
  }
  `,
    map_id
  ])
  const stickyData: {
    map: Map
    mapLayers: Layer[]
    allowedToModifyMap: boolean
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { map, mapLayers, allowedToModifyMap, mapConfig } = stickyData

  const onEdit = (): void => {
    window.location.assign('/map/edit/' + map.map_id)
  }
  const onFullScreen = (): void => {
    let fullScreenLink = `/api/map/${map.map_id}/static/render?showToolbar=1`

    if (window.location.hash) {
      fullScreenLink = fullScreenLink += window.location.hash
    }

    window.location.assign(fullScreenLink)
  }

  const download = (): void => {
    if (!map.has_screenshot) {
      // warn the user if we need to wait for the screenshot to be created
      const closeMessage = message.loading(t('Downloading'), 0)
      setTimeout(() => {
        closeMessage()
      }, 15_000)
    }
  }

  const copyMapTitle = JSON.parse(JSON.stringify(map.title))
  // TODO: change copied map title in other languages
  copyMapTitle.en = `${copyMapTitle.en} - Copy`
  return (
    <ErrorBoundary t={t}>
      <Layout title={t(map.title)} hideFooter>
        <div
          style={{
            height: 'calc(100% - 50px)',
            marginTop: 0
          }}
        >
          <InteractiveMap
            height='calc(100vh - 50px)'
            {...map}
            layers={mapLayers}
            mapConfig={mapConfig}
            disableScrollZoom={false}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            {...map.settings}
            t={t}
          />
          <style jsx global>
            {`
              .rtf {
                z-index: 999 !important;
              }
            `}
          </style>
          {!publicShare && (
            <Fab
              mainButtonStyles={{
                backgroundColor: MAPHUBS_CONFIG.primaryColor
              }}
              position={{
                bottom: 75,
                right: 0
              }}
              event='click'
              icon={<MoreVertIcon />}
            >
              <Action
                text={t('Print/Screenshot')}
                style={{
                  backgroundColor: 'grey'
                }}
                onClick={onFullScreen}
              >
                <PrintIcon />
              </Action>
              <Action
                text={t('Embed')}
                style={{
                  backgroundColor: 'orange'
                }}
                onClick={() => {
                  setShowEmbedCode(true)
                }}
              >
                <CodeIcon />
              </Action>
              <Action
                text={t('Get Map as a PNG Image')}
                style={{
                  backgroundColor: 'green'
                }}
                onClick={download}
                download={`${t(map.title)} - ${MAPHUBS_CONFIG.productName}.png`}
                href={`/api/screenshot/map/${map.map_id}.png`}
              >
                <PhotoIcon />
              </Action>
              {session?.user && !publicShare && (
                <Action
                  text={t('Copy Map')}
                  style={{
                    backgroundColor: 'purple'
                  }}
                  onClick={() => {
                    setShowCopyMap(true)
                  }}
                >
                  <QueueIcon />
                </Action>
              )}
              {allowedToModifyMap && !publicShare && (
                <Action
                  text={t('Edit Map')}
                  style={{
                    backgroundColor: 'blue'
                  }}
                  onClick={onEdit}
                >
                  <EditIcon />
                </Action>
              )}
              {allowedToModifyMap && MAPHUBS_CONFIG.mapHubsPro && !publicShare && (
                <Action
                  text={t('Share')}
                  style={{
                    backgroundColor: 'red'
                  }}
                  onClick={() => {
                    setShowPublicShare(true)
                  }}
                >
                  <ShareIcon />
                </Action>
              )}
            </Fab>
          )}
          {allowedToModifyMap && MAPHUBS_CONFIG.mapHubsPro && !publicShare && (
            <PublicShareModal
              visible={showPublicShare}
              map_id={map.map_id}
              share_id={map.share_id}
              onClose={() => {
                setShowPublicShare(false)
              }}
            />
          )}
          {session?.user && !publicShare && (
            <CopyMapModal
              visible={showCopyMap}
              onClose={() => {
                setShowCopyMap(false)
              }}
              title={copyMapTitle}
              map_id={map.map_id}
            />
          )}
          {showEmbedCode && (
            <EmbedCodeModal
              show={showEmbedCode}
              map_id={map.map_id}
              share_id={map.share_id}
              onClose={() => {
                setShowEmbedCode(false)
              }}
            />
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default UserMap
