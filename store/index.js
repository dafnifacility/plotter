import { downloadState, replaceMinioUrl, uploadState } from '~/api/minio'
import { columnProperties } from '~/constants/aesthetics'
import modes from '~/constants/modes'
import { setupSyncStore } from '~/api/nivs'

export const state = () => ({
  vegaSpec: null,
  syncError: null,
  presignedUrlForUpload: null,
  vegaView: null,
})

function vegaMark(geometry) {
  const nonNullOptions = Object.fromEntries(
    Object.entries(geometry.options).filter(([_, v]) => v != null)
  )
  return {
    type: geometry.type,
    ...nonNullOptions,
  }
}

function vegaEncoding(geometry, mode) {
  const aesMap = geometry.aesthetics
  let fieldNamePrepend = ''
  if (mode === modes.topojson || mode === modes.geojson) {
    fieldNamePrepend = 'properties.'
  }
  return Object.keys(aesMap)
    .filter(key => {
      return aesMap[key].length > 0
    })
    .reduce((map, key) => {
      map[key] = {
        field: fieldNamePrepend.concat(aesMap[key][0].name),
        type: aesMap[key][0].type,
      }
      map = columnProperties.reduce((map, prop) => {
        const value = aesMap[key][0][prop.name]
        if (value) {
          if (prop.transform) {
            // do nothing
          } else {
            let baseObject = map[key]
            const numberOfKeys = prop.vegaKey.length
            // make sure that all the parent keys are defined
            for (let i = 0; i < numberOfKeys - 1; i++) {
              if (
                !(prop.vegaKey[i] in baseObject) ||
                typeof baseObject[prop.vegaKey[i]] !== 'object'
              ) {
                baseObject[prop.vegaKey[i]] = {}
              }
              baseObject = baseObject[prop.vegaKey[i]]
            }
            baseObject[prop.vegaKey[numberOfKeys - 1]] = value
          }
        }
        return map
      }, map)
      return map
    }, {})
}

function vegaDataTopoJson(URL, geoFeature) {
  return {
    url: replaceMinioUrl(URL),
    format: {
      type: 'topojson',
      feature: geoFeature,
    },
  }
}

function vegaDataGeoJson(URL) {
  return {
    url: replaceMinioUrl(URL),
    format: {
      property: 'features',
    },
  }
}

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
  vegaLayers(state) {
    const geometries = state.geometries.geometries
    return geometries.map(geom => {
      return {
        mark: vegaMark(geom),
        encoding: vegaEncoding(geom, state.dataset.mode),
      }
    })
  },
  vegaData(state) {
    const sD = state.dataset
    if (sD.mode === modes.topojson) {
      if (sD.geoIndex >= sD.topojsonFiles.length) {
        return {}
      }
      return vegaDataTopoJson(
        sD.topojsonFiles[sD.geoIndex].url,
        sD.topojsonObject
      )
    } else if (sD.mode === modes.geojson) {
      if (sD.geoIndex >= sD.geojsonFiles.length) {
        return {}
      }
      return vegaDataGeoJson(sD.geojsonFiles[sD.geoIndex].url)
    } else if (sD.mode === modes.csv) {
      if (sD.csvIndex >= sD.csvFiles.length) {
        return {}
      }
      return {
        url: replaceMinioUrl(sD.csvFiles[sD.csvIndex].url),
        name: 'table',
        format: {
          type: 'csv',
        },
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
    let spec = {
      data: getters.vegaData,
    }
    const vegaLayers = getters.vegaLayers
    if (vegaLayers.length === 1) {
      spec = {
        ...spec,
        ...vegaLayers[0],
      }
    } else {
      spec = {
        ...spec,
        layer: vegaLayers,
      }
    }
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
  vegaSpec(state, spec) {
    state.vegaSpec = spec
  },
  setVegaView(state, view) {
    state.vegaView = view
  },
  setSyncError(state, err) {
    state.syncError = err
  },
  setPresignedUrlForUpload(state, url) {
    state.presignedUrlForUpload = url
  },
}

export const actions = {
  async loadStore({ commit, dispatch }) {
    try {
      const presignedUrls = await setupSyncStore()
      const presignedUrlForDownload = presignedUrls[0]
      commit('setPresignedUrlForUpload', presignedUrls[1])

      const newState = await downloadState(presignedUrlForDownload)
      await dispatch('geometries/loadStore', newState.geometries)
      await dispatch('dataset/loadStore', newState.dataset)
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
        await uploadState(presignedUrlForUpload, state)
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
