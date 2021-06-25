import React from 'react'
import { Row, Col, Typography } from 'antd'
import CardCarousel from './CardCarousel'

import type { CardConfig } from './Card'
const { Title } = Typography
type Props = {
  cards: Array<CardConfig>
  title?: string
  viewAllLink?: string
  t: any
}

const CardCollection = ({
  t,
  title,
  viewAllLink,
  cards
}: Props): JSX.Element => {
  return (
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Col span={12}>
          {title && (
            <Title
              level={3}
              style={{
                margin: 0
              }}
            >
              {title}
            </Title>
          )}
        </Col>
        <Col
          span={12}
          style={{
            textAlign: 'right'
          }}
        >
          {viewAllLink && <a href={viewAllLink}>{t('View All')}</a>}
        </Col>
      </Row>
      <Row>
        <CardCarousel cards={cards} infinite={false} t={t} />
      </Row>
    </Row>
  )
}
CardCollection.defaultProps = {
  cards: []
}
export default CardCollection
