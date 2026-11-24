// Local-only experimental config for the pinned OHIF version.
// Do not deploy or use real patient files. No DICOMweb, dynamic URL sources or remote config.
window.config = {
  name: 'config/healthos-local.js',
  routerBasename: null,
  showStudyList: false,
  showLoadingIndicator: true,
  maxNumberOfWebWorkers: 2,
  extensions: [],
  modes: [],
  defaultDataSourceName: 'dicomlocal',
  dataSources: [{
    namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
    sourceName: 'dicomlocal',
    configuration: { friendlyName: 'Synthetic local DICOM only' }
  }]
};
