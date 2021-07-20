import React from 'react'
import Layout from '../../src/components/Layout'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../../src/components/CardCarousel/CardCollection'
import CardSearch from '../../src/components/CardCarousel/CardSearch'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import cardUtil from '../../src/services/card-util'
import getConfig from 'next/config'
import useT from '../../src/hooks/useT'
import { Map } from '../../src/types/map'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography

const Maps = (): JSX.Element => {
  const { t } = useT()
  const { data } = useSWR(`
  {
    featuredMaps(limit: 25) {
      map_id
      title
      share_id
      owned_by_group_id
    }
    recentMaps(limit: 25) {
      map_id
      title
      share_id
      owned_by_group_id
    }
  }
  `)
  const stickyData: {
    featuredMaps: Map[]
    recentMaps: Map[]
  } = useStickyResult(data) || {}
  const { featuredMaps, recentMaps } = stickyData
  const featuredCards = featuredMaps.map((map) => cardUtil.getMapCard(map))
  const recentCards = recentMaps.map((map) => cardUtil.getMapCard(map))
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Maps')} activePage='maps'>
        <div
          style={{
            margin: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title level={2}>{t('Maps')}</Title>
            </Row>
          </div>
          <CardSearch cardType='map' />
          {!MAPHUBS_CONFIG.mapHubsPro &&
            featuredCards &&
            featuredCards.length > 0 && (
              <CardCollection
                title={t('Featured')}
                cards={featuredCards}
                viewAllLink='/maps/all'
              />
            )}
          <CardCollection
            title={t('Recent')}
            cards={recentCards}
            viewAllLink='/maps/all'
          />
          <FloatingAddButton
            onClick={() => {
              window.location.assign('/map/new')
            }}
            tooltip={t('Create New Map')}
          />
          <Row
            justify='center'
            style={{
              textAlign: 'center'
            }}
          >
            <Button type='primary' href='/maps/all'>
              {t('View All Maps')}
            </Button>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default Maps
