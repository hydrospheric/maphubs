import React from 'react'
import _find from 'lodash.find'
import LayerListDropDown from './LayerListDropDown'
import { LocalizedString } from '../../types/LocalizedString'
import { Layer } from '../../types/layer'
type Props = {
  categories: Array<Record<string, any>>
  layers: Array<Layer>
  backgroundColor?: string
  textColor?: string
  toggleVisibility: (layer_id: number) => void
  t: (v: string | LocalizedString) => string
}
const MapLayerMenu = ({
  categories,
  layers,
  toggleVisibility,
  backgroundColor,
  textColor,
  t
}: Props): JSX.Element => {
  return (
    <>
      <div
        style={{
          boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
          borderTop: '1px #444 solid',
          height: '36px',
          padding: '0px 15px',
          backgroundColor: backgroundColor || 'white',
          color: textColor || 'inherit',
          overflowY: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {categories.map((category, i) => {
          const categoriesLayers = []
          for (const layer_id of category.layers) {
            categoriesLayers.push(
              _find(layers, {
                layer_id
              })
            )
          }
          return (
            <span
              key={`category-dropdown-${i}`}
              style={{
                marginRight: '20px',
                display: 'inline-block'
              }}
            >
              <LayerListDropDown
                id={`category-dropdown-${i}`}
                name={category.name}
                layers={categoriesLayers}
                toggleVisibility={toggleVisibility}
                t={t}
              />
            </span>
          )
        })}
      </div>
    </>
  )
}
MapLayerMenu.defaultProps = {
  categories: [],
  layers: []
}
export default MapLayerMenu
