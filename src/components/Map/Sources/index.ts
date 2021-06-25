import AGSMapServerQuery from './AGSMapServerQuery'
import AGSFeatureServerQuery from './AGSFeatureServerQuery'
import MapboxSource from './MapboxSource'
import MapHubsSource from './MapHubsSource'
import RasterSource from './RasterSource'
import GenericSource from './GenericSource'
import EarthEngineSource from './EarthEngineSource'
import type { GLSource } from '../../../types/mapbox-gl-style'
export default {
  getSource(
    key: string,
    source: GLSource
  ): {
    custom: boolean
    driver: any
    key: string
    source: GLSource
  } {
    const response = function (
      driver: (...args: Array<any>) => any,
      custom: boolean = false
    ) {
      return {
        key,
        source,
        custom,
        driver
      }
    }

    if (
      !key.startsWith('osm') &&
      source.type === 'vector' &&
      (!source.url || !source.url.startsWith('mapbox://'))
    ) {
      return response(this['maphubs-vector'])
    } else if (source.type === 'geojson' && source.data) {
      return response(this['maphubs-vector'])
    } else if (
      source.type === 'arcgisraster' // legacy support for old arcgis raster layers
    ) {
      source.type = 'raster'
      return response(this.raster)
    } else if (this[source.type] && this[source.type].addLayer) {
      // use custom driver for this source type
      return response(this[source.type])
    } else {
      return response(this.generic)
    }
  },

  'ags-mapserver-query': AGSMapServerQuery,
  'ags-featureserver-query': AGSFeatureServerQuery,
  'mapbox-style': MapboxSource,
  'maphubs-vector': MapHubsSource,
  earthengine: EarthEngineSource,
  raster: RasterSource,
  generic: GenericSource
}