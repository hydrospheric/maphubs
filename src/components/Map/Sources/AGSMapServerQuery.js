// @flow
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'

import TerraformerGL from '../../../services/terraformerGL'
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('AGSFeatureServerQuery')

const AGSMapServerQuery = {
  load (key: string, source: GLSource, mapComponent: any): any {
    if (source.url) {
      return TerraformerGL.getArcGISGeoJSON(source.url)
        .then((geoJSON) => {
          if (geoJSON.bbox && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap) {
            mapComponent.zoomToData(geoJSON)
          }
          return mapComponent.addSource(key, {type: 'geojson', data: geoJSON})
        }, (err) => {
          debug.log('(' + mapComponent.state.id + ') ' + err)
        })
    } else {
      throw new Error('source missing url parameter')
    }
  },
  addLayer (layer: GLLayer, source: GLSource, position: number, mapComponent: any) {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },
  removeLayer (layer: GLLayer, mapComponent: any) {
    mapComponent.removeLayer(layer.id)
  },
  remove (key: string, mapComponent: any) {
    mapComponent.removeSource(key)
  }
}

export default AGSMapServerQuery
