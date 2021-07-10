import React from 'react'
import { Row, Col } from 'antd'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  views: number
  stats: {
    maps: number
    stories: number
  }
  t: (v: string | LocalizedString) => string
}
export default function LayerInfoStats({
  views,
  stats,
  t
}: Props): JSX.Element {
  return (
    <Row
      justify='center'
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFF'
      }}
    >
      <Col
        sm={16}
        md={8}
        style={{
          textAlign: 'center'
        }}
      >
        <b>{t('Views')}</b>
        <p>{views}</p>
      </Col>
      <Col
        sm={16}
        md={8}
        style={{
          textAlign: 'center'
        }}
      >
        <b>{t('Maps')}</b>
        <p>{stats && stats.maps}</p>
      </Col>
      <Col
        sm={16}
        md={8}
        style={{
          textAlign: 'center'
        }}
      >
        <b>{t('Stories')}</b>
        <p>{stats && stats.stories}</p>
      </Col>
    </Row>
  )
}
