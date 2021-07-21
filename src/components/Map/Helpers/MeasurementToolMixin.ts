import _area from '@turf/area'
import turf_length from '@turf/length'
import { message } from 'antd'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('Map/MeasureArea')

export default {
  toggleMeasurementTools(enable: boolean): void {
    if (enable && !this.state.enableMeasurementTools) {
      // start
      this.startMeasurementTool()
    } else if (this.state.enableMeasurementTools && !enable) {
      // stop
      this.stopMeasurementTool()
    }
  },

  measureFeatureClick(): void {
    const map = this.map

    const _this = this

    const disableClick = function () {
      map.off('click', _this.onMeasureFeatureClick)
    }

    this.onMeasureFeatureClick = function (e) {
      e.originalEvent.stopPropagation()
      const features = map.queryRenderedFeatures(
        [
          [
            e.point.x - _this.props.interactionBufferSize / 2,
            e.point.y - _this.props.interactionBufferSize / 2
          ],
          [
            e.point.x + _this.props.interactionBufferSize / 2,
            e.point.y + _this.props.interactionBufferSize / 2
          ]
        ],
        {
          layers: _this.state.interactiveLayers
        }
      )

      if (features && features.length > 0) {
        const feature = features[0]

        _this.setState({
          enableMeasurementTools: true
        })

        _this.updateMeasurement([feature])

        disableClick()
      }
    }

    map.on('click', this.onMeasureFeatureClick)
  },

  startMeasurementTool(): void {
    const { t } = this.props
    const containers: Array<Record<string, any>> = this.props.containers
    const { dataEditorState } = containers

    if (
      dataEditorState &&
      dataEditorState.state &&
      dataEditorState.state.editing
    ) {
      message.warning(
        t('Please stop editing before enabling the measurement tool'),
        3
      )
      return
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true
      }
    })
    this.draw = draw
    this.map.addControl(draw, 'top-right')
    this.map.on('draw.create', (e) => {
      debug.log('draw create')
      const data = this.draw.getAll()
      this.updateMeasurement(data.features)
    })
    this.map.on('draw.update', (e) => {
      debug.log('draw update')
      const data = this.draw.getAll()
      this.updateMeasurement(data.features)
    })
    this.map.on('draw.delete', () => {
      debug.log('draw delete')
      this.setState({
        measurementMessage: t('Use the drawing tools below')
      })
    })
    this.setState({
      enableMeasurementTools: true,
      measurementMessage: t('Use the drawing tools below')
    })
  },

  stopMeasurementTool(): void {
    this.map.removeControl(this.draw)
    this.setState({
      enableMeasurementTools: false,
      measurementMessage: ''
    })
  },

  updateMeasurement(features: Array<Record<string, any>>) {
    const { t } = this.props

    if (features.length > 0) {
      const lines = {
        type: 'FeatureCollection',
        features: []
      }
      const polygons = {
        type: 'FeatureCollection',
        features: []
      }
      for (const feature of features) {
        if (feature.geometry.type === 'Polygon') {
          polygons.features.push(feature)
        } else if (feature.geometry.type === 'LineString') {
          lines.features.push(feature)
        }
      }

      if (polygons.features.length > 0) {
        const area = _area(polygons)

        // restrict to area to 2 decimal points
        const areaM2 = Math.round(area * 100) / 100
        const areaKM2 = area * 0.000_001
        const areaHA = areaM2 / 10_000
        let areaMessage = t('Total area: ')

        areaMessage =
          areaM2 < 1000
            ? areaMessage + areaM2.toLocaleString() + 'm2 '
            : areaMessage + areaKM2.toLocaleString() + 'km2 '

        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha'
        this.setState({
          measurementMessage: areaMessage
        })
      } else if (lines.features.length > 0) {
        let distanceKm = 0
        for (const linestring of lines.features) {
          distanceKm += turf_length(linestring, {
            units: 'kilometers'
          })
        }
        const distanceMiles = distanceKm * 0.621_371
        const distanceMessage =
          'Total distance: ' +
          distanceKm.toLocaleString() +
          'km ' +
          distanceMiles.toLocaleString() +
          'mi'
        this.setState({
          measurementMessage: distanceMessage
        })
      }
    }
  }
}
