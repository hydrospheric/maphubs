import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import TextInput from '../forms/textInput'
import { message, notification, Row, Button } from 'antd'
import LayerActions from '../../actions/LayerActions'
import LinkIcon from '@material-ui/icons/Link'
import HeightIcon from '@material-ui/icons/Height'
import AspectRatioIcon from '@material-ui/icons/AspectRatio'
import useT from '../../hooks/useT'

const RasterTileSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const { t } = useT()

  addValidationRule('isHttps', (values, value: string) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = (model: Record<string, any>): void => {
    let boundsArr = []

    if (model.bounds) {
      boundsArr = model.bounds.split(',')
      boundsArr = boundsArr.map((item) => {
        return item.trim()
      })
    }

    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'Vector Tile Service',
        external_layer_config: {
          type: 'vector',
          minzoom: model.minzoom,
          maxzoom: model.maxzoom,
          bounds: boundsArr,
          tiles: [model.vectorTileUrl]
        }
      },
      (err) => {
        if (err) {
          notification.error({
            message: t('Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          message.success(t('Layer Saved'), 1, () => {
            // reset style to load correct source
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()

            onSubmit()
          })
        }
      }
    )
  }

  return (
    <Row>
      <Formsy
        onValidSubmit={submit}
        onValid={() => {
          setCanSubmit(true)
        }}
        onInvalid={() => {
          setCanSubmit(false)
        }}
        style={{
          width: '100%'
        }}
      >
        <div>
          <p>
            <b>{t('Vector Tile Source')}</b>
          </p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='vectorTileUrl'
              label={t('Vector Tile URL')}
              icon={<LinkIcon />}
              validations='maxLength:500,isHttps'
              validationErrors={{
                maxLength: t('Must be 500 characters or less.'),
                isHttps: t(
                  'SSL required for external links, URLs must start with https://'
                )
              }}
              length={500}
              tooltipPosition='top'
              tooltip={
                t('Vector Tile URL for example:') +
                'http://myserver/tiles/{z}/{x}/{y}.pbf'
              }
              required
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='minzoom'
              label={t('MinZoom')}
              icon={<HeightIcon />}
              tooltipPosition='top'
              tooltip={t('Lowest tile zoom level available in data')}
              required
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='maxzoom'
              label={t('MaxZoom')}
              icon={<HeightIcon />}
              tooltipPosition='top'
              tooltip={t('Highest tile zoom level available in data')}
              required
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='bounds'
              label={t('Bounds')}
              icon={<AspectRatioIcon />}
              tooltipPosition='top'
              tooltip={t(
                'Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy'
              )}
              t={t}
            />
          </Row>
        </div>
        <div
          style={{
            float: 'right'
          }}
        >
          <Button type='primary' htmlType='submit' disabled={!canSubmit}>
            {t('Save and Continue')}
          </Button>
        </div>
      </Formsy>
    </Row>
  )
}
export default RasterTileSource
