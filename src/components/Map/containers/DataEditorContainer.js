// @flow
import type {Layer} from '../../../types/layer'
import type {GeoJSONObject} from 'geojson-flow'
import {Container} from 'unstated'
import request from 'superagent'
import Debug from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import _assignIn from 'lodash.assignin'
import _forEachRight from 'lodash.foreachright'
const checkClientError = require('../../../services/client-error-response').checkClientError
const debug = Debug('DataEditorContainer')

export type DataEditorState = {
  editing?: boolean,
  editingLayer?: Layer,
  originals: Array<Object>, // store the orginal GeoJSON to support undo
  edits: Array<Object>,
  redo: Array<Object>, // if we undo edits, add them here so we can redo them
  selectedEditFeature?: Object // selected feature
}

export default class DataEditorContainer extends Container<DataEditorState> {
  constructor () {
    super()
    this.state = this.getDefaultState()
  }

  getDefaultState (): {|
  editing: boolean,
  edits: Array<any>,
  originals: Array<any>,
  redo: Array<any>,
|} {
    return {
      editing: false,
      originals: [], // store the orginal GeoJSON to support undo
      edits: [],
      redo: [] // if we undo edits, add them here so we can redo them
    }
  }

  reset () {
    this.setState(this.getDefaultState())
  }

  startEditing (layer: Layer): any {
    return this.setState({editing: true, editingLayer: layer})
  }

  stopEditing (): any {
    if (this.state.edits.length > 0) {
      debug.log('stopping with unsaved edits, edits have been deleted')
    }
    return this.setState({
      editing: false,
      originals: [],
      edits: [],
      redo: [],
      editingLayer: undefined
    })
  }

  /**
   * receive updates from the drawing tool
   */
  updateFeatures (features: Array<Object>) {
    const _this = this
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    features.forEach(feature => {
      debug.log('Updating feature: ' + feature.id)

      const edit = {
        status: 'modify',
        geojson: JSON.parse(JSON.stringify(feature))
      }

      if (this.state.selectedEditFeature &&
        feature.id === this.state.selectedEditFeature.geojson.id) {
        // if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = edit
      }
      // edit history gets a different clone from the selection state
      const editCopy = JSON.parse(JSON.stringify(edit))
      edits.push(editCopy)
    })
    _this.setState({
      edits, redo: [] // redo resets if user makes an edit
    })
  }

  resetEdits () {
    this.setState({edits: [], redo: []})
  }

  undoEdit (onFeatureUpdate: Function) {
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    const redo = JSON.parse(JSON.stringify(this.state.redo))
    let selectedEditFeature = JSON.parse(JSON.stringify(this.state.selectedEditFeature))
    if (edits.length > 0) {
      const lastEdit = edits.pop()
      const lastEditCopy = JSON.parse(JSON.stringify(lastEdit))
      redo.push(lastEditCopy)
      const currEdit = this.getLastEditForID(lastEdit.geojson.id, edits)
      if (currEdit &&
        selectedEditFeature &&
        lastEdit.geojson.id === selectedEditFeature.geojson.id) {
        // if popping an edit to the selected feature, updated it
        selectedEditFeature = currEdit
      }

      if (lastEdit.status === 'create') {
        // tell mapboxGL to delete the feature
        onFeatureUpdate('delete', lastEdit)
      } else {
        // tell mapboxGL to update
        onFeatureUpdate('update', currEdit)
      }
      this.setState({edits, redo, selectedEditFeature})
    }
  }

  redoEdit (onFeatureUpdate: Function) {
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    const redo = JSON.parse(JSON.stringify(this.state.redo))
    let selectedEditFeature = JSON.parse(JSON.stringify(this.state.selectedEditFeature))

    if (redo.length > 0) {
      const prevEdit = redo.pop()
      const prevEditCopy = JSON.parse(JSON.stringify(prevEdit))
      const prevEditCopy2 = JSON.parse(JSON.stringify(prevEdit))
      edits.push(prevEditCopy)
      if (selectedEditFeature &&
        prevEdit.geojson.id === selectedEditFeature.geojson.id) {
        // if popping an edit to the selected feature, updated it
        selectedEditFeature = prevEditCopy2
      }
      // tell mapboxGL to update
      onFeatureUpdate('update', prevEdit)
      this.setState({edits, redo, selectedEditFeature})
    }
  }

  getLastEditForID (id: string, edits: any): any | null {
    const matchingEdits = []
    _forEachRight(edits, edit => {
      if (edit.geojson.id === id) {
        matchingEdits.push(edit)
      }
    })
    if (matchingEdits.length > 0) {
      return JSON.parse(JSON.stringify(matchingEdits[0]))
    } else {
      let original
      this.state.originals.forEach(orig => {
        if (orig.geojson.id === id) {
          original = orig
        }
      })
      if (original) {
        return JSON.parse(JSON.stringify(original))
      }
      return null
    }
  }

