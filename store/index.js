import { backendsPromise, nidMinioUrl } from '~/api/backends'
import { downloadState, replaceMinioUrl, uploadState } from '~/api/minio'
import embed from 'vega-embed'
import { deepCopy } from '~/static/js/utils'
import { geometries } from '~/constants/geometries'
import modes from '~/constants/modes'
import { setupSyncStore } from '~/api/nivs'

function vegaLayer(geometry) {
  console.log('geometry', geometry)
  const geom = geometries.find(g => {
    return g.value === geometry.type
  })

  const mark = vegaMark(geom)
  const encoding = baseVegaEncoding(geom.defaultAesthetics)
  return {
    mark,
    encoding,
  }
}

function baseVegaEncoding(aesthetics) {
  const encoding = {}
  for (const aes of aesthetics) {
    encoding[aes] = null
  }
  return encoding
}

function vegaMark(geometry) {
  const mark = {
    type: geometry.value,
  }
  for (const opt of geometry.options) {
    mark[opt.value] = opt.default
  }
  return mark
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
      encoding.field = `${fieldNamePrepend}${aesthetic[key]}`
      return
    }
    encoding[key] = aesthetic[key]
  })
  return encoding
}

function vegaDataTopoJson(URL, geoFeature) {
  return {
    url: replaceMinioUrl(URL, nidMinioUrl),
    format: {
      type: 'topojson',
      feature: geoFeature,
    },
  }
}

function vegaDataGeoJson(URL) {
  return {
    url: replaceMinioUrl(URL, nidMinioUrl),
    format: {
      property: 'features',
    },
  }
}

function vegaDataCsv(URL) {
  return {
    url: replaceMinioUrl(URL, nidMinioUrl),
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
  activeLayerIndex: null,
  loading: false,
  presignedUrlForUpload: null,
  syncError: null,
})

export const getters = {
  getActiveLayer(state) {
    if (
      state.activeLayerIndex === null ||
      state.activeLayerIndex >= state.vegaSpec.layer.length ||
      state.activeLayerIndex < 0
    ) {
      return {
        mark: {},
        encoding: {},
      }
    }

    return state.vegaSpec.layer[state.activeLayerIndex]
  },
  getActiveLayerEncoding:
    (state, getters) =>
    ({ aesthetic }) => {
      console.log('aesthet', aesthetic)
      return deepCopy(getters.getActiveLayer[aesthetic])
    },
  getSimpleEncodingOption:
    (state, getters) =>
    ({ aesthetic, option }) => {
      console.log('SimpleEncoding-aesthetic', aesthetic)
      console.log('SimpleEncoding-option', option)
      const encoding = getters.getActiveLayerEncoding({ aesthetic })
      console.log('SimpleEncoding-encoding', encoding)
      return (encoding && encoding[option]) || null
    },
  getMaxBins:
    (state, getters) =>
    ({ aesthetic, option }) => {
      console.log('getMaxBins-aesthetic', aesthetic)
      console.log('getMaxBins-option', option)
      const encoding = getters.getActiveLayerEncoding({ aesthetic })
      console.log('getMaxBins-encoding', encoding)
      return (encoding && encoding.bin && encoding.bin.maxbins) || null
    },
  getScale:
    (state, getters) =>
    ({ aesthetic, option }) => {
      console.log('getScale-aesthetic', aesthetic)
      console.log('getScale-option', option)
      const encoding = getters.getActiveLayerEncoding({ aesthetic })
      console.log('getScale-encoding', encoding)
      return (encoding && encoding.scale && encoding.scale.type) || null
    },
  vegaTransform(state) {
    // if (
    //   state.dataset.mode === modes.csvTopojson ||
    //   state.dataset.mode === modes.csvGeojson
    // ) {
    //   const propertiesWithoutID = state.dataset.geoProperties.filter(
    //     prop => prop !== state.dataset.geoId
    //   )
    //   let dataSpec = null
    //   if (
    //     state.dataset.mode === modes.csvTopojson &&
    //     state.dataset.topojsonFiles.length > 0
    //   ) {
    //     dataSpec = vegaDataTopoJson(
    //       state.dataset.topojsonFiles[state.dataset.geoIndex].url,
    //       state.dataset.topojsonObject
    //     )
    //   } else if (
    //     state.dataset.mode === modes.csvGeojson &&
    //     state.dataset.geojsonFiles.length > 0
    //   ) {
    //     dataSpec = vegaDataGeoJson(
    //       state.dataset.geojsonFiles[state.dataset.geoIndex].url
    //     )
    //   }
    // lookup geometry in combined topojson/geojson dataset
    // transformArray.push({
    //   lookup: state.dataset.csvId,
    //   from: {
    //     data: dataSpec,
    //     key: 'properties.'.concat(state.dataset.geoId),
    //   },
    //   as: 'geo',
    // })
    // lookup remainder of fields in topojson/geojson dataset
    //   transformArray.push({
    //     lookup: state.dataset.csvId,
    //     from: {
    //       data: dataSpec,
    //       key: 'properties.'.concat(state.dataset.geoId),
    //       fields: propertiesWithoutID.map(prop => `properties.${prop}`),
    //     },
    //     as: propertiesWithoutID,
    //   })
    // }
    // return transformArray
  },
  vegaSpec(state, getters) {
    // if (
    //   state.dataset.mode === modes.topojson ||
    //   state.dataset.mode === modes.csvTopojson
    // ) {
    //   spec = {
    //     ...spec,
    //     projection: {
    //       type: 'mercator',
    //     },
    //   }
    // }
    // return spec
  },
}

