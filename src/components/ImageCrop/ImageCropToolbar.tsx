import React from 'react'
import { Row, Button, Tooltip } from 'antd'
import CropOriginal from '@material-ui/icons/CropOriginal'
import Crop169 from '@material-ui/icons/Crop169'
import Crop32 from '@material-ui/icons/Crop32'
import CropSquare from '@material-ui/icons/CropSquare'
import Restore from '@material-ui/icons/Restore'
import ZoomIn from '@material-ui/icons/ZoomIn'
import ZoomOut from '@material-ui/icons/ZoomOut'
type Props = {
  t: (...args: Array<any>) => any
  lockAspect?: boolean
  zoomIn: (...args: Array<any>) => any
  zoomOut: (...args: Array<any>) => any
  cropOriginal: (...args: Array<any>) => any
  aspect16by9: (...args: Array<any>) => any
  aspect3by2: (...args: Array<any>) => any
  aspectSquare: (...args: Array<any>) => any
  resetCropPosition: (...args: Array<any>) => any
}
export default class ImageCropToolbar extends React.Component<Props, void> {
  shouldComponentUpdate(): boolean {
    return false
  }

  render(): JSX.Element {
    const {
      lockAspect,
      zoomIn,
      zoomOut,
      cropOriginal,
      aspect16by9,
      aspect3by2,
      aspectSquare,
      resetCropPosition,
      t
    } = this.props
    return (
      <Row
        align='middle'
        style={{
          height: '50px'
        }}
      >
        <Tooltip title={t('Zoom In')} placement='bottom'>
          <Button
            type='primary'
            shape='circle'
            style={{
              marginRight: '10px'
            }}
            onClick={zoomIn}
          >
            <ZoomIn />
          </Button>
        </Tooltip>
        <Tooltip title={t('Zoom Out')} placement='bottom'>
          <Button
            type='primary'
            shape='circle'
            style={{
              marginRight: '10px'
            }}
            onClick={zoomOut}
          >
            <ZoomOut />
          </Button>
        </Tooltip>
        {!lockAspect && (
          <Tooltip title={t('Image Default')} placement='bottom'>
            <Button
              type='primary'
              shape='circle'
              style={{
                marginRight: '10px'
              }}
              onClick={cropOriginal}
            >
              <CropOriginal />
            </Button>
          </Tooltip>
        )}
        {!lockAspect && (
          <Tooltip title={t('16 by 9')} placement='bottom'>
            <Button
              type='primary'
              shape='circle'
              style={{
                marginRight: '10px'
              }}
              onClick={aspect16by9}
            >
              <Crop169 />
            </Button>
          </Tooltip>
        )}
        {!lockAspect && (
          <Tooltip title={t('3 by 2')} placement='bottom'>
            <Button
              type='primary'
              shape='circle'
              style={{
                marginRight: '10px'
              }}
              onClick={aspect3by2}
            >
              <Crop32 />
            </Button>
          </Tooltip>
        )}
        {!lockAspect && (
          <Tooltip title={t('Square')} placement='bottom'>
            <Button
              type='primary'
              shape='circle'
              style={{
                marginRight: '10px'
              }}
              onClick={aspectSquare}
            >
              <CropSquare />
            </Button>
          </Tooltip>
        )}
        <Tooltip title={t('Reset')} placement='bottom'>
          <Button
            type='primary'
            shape='circle'
            style={{
              marginRight: '10px'
            }}
            onClick={resetCropPosition}
          >
            <Restore />
          </Button>
        </Tooltip>
      </Row>
    )
  }
}
