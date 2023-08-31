import { getInstance } from '~/api/nivs'
import { getUrlsForDatasets } from '~/api/nid'

export const state = () => ({
  instanceGetError: null,
  metadataGetError: null,
  datasetIds: null,
  datasetUrlResponse: null,
})

export const mutations = {
  setDatasetIds(state, di) {
    state.datasetIds = di
  },
  setDatasetUrlResponse(state, dur) {
    state.datasetUrlResponse = dur
  },
  setInstanceError(state, err) {
    state.instanceGetError = err
  },
  setMetadataError(state, err) {
    state.metadataGetError = err
  },
}

export const actions = {
  async getDatasetIds({ commit }) {
    try {
      const response = await getInstance()
      const assets = response.data.visualisation_assets
      const ids = assets.map(a => a.asset_id)
      commit('setDatasetIds', ids)
    } catch (e) {
      console.error(e)
      commit('setInstanceError', `Error getting Instance data from NIVS. ${e}`)
    }
  },
  async getDatasetUrls({ state, commit }) {
    try {
      const response = await getUrlsForDatasets(state.datasetIds)
      commit('setDatasetUrlResponse', response.data)
    } catch (e) {
      console.error(e)
      commit('setMetadataError', `Error getting datasets from database. ${e}`)
    }
  },
  async getFileUrlsAndPopulateFilesByType({ state, dispatch }) {
    const csvFiles = []
    const topoFiles = []
    const geoFiles = []
    for (const dataset of state.datasetUrlResponse) {
      const files = dataset.urls
      for (const [fileName, fileUrl] of Object.values(files)) {
        if (fileName.endsWith('csv')) {
          csvFiles.push({ file: fileName, url: fileUrl })
        } else if (fileName.endsWith('topojson')) {
          topoFiles.push({ file: fileName, url: fileUrl })
        } else if (fileName.endsWith('geojson')) {
          geoFiles.push({ file: fileName, url: fileUrl })
        }
      }
    }
    if (csvFiles.length > 0) {
      await dispatch('dataset/setCsvFiles', csvFiles, { root: true })
    }
    if (topoFiles.length > 0) {
      await dispatch('dataset/setTopojsonFiles', topoFiles, { root: true })
    }
    if (geoFiles.length > 0) {
      await dispatch('dataset/setGeojsonFiles', geoFiles, { root: true })
    }
  },
  async getDatasetsAndPopulateFileLists({ dispatch }) {
    await dispatch('getDatasetIds')
    await dispatch('getDatasetUrls')
    await dispatch('getFileUrlsAndPopulateFilesByType')
  },
}
