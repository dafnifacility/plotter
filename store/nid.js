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
  getFileUrlsAndPopulateFilesByType({ state, commit }) {
    const csvFiles = []
    const topoFiles = []
    const geoFiles = []
    for (const dataset of state.datasetUrlResponse) {
      const files = dataset.files_with_urls
      for (const file of files) {
        if (file.file.endsWith('csv')) {
          csvFiles.push(file)
        } else if (file.file.endsWith('topojson')) {
          topoFiles.push(file)
        } else if (file.file.endsWith('geojson')) {
          geoFiles.push(file)
        }
      }
    }
    commit('dataset/setCsvFiles', csvFiles, { root: true })
    commit('dataset/setTopojsonFiles', topoFiles, { root: true })
    commit('dataset/setGeojsonFiles', geoFiles, { root: true })
  },
  async getDatasetsAndPopulateFileLists({ dispatch }) {
    await dispatch('getDatasetIds')
    await dispatch('getDatasetUrls')
    await dispatch('getFileUrlsAndPopulateFilesByType')
  },
}