export const mutations = {
  setActiveLayerIndex(state, al) {
    state.activeLayerIndex = al
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
      state.vegaSpec.layer[layer].encoding[name] = null
      return
    }
    state.vegaSpec.layer[layer].encoding[name] = vegaEncoding(
      value,
      state.dataset.mode
    )
  },
  addLayer(state, l) {
    state.vegaSpec.layer.push(vegaLayer(l))
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
    state.vegaSpec.transform.push({
      calculate: t.calculate,
      as: t.calculate,
    })
  },
  addFilterTransform(state, t) {
    state.vegaSpec.transform.push({
      filter: t,
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
    commit('clearProjection')
    commit('setVegaSpecData', null)
    await dispatch('refreshVegaEmbed')
  },
  async updateSimpleEncodingOption(
    { state, commit, dispatch, getters },
    { aesthetic, option, value }
  ) {
    const encoding = getters.getActiveLayerEncoding(aesthetic)
    encoding[option] = value
  },
  async updateEncoding(
    { state, commit, dispatch, getters },
    { name, field, value }
  ) {
    console.log('updateEncoding-name', name)
    console.log('updateEncoding-field', field)
    console.log('updateEncoding-value', value)
    const currentEncoding = getters.getActiveLayerEncoding({ aesthetic: name })

    console.log(value)
    const diff = value.filter(x => !oldValue[x])
    if (diff.length === 0) {
      // when diff length is 0 this means a user has moved the draggable
      // from one aesthetic to another this should leave the original
      // aesthetic empty
    }
    commit('updateEncoding', {
      layer: state.activeLayerIndex,
      name,
      value,
    })
    console.log('updateEncoding')

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
  async addTransform({ commit, dispatch }, transform) {
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
    if (type === 'csv') {
      data = vegaDataCsv(state.dataset.csvFiles[index].url)
    } else if (type === 'geojson') {
      data = vegaDataGeoJson(state.dataset.geojsonFiles[index].url)
    } else if (type === 'topojson') {
      data = vegaDataTopoJson(state.dataset.topojsonFiles[index].url)
    }
    commit('setVegaSpecData', data)
    console.log('setVegaSpecData', state.vegaSpec)
    await dispatch('refreshVegaEmbed')
  },
  async refreshVegaEmbed({ state }) {
    try {
      console.log('New Spec', state.vegaSpec)
      const res = await embed('#viz', state.vegaSpec, {
        actions: false,
      })
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

      const newState = await downloadState(presignedUrlForDownload)
      // commit('setVegaSpec', newState.vegaSpec)
      await dispatch('refreshVegaEmbed')

      // await dispatch('geometries/loadStore', newState.geometries)
      // await dispatch('dataset/loadStore', newState.dataset)
      await dispatch('dataset/loadData')
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
        })
        commit('setSyncError', null)
      } catch (error) {
        commit(
          'setSyncError',
          `Error syncing with DAFNI backend. Response status is "${error}"`
        )
      }
    }
  },
}
