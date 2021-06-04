import { getInstance } from '~/api/nivs'
import { getMetadataForDatasets } from '~/api/discovery'

export const state = () => ({
  instanceGetError: null,
  metadataGetError: null,
  datasetIds: null,
  datasetMetadata: null,
  fileData: null,
})

export const mutations = {
  setDatasetIds(state, di) {
    state.datasetIds = di
  },
  setDatasetMetadata(state, dm) {
    state.datasetMetadata = dm
  },
  setFileData(state, fd) {
    state.fileData = fd
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
  async getDatasetMetadata({ state, commit }) {
    try {
      const response = await getMetadataForDatasets(state.datasetIds)
      commit('setDatasetMetadata', response.data)
    } catch (e) {
      console.error(e)
      commit('setMetadataError', `Error getting datasets from database. ${e}`)
    }
  },
  getFileDataFromMetadata({ state, commit }) {
    let fileData = []
    for (const id of state.datasetIds) {
      const files = state.datasetMetadata[id]['dcat:distribution']
      fileData = fileData.concat(
        files.map(f => {
          return {
            filename: f['spdx:fileName'],
            url: f['dcat:downloadURL'],
            type: f['dcat:mediaType'],
          }
        })
      )
    }
    commit('setFileData', fileData)
  },
  populateFilesByType({ state, commit }) {
    const csvFiles = []
    const topoFiles = []
    const geoFiles = []
    for (const file of state.fileData) {
      if (file.filename.endsWith('csv')) {
        csvFiles.push(file)
      } else if (file.filename.endsWith('topojson')) {
        topoFiles.push(file)
      } else if (file.filename.endsWith('geojson')) {
        geoFiles.push(file)
      }
    }
    commit('dataset/setCsvFiles', csvFiles, { root: true })
    commit('dataset/setTopojsonFiles', topoFiles, { root: true })
    commit('dataset/setGeojsonFiles', geoFiles, { root: true })
  },
  async getDatasetsAndPopulateFileLists({ dispatch }) {
    await dispatch('getDatasetIds')
    await dispatch('getDatasetMetadata')
    await dispatch('getFileDataFromMetadata')
    await dispatch('populateFilesByType')
  },
}
