import { downloadFileFromMinio, downloadState, uploadState } from '~/api/minio'
import { backendsPromise } from '~/api/backends'
import embed from 'vega-embed'
import modes from '~/constants/modes'
import { setupSyncStore } from '~/api/nivs'
import Vue from 'vue'

function getLoader() {
  const obj = {
    actions: false,
  }
  if (process.env.NODE_ENV !== 'development') {
    obj.loader = {
      http: {
        headers: {
          Authorization: `Bearer ${Vue.prototype.$keycloak.token}`,
        },
      },
    }
  }
  return obj
}

function vegaMark(geometry) {
  const nonNullOptions = Object.fromEntries(
    Object.entries(geometry.options).filter(([_, v]) => v != null)
  )
  return {
    type: geometry.type,
    ...nonNullOptions,
  }
}

function vegaEncoding(aesthetic, mode) {
  let fieldNamePrepend = ''
  if (mode === modes.topojson || mode === modes.geojson) {
    fieldNamePrepend = 'properties.'
  }
  const encoding = {}
  Object.keys(aesthetic).forEach(key => {
    if (!aesthetic[key] || aesthetic[key] === '') return

    if (key === 'name') {
      if (aesthetic[key].includes('datum')) {
        encoding.field = aesthetic[key]
        return
      }
      encoding.field = `${fieldNamePrepend}${aesthetic[key]}`
      return
    }
    encoding[key] = aesthetic[key]
  })
  return encoding
}

async function vegaDataTopoJson(URL, geoFeature) {
  const data = await downloadFileFromMinio(URL)
  return {
    values: data,
    format: {
      type: 'topojson',
      feature: geoFeature,
    },
  }
}

async function vegaDataGeoJson(URL) {
  const data = await downloadFileFromMinio(URL)
  return {
    values: data,
    format: {
      property: 'features',
    },
  }
}

async function vegaDataCsv(URL) {
  const data = await downloadFileFromMinio(URL)
  return {
    values: data,
    name: 'table',
    format: {
      type: 'csv',
    },
  }
}

export const state = () => ({
  vegaSpec: {
    data: null,
    layer: [],
    transform: [],
    width: null,
    height: null,
  },
  activeLayer: null,
  syncError: null,
  presignedUrlForUpload: null,
  loading: false,
})

export const mutations = {
  setActiveLayer(state, al) {
    state.activeLayer = al
  },
  setLoading(state, l) {
    state.loading = l
  },
  setVegaSpec(state, spec) {
    state.vegaSpec = spec
  },
  setVegaSpecData(state, d) {
    state.vegaSpec.data = d
  },
  setVegaSpecWidth(state, w) {
    state.vegaSpec.width = w
  },
  setVegaSpecHeight(state, h) {
    state.vegaSpec.height = h
  },
  updateEncoding(state, { layer, name, value }) {
    // explicitly not doing !value because we want 0/false
    // values to be set
    if (value === null || value === '' || typeof value === 'undefined') {
      delete state.vegaSpec.layer[layer].encoding[name]
      return
    }
    state.vegaSpec.layer[layer].encoding[name] = vegaEncoding(
      value,
      state.dataset.mode
    )
  },
  addLayer(state, l) {
    state.vegaSpec.layer.push({
      mark: vegaMark(l),
      encoding: {},
    })
  },
  clearLayers(state, l) {
    state.vegaSpec.layer = []
  },
  removeLayer(state, index) {
    state.vegaSpec.layer.splice(index, 1)
  },
  updateLayerOption(state, { index, option, value }) {
    if (value === null || value === '' || typeof value === 'undefined') {
      delete state.vegaSpec.layer[index].mark[option]
      return
    }
    state.vegaSpec.layer[index].mark[option] = value
  },
  addCalculateTransform(state, t) {
    let calculate = t.calculate
    const mode = state.dataset.mode
    if (
      mode === modes.topojson ||
      (mode === modes.geojson && t.calculate.includes('datum'))
    ) {
      const dotIndex = t.calculate.indexOf('datum') + 6
      const calcs = [
        t.calculate.slice(0, dotIndex),
        t.calculate.slice(dotIndex),
      ]
      calculate = `${calcs[0]}properties.${calcs[1]}`
    }
    state.vegaSpec.transform.push({
      calculate,
      as: t.calculate,
    })
  },
  addFilterTransform(state, t) {
    let filter = t
    const mode = state.dataset.mode
    if (
      mode === modes.topojson ||
      (mode === modes.geojson && t.includes('datum'))
    ) {
      const dotIndex = t.indexOf('datum') + 6
      const filts = [t.slice(0, dotIndex), t.slice(dotIndex)]
      filter = `${filts[0]}properties.${filts[1]}`
    }
    state.vegaSpec.transform.push({
      filter,
    })
  },
  clearTransforms(state) {
    state.vegaSpec.transform = []
  },
  removeCalculateTransform(state, name) {
    const index = state.vegaSpec.transform.findIndex(t => t.calculate === name)
    state.vegaSpec.transform.splice(index, 1)
  },
  removeFilterTransform(state) {
    const index = state.vegaSpec.transform.findIndex(t => t.filter)
    state.vegaSpec.transform.splice(index, 1)
  },
  addProjection(state) {
    state.vegaSpec.projection = {
      type: 'mercator',
    }
  },
  clearProjection(state) {
    delete state.vegaSpec.projection
  },
  setSyncError(state, err) {
    state.syncError = err
  },
  setPresignedUrlForUpload(state, url) {
    state.presignedUrlForUpload = url
  },
}

