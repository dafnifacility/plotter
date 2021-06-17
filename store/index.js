import { backendsPromise, nidMinioUrl } from '~/api/backends'
import { downloadState, replaceMinioUrl, uploadState } from '~/api/minio'
import { columnProperties } from '~/constants/aesthetics'
import embed from 'vega-embed'
import modes from '~/constants/modes'
import { setupSyncStore } from '~/api/nivs'

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
      encoding.field = `${fieldNamePrepend}${aesthetic[key]}`
      return
    }
    encoding[key] = aesthetic[key]
  })
  return encoding
  // .reduce((map, key) => {
  //   map[key] = {
  //     field: fieldNamePrepend.concat(aesMap[key][0].name),
  //     type: aesMap[key][0].type,
  //   }
  //   map = columnProperties.reduce((map, prop) => {
  //     const value = aesMap[key][0][prop.name]
  //     if (value) {
  //       if (prop.transform) {
  //         // do nothing
  //       } else {
  //         let baseObject = map[key]
  //         const numberOfKeys = prop.vegaKey.length
  //         // make sure that all the parent keys are defined
  //         for (let i = 0; i < numberOfKeys - 1; i++) {
  //           if (
  //             !(prop.vegaKey[i] in baseObject) ||
  //             typeof baseObject[prop.vegaKey[i]] !== 'object'
  //           ) {
  //             baseObject[prop.vegaKey[i]] = {}
  //           }
  //           baseObject = baseObject[prop.vegaKey[i]]
  //         }
  //         baseObject[prop.vegaKey[numberOfKeys - 1]] = value
  //       }
  //     }
  //     return map
  //   }, map)
  //   return map
  // }, {})
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
    width: null,
    height: null,
  },
  syncError: null,
  presignedUrlForUpload: null,
})

export const getters = {
  option(state, getters) {
    return (type, name, args) => {
      if (type === 'column') {
        const column = state.dataset.columns[args.index]
        return column[name]
      } else if (type === 'aesthetic') {
        const aesthetic = args.aesthetic
        const selectedGeometry = getters['geometries/geometry']
        return selectedGeometry.aesthetics[aesthetic][0][name]
      } else if (type === 'geometry') {
        const geometry = state.geometries.geometries[args.index]
        return geometry.options[name]
      } else {
        throw new Error(`unknown option type ${type}`)
      }
    }
  },
  vegaTransform(state) {
    const geometries = state.geometries.geometries
    const allCalculateExpressions = geometries.reduce((outerSet, geom) => {
      const aesMap = geom.aesthetics
      return Object.keys(aesMap)
        .filter(key => {
          return aesMap[key].length > 0
        })
        .reduce((innerSet, key) => {
          const calculateExpression = aesMap[key][0].calculate
          if (calculateExpression) {
            innerSet.add(calculateExpression)
          }
          return innerSet
        }, outerSet)
    }, new Set())
    let transformArray = []
    if (allCalculateExpressions) {
      const calcArray = Array.from(allCalculateExpressions)
      const mappedArray = calcArray.map(expr => {
        return {
          calculate: expr,
          as: expr,
        }
      })
      transformArray = transformArray.concat(mappedArray)
    }
    const filterExpression = state.dataset.filter
    if (filterExpression) {
      transformArray.push({
        filter: filterExpression,
      })
    }

    if (
      state.dataset.mode === modes.csvTopojson ||
      state.dataset.mode === modes.csvGeojson
    ) {
      const propertiesWithoutID = state.dataset.geoProperties.filter(
        prop => prop !== state.dataset.geoId
      )
      let dataSpec = null
      if (
        state.dataset.mode === modes.csvTopojson &&
        state.dataset.topojsonFiles.length > 0
      ) {
        dataSpec = vegaDataTopoJson(
          state.dataset.topojsonFiles[state.dataset.geoIndex].url,
          state.dataset.topojsonObject
        )
      } else if (
        state.dataset.mode === modes.csvGeojson &&
        state.dataset.geojsonFiles.length > 0
      ) {
        dataSpec = vegaDataGeoJson(
          state.dataset.geojsonFiles[state.dataset.geoIndex].url
        )
      }

      // lookup geometry in combined topojson/geojson dataset
      transformArray.push({
        lookup: state.dataset.csvId,
        from: {
          data: dataSpec,
          key: 'properties.'.concat(state.dataset.geoId),
        },
        as: 'geo',
      })

      // lookup remainder of fields in topojson/geojson dataset
      transformArray.push({
        lookup: state.dataset.csvId,
        from: {
          data: dataSpec,
          key: 'properties.'.concat(state.dataset.geoId),
          fields: propertiesWithoutID.map(prop => `properties.${prop}`),
        },
        as: propertiesWithoutID,
      })
    }
    return transformArray
  },
  vegaSpec(state, getters) {
    let spec = {}
    const vTransform = getters.vegaTransform
    if (vTransform.length > 0) {
      spec = {
        ...spec,
        transform: vTransform,
      }
    }
    if (
      state.dataset.mode === modes.topojson ||
      state.dataset.mode === modes.csvTopojson
    ) {
      spec = {
        ...spec,
        projection: {
          type: 'mercator',
        },
      }
    }
    return spec
  },
}

export const mutations = {
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
    state.vegaSpec.layer[layer].encoding[name] = vegaEncoding(value)
  },
  addLayer(state, l) {
    state.vegaSpec.layer.push({
      mark: vegaMark(l),
      encoding: {},
    })
  },
  setSyncError(state, err) {
    state.syncError = err
  },
  setPresignedUrlForUpload(state, url) {
    state.presignedUrlForUpload = url
  },
}

export const actions = {
  async updateEncoding({ state, commit, dispatch }, { name, value }) {
    commit('updateEncoding', {
      layer: state.geometries.selectedGeometry,
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
  async setVegaSpecData({ state, commit, dispatch }, d) {
    await backendsPromise
    let data = {}
    if (d.type === 'csv') {
      data = vegaDataCsv(state.dataset.csvFiles[d.index].url)
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
  setOption({ commit }, [type, name, args, value]) {
    if (type === 'column') {
      commit('dataset/setColumn', [args.index, name, value])
    } else if (type === 'aesthetic') {
      const aesthetic = args.aesthetic
      commit('geometries/setAestheticColumnProperty', [
        aesthetic,
        0,
        name,
        value,
      ])
    } else if (type === 'geometry') {
      commit('geometries/setGeometryProperty', [args.index, name, value])
    } else {
      throw new Error(`unknown option type ${type}`)
    }
  },
  removeColumn({ commit }, [type, index, aesthetic]) {
    if (type === 'column') {
      commit('dataset/removeColumn', [index])
    } else if (type === 'aesthetic') {
      commit('geometries/removeAestheticColumn', [aesthetic, 0])
    }
  },
}
