import React from 'react'
import { Row, Divider, notification, message, Typography, Button } from 'antd'
import { CloseSquareFilled } from '@ant-design/icons'
import request from 'superagent'
import SearchBox from '../SearchBox'
import CardCollection from './CardCollection'
import cardUtil from '../../services/card-util'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { LocalizedString } from '../../types/LocalizedString'
const { Title } = Typography
type Props = {
  cardType: string
  // layer, group, or map
  t: (v: string | LocalizedString) => string
}
type State = {
  searchResults: Array<Record<string, any>>
  searchActive: boolean
}
const cardTypes = {
  group: {
    label: 'Search Groups',
    suggestionUrl: '/api/groups/search/suggestions',
    searchUrl: '/api/groups/search?q=',
    dataIndex: 'groups',
    getCard: cardUtil.getGroupCard
  },
  layer: {
    label: 'Search Layers',
    suggestionUrl: '/api/layers/search/suggestions',
    searchUrl: '/api/layers/search?q=',
    dataIndex: 'layers',
    getCard: cardUtil.getLayerCard
  },
  map: {
    label: 'Search Maps',
    suggestionUrl: '/api/maps/search/suggestions',
    searchUrl: '/api/maps/search?q=',
    dataIndex: 'maps',
    getCard: cardUtil.getMapCard
  }
}
export default class CardSearch extends React.Component<Props, State> {
  state: State = {
    searchResults: [],
    searchActive: false
  }
  handleSearch: (input: string) => Promise<void> = async (input: string) => {
    const { t, cardType } = this.props
    const config = cardTypes[cardType]
    console.log('searching for: ' + input)

    try {
      const res = await request
        .get(urlUtil.getBaseUrl() + config.searchUrl + input)
        .type('json')
        .accept('json')
      const searchResults = res.body[config.dataIndex]

      if (searchResults && searchResults.length > 0) {
        this.setState({
          searchActive: true,
          searchResults
        })
        message.info(`${searchResults.length} ${t('Results')}`)
      } else {
        message.info(t('No Results Found'), 5)
      }
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }
  resetSearch: () => void = () => {
    this.setState({
      searchActive: false,
      searchResults: []
    })
  }

  render(): JSX.Element {
    const { t, cardType } = this.props
    const { searchActive, searchResults } = this.state
    const config = cardTypes[cardType]
    const searchCards = searchResults
      ? searchResults.map((result) => config.getCard(result))
      : []
    return (
      <>
        <Row
          justify='end'
          style={{
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <SearchBox
              label={t(config.label)}
              suggestionUrl={config.suggestionUrl}
              onSearch={this.handleSearch}
              onReset={this.resetSearch}
            />
          </div>
        </Row>
        <Row>
          {searchActive && (
            <>
              {searchResults && searchResults.length > 0 && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      zIndex: 999
                    }}
                  >
                    <Button
                      size='small'
                      onClick={this.resetSearch}
                      icon={<CloseSquareFilled />}
                    >
                      {t('Clear Results')}
                    </Button>
                  </div>
                  <CardCollection
                    title={t('Search Results')}
                    cards={searchCards}
                    t={t}
                  />
                </>
              )}

              {searchResults && searchResults.length === 0 && (
                <Row>
                  <Title level={3}>{t('Search Results')}</Title>

                  <Divider />
                  <p>
                    <b>{t('No Results Found')}</b>
                  </p>
                </Row>
              )}
            </>
          )}
        </Row>
      </>
    )
  }
}