export const actions = {
  async resetSpec({ commit, dispatch }) {
    commit('dataset/setColumns', [])
    commit('dataset/setColumnsInDatafile', [])
    commit('dataset/setFilter', null)
    dispatch('geometries/clearGeometries')
    commit('clearLayers')
    commit('clearTransforms')
    commit('setVegaSpecData', null)
    await dispatch('refreshVegaEmbed')
  },
  async updateEncoding({ state, commit, dispatch }, { name, value }) {
    commit('updateEncoding', {
      layer: state.geometries.geometryIndex,
      name,
      value,
    })

    await dispatch('refreshVegaEmbed')
  },
  async addLayer({ commit, dispatch }, layer) {
    commit('addLayer', layer)
    await dispatch('refreshVegaEmbed')
  },
  async updateLayerOption({ commit, dispatch }, { index, option, value }) {
    commit('updateLayerOption', { index, option, value })
    await dispatch('refreshVegaEmbed')
  },
  async clearLayers({ commit, dispatch }) {
    commit('clearLayers')
    await dispatch('refreshVegaEmbed')
  },
  async removeLayer({ commit, dispatch }, index) {
    commit('removeLayer', index)
    await dispatch('refreshVegaEmbed')
  },
  async addTransform({ state, commit, dispatch }, transform) {
    if (state.vegaSpec.transform.find(t => t.as === transform.calculate)) {
      return
    }
    commit('addCalculateTransform', transform)
    await dispatch('refreshVegaEmbed')
  },
  async removeTransform({ commit, dispatch }, name) {
    commit('removeCalculateTransform', name)
    await dispatch('refreshVegaEmbed')
  },
  async addFilter({ commit, dispatch }, transform) {
    commit('removeFilterTransform')
    commit('addFilterTransform', transform)
    await dispatch('refreshVegaEmbed')
  },
  async removeFilter({ commit, dispatch }) {
    commit('removeFilterTransform')
    await dispatch('refreshVegaEmbed')
  },
  async setVegaSpecData({ state, commit, dispatch }, { type, index }) {
    await backendsPromise
    let data = {}
    if (index !== null && type === 'csv') {
      data = await vegaDataCsv(state.dataset.csvFiles[index].url)
    } else if (index !== null && type === 'geojson') {
      data = await vegaDataGeoJson(state.dataset.geojsonFiles[index].url)
    } else if (index !== null && type === 'topojson') {
      data = await vegaDataTopoJson(
        state.dataset.topojsonFiles[index].url,
        state.dataset.topojsonObject
      )
    }
    commit('setVegaSpecData', data)
    await dispatch('refreshVegaEmbed')
  },
  async refreshVegaEmbed({ state, dispatch }) {
    try {
      await dispatch('uploadState')
      const res = await embed('#viz', state.vegaSpec, getLoader())
      return res.finalize()
    } catch (error) {
      console.error('ERROR in vega-embed: ', error)
    }
  },
  async loadStore({ commit, dispatch }) {
    try {
      const presignedUrls = await setupSyncStore()
      const presignedUrlForDownload = presignedUrls[0]
      commit('setPresignedUrlForUpload', presignedUrls[1])

      let newState = null
      if (presignedUrlForDownload) {
        newState = await downloadState(presignedUrlForDownload)
      }
      if (newState) {
        await dispatch('dataset/loadStore', newState.dataset)
        await dispatch('geometries/loadStore', newState.geometries)
        commit('setVegaSpec', newState.vegaSpec)
        commit('setActiveLayer', newState.activeLayer)
      }
      await dispatch('dataset/loadData')
      await dispatch('refreshVegaEmbed')
      console.log('Successfully synced state from NIVS backend')
    } catch (e) {
      console.error(e)
      commit('setSyncError', `Error syncing state with NIVS backend. ${e}`)
    }
  },
  async uploadState({ state, commit }) {
    const presignedUrlForUpload = state.presignedUrlForUpload
    if (presignedUrlForUpload) {
      try {
        await uploadState(presignedUrlForUpload, {
          dataset: state.dataset,
          geometries: state.geometries,
          vegaSpec: state.vegaSpec,
          activeLayer: state.activeLayer,
        })
        commit('setSyncError', null)
      } catch (error) {
        console.error(error)
        commit(
          'setSyncError',
          `Error syncing with DAFNI backend. Response status is "${error}"`
        )
      }
    }
  },
}
