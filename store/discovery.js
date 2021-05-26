import { getInstance } from '~/api/nivs'
import { getMetadataForDatasets } from '~/api/discovery'

export const state = () => ({
  instanceGetError: null,
  datasetIds: null,
})

export const mutations = {
  setDatasetIds(state, di) {
    state.datasetIds = di
  },
  setInstanceError(state, err) {
    state.instanceGetError = err
  },
}

export const actions = {
  async getDatasetIds({ commit }) {
    try {
      const response = await getInstance()
      const assets = response.data.visualisation_assets
      const ids = assets.map(a => a.asset_id)
      console.log(ids)
      commit('setDatasetIds', ids)
    } catch (e) {
      console.error(e)
      commit('setInstanceError', `Error getting Instance data from NIVS. ${e}`)
    }
  },
  async getDatasetMetadata({ state, commit }) {},
}
