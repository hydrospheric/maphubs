import React from 'react'
import DataCollectionForm from '../DataCollection/DataCollectionForm'
import _isequal from 'lodash.isequal'
import { Subscribe } from 'unstated'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapStyles from '../Map/Styles'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('editLayerPanel')
type Props = {
  t: (...args: Array<any>) => any
}
export default class EditLayerPanel extends React.Component<Props, void> {
  onChange: (data: any, DataEditor: any) => void = (
    data: Record<string, any>,
    DataEditor: Record<string, any>
  ) => {
    // don't fire change if this update came from state (e.g. undo/redo)
    // the geojson may have tags not in the presets so we need to ignore them when checking for changes
    let foundChange
    const { selectedEditFeature } = DataEditor.state

    if (selectedEditFeature && selectedEditFeature.geojson) {
      const properties = selectedEditFeature.geojson.properties
      Object.keys(data).map((key) => {
        if (!_isequal(data[key], properties[key])) {
          foundChange = true
        }
      })

      if (foundChange) {
        DataEditor.updateSelectedFeatureTags(data)
      }
    } else {
      debug.log('missing geoJSON')
    }
  }

  render(): JSX.Element {
    // var canSave = this.state.edits.length > 0;
    const { t } = this.props
    return (
      <Subscribe to={[DataEditorContainer]}>
        {(DataEditor) => {
          const { selectedEditFeature, editingLayer } = DataEditor.state
          let layerTitle = ''

          if (editingLayer) {
            const name = editingLayer.name
            layerTitle = (
              <p
                className='word-wrap'
                style={{
                  paddingTop: '2px',
                  paddingLeft: '2px',
                  paddingRight: '2px',
                  paddingBottom: '5px'
                }}
              >
                <b>{t('Editing:')}</b> {t(name)}
              </p>
            )
          }

          let featureAttributes = ''

          if (selectedEditFeature && editingLayer && editingLayer.style) {
            const firstSource = Object.keys(editingLayer.style.sources)[0]
            const presets = MapStyles.settings.getSourceSetting(
              editingLayer.style,
              firstSource,
              'presets'
            )
            featureAttributes = (
              <DataCollectionForm
                presets={presets}
                values={selectedEditFeature.geojson.properties}
                onChange={(data) => {
                  this.onChange(data, DataEditor)
                }}
                style={{
                  padding: '10px',
                  height: '100%',
                  overflow: 'auto'
                }}
                showSubmit={false}
              />
            )
          }

          return (
            <div
              style={{
                height: 'calc(100% - 75px'
              }}
            >
              {layerTitle}
              {featureAttributes}
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
