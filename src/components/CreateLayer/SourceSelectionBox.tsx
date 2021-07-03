import React from 'react'
import { Row, Col } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  onSelect: (source: string) => void
  name: string
  value: string
  icon: JSX.Element
  selected?: boolean
}
const SourceSelectionBox = ({
  name,
  value,
  onSelect,
  selected,
  icon
}: Props): JSX.Element => {
  let border = `2px solid ${MAPHUBS_CONFIG.primaryColor}`
  if (selected) border = `5px solid ${MAPHUBS_CONFIG.primaryColor}`
  return (
    <div
      className=''
      style={{
        textAlign: 'center',
        width: '100px',
        height: '90px',
        margin: 'auto',
        border,
        boxShadow: '5px 5px 10px -5px rgba(0,0,0,0.75)',
        position: 'relative'
      }}
      onClick={() => {
        onSelect(value)
      }}
    >
      <Row
        justify='center'
        align='middle'
        style={{
          height: '100%'
        }}
      >
        <Col>{icon}</Col>
      </Row>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100px'
        }}
      >
        <label>
          <span
            className='omh-accent-text'
            style={{
              fontSize: '12px'
            }}
          >
            {name}
          </span>
        </label>
      </div>
    </div>
  )
}
export default SourceSelectionBox