  /**
   * Save all edits to the server and reset current edits
   */
  saveEdits (_csrf: string, cb: Function) {
    console.log('saving edits')
    console.log(this.state.edits)
    const _this = this
    const featureIds = this.getUniqueFeatureIds()
    const editsToSave = []
    featureIds.forEach(id => {
      const featureEdits = _this.getAllEditsForFeatureId(id)
      const lastFeatureEdit = featureEdits[featureEdits.length - 1]
      if (featureEdits.length > 1) {
        if (featureEdits[0].status === 'create') {
        // first edit is a create, so mark edit as create
          lastFeatureEdit.status = 'create'
        }
      }
      editsToSave.push(lastFeatureEdit)
    })
    const layer_id: number = (this.state.editingLayer && this.state.editingLayer.layer_id) ? this.state.editingLayer.layer_id : 0
    if (editsToSave.length > 0) {
    // send edits to server
      request.post('/api/edits/save')
        .type('json').accept('json')
        .send({
          layer_id,
          edits: editsToSave,
          _csrf
        })
        .end((err, res) => {
          checkClientError(res, err, cb, (cb) => {
            if (err) {
              cb(err)
            } else {
              // after saving clear all edit history
              _this.setState({
                originals: [],
                edits: [],
                redo: [],
                selectedEditFeature: undefined
              })
              cb()
            }
          })
        })
    } else {
      cb(new Error('No pending edits found'))
    }
  }

  getUniqueFeatureIds (): Array<any> {
    const uniqueIds = []
    this.state.edits.forEach(edit => {
      const id = edit.geojson.id
      if (id && !uniqueIds.includes(id)) {
        uniqueIds.push(id)
      }
    })
    return uniqueIds
  }

  getAllEditsForFeatureId (id: string): Array<any> {
    const featureEdits = []
    this.state.edits.forEach(edit => {
      if (edit.geojson.id === id) {
        featureEdits.push(edit)
      }
    })
    return featureEdits
  }

  async updateSelectedFeatureTags (data: GeoJSONObject): Promise<any> {
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    if (this.state.selectedEditFeature) {
      console.log('updatings tags for selected feature')
      console.log(this.state.selectedEditFeature)
      console.log(data)
      const selectedEditFeature = JSON.parse(JSON.stringify(this.state.selectedEditFeature))
      // check if selected feature has been edited yet
      const editRecord = {
        status: 'modify',
        geojson: JSON.parse(JSON.stringify(selectedEditFeature.geojson))
      }

      // update the edit record
      _assignIn(editRecord.geojson.properties, data)
      const editRecordCopy = JSON.parse(JSON.stringify(editRecord))
      edits.push(editRecordCopy)
      console.log('adding new edit record')
      console.log(editRecordCopy)

      // update the selected feature
      await this.setState({
        edits,
        redo: [],
        selectedEditFeature
      })
      return editRecordCopy
    } else {
      console.error('no feature selected')
    }
  }

  async selectFeature (mhid: string): Promise<any> {
    // check if this feature is in the created or modified lists
    const selected = this.getLastEditForID(mhid, this.state.edits)

    if (selected) {
      await this.setState({selectedEditFeature: selected})
      return selected.geojson
    } else {
      const id = mhid.split(':')[1]
      const layer_id: number = (this.state.editingLayer && this.state.editingLayer.layer_id) ? this.state.editingLayer.layer_id : 0
      // otherwise get the geojson from the server
      try {
        const res = await request
          .get(`/api/feature/json/${layer_id.toString()}/${id}/data.geojson`)
          .accept('json')

        const featureCollection = res.body
        const feature = featureCollection.features[0]

        const selected = {
          status: 'original',
          geojson: feature
        }
        selected.geojson.id = mhid

        const original = JSON.parse(JSON.stringify(selected)) // needs to be a clone
        this.state.originals.push(original)
        await this.setState({
          selectedEditFeature: selected
        })
        return selected.geojson
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
   * Called when mapbox-gl-draw is used to create new feature
   *
   */
  createFeature (feature: GeoJSONObject) {
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    const created = {
      status: 'create',
      geojson: JSON.parse(JSON.stringify(feature))
    }

    edits.push(created)
    this.setState({
      edits,
      selectedEditFeature: created
    })
  }

  deleteFeature (feature: GeoJSONObject) {
    const edits = JSON.parse(JSON.stringify(this.state.edits))
    const edit = {
      status: 'delete',
      geojson: JSON.parse(JSON.stringify(feature))
    }
    edits.push(edit)
    this.state.redo = []
    this.setState({edits, redo: []})
  }
}
