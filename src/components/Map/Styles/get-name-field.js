// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'
import MapStyles from '../Styles'
import _find from 'lodash.find'

export default {

  possibleNameFields: ['name', 'nom', 'nombre', 'nome'],

  getNameFieldFromPresets (presets: Array<Object>): any | void {
    const nameFieldPreset = _find(presets, {isName: true})
    let nameField
    if (nameFieldPreset) {
      nameField = nameFieldPreset.tag
    }
    return nameField
  },

  guessNameFieldFromProps (properties: Object): void {
    let nameField
    const _this = this
    Object.keys(properties).forEach(key => {
      const lowercaseKey = key.toLowerCase()
      if (!nameField) {
        _this.possibleNameFields.forEach(name => {
          if (lowercaseKey.includes(name)) {
            nameField = key
          }
        })
      }
    })
    return nameField
  },

  getPresetsFromStyle (style?: GLStyle): any | void {
    if (style) {
      const firstSource = Object.keys(style.sources)[0]
      if (firstSource) {
        return MapStyles.settings.getSourceSetting(style, firstSource, 'presets')
      }
    }
  },

  getNameField (properties: Object, presets?: Array<Object>): empty {
    let nameField
    if (presets) {
      nameField = this.getNameFieldFromPresets(presets)
    }
    if (!nameField) {
      nameField = this.guessNameFieldFromProps(properties)
    }
    return nameField
  },

  getDescriptionFieldFromPresets (presets: Array<Object>): any | void {
    const descriptionFieldPreset = _find(presets, {isDescription: true})
    let descriptionField
    if (descriptionFieldPreset) {
      descriptionField = descriptionFieldPreset.tag
    }
    return descriptionField
  },

  getDescriptionField (properties: Object, presets?: Array<Object>): void {
    let descriptionField
    if (presets) {
      descriptionField = this.getDescriptionFieldFromPresets(presets)
    }
    return descriptionField
  }
}
