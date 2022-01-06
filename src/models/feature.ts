import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Feature, FeatureCollection } from 'geojson'
import { Knex } from 'knex'
const debug = DebugService('feature')

export default {
  /**
   * Get GeoJSON for feature(s)
   *
   * @param {string} mhid
   * @param {number} layer_id
   * @returns
   */
  async getGeoJSON(
    mhid: string,
    layerId: number,
    trx?: Knex.Transaction
  ): Promise<FeatureCollection> {
    const db = trx || knex
    const layerTable = 'layers.data_' + layerId
    const data = await db
      .select(db.raw('ST_AsGeoJSON(ST_Force2D(wkb_geometry)) as geom'), 'tags')
      .from(layerTable)
      .where({
        mhid
      })

    if (!data || data.length === 0) {
      debug.error(`missing data: ${data}`)
      throw new Error(`Data not found for mhid: ${mhid}`)
    } else {
      const bbox = await db.raw(`select 
        '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
        from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`)
      const feature: Feature = {
        type: 'Feature',
        geometry: JSON.parse(data[0].geom),
        properties: data[0].tags
      }
      feature.properties.mhid = mhid
      return {
        type: 'FeatureCollection',
        features: [feature],
        bbox: JSON.parse(bbox.rows[0].bbox)
      }
    }
  }
}
