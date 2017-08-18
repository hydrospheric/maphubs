import Reflux from 'reflux';
export default Reflux.createActions([
  'loadLayer',
  'saveSettings',
  'saveDataSettings',
  'saveStyle',
  'loadData',
  'replaceData',
  'mergeNewPresetTags',
  'initEmptyLayer',
  'deleteData',
  'deleteLayer',
  'cancelLayer',
  'createLayer',
  'setStyle',
  'dataLoaded',
  'tileServiceInitialized',
  'setDataType',
  'resetStyle',
  'setComplete',
  'finishUpload',

  //presets
  'setImportedTags',
  'submitPresets',
  'addPreset',
  'deletePreset',
  'updatePreset',
  'setLayerId',
  'movePresetUp',
  'movePresetDown',
  'loadPresets',
  'loadDefaultPresets'
]);