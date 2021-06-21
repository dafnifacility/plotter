import * as CSV from 'csv-string'
import { aestheticOptions } from '~/constants/aesthetics'
import { downloadFile } from '~/api/minio'
import modes from '~/constants/modes'

export const state = () => {
  return {
    mode: null,
    csvId: '',
    csvIndex: null,
    csvFiles: [],
    csvError: null,
    geoId: '',
    geoIndex: null,
    geojsonFiles: [],
    geojsonError: null,
    geoProperties: [],
    topojsonFiles: [],
    topojsonError: null,
    topojsonObject: '',
    columns: [],
    columnsInDataFile: [],
    filter: null,
  }
}

export function defaultColumn() {
  return aestheticOptions.reduce((map, prop) => {
    map[prop.name] = prop.default
    return map
  }, {})
}

function removeDuplicateColumns(columns) {
  const noDuplicates = columns.reduce((map, v) => {
    map[v.name] = {
      ...v,
    }
    return map
  }, {})
  const noDuplicatesArray = Object.keys(noDuplicates).map(key => {
    return {
      ...noDuplicates[key],
    }
  })
  return noDuplicatesArray
}

export const mutations = {
  setCsvFiles(state, value) {
    state.csvFiles = value
  },
  setTopojsonFiles(state, value) {
    state.topojsonFiles = value
  },
  setGeojsonFiles(state, value) {
    state.geojsonFiles = value
  },
  setCsvError(state, value) {
    state.csvError = value
  },
  setTopojsonError(state, value) {
    state.topojsonError = value
  },
  setGeojsonError(state, value) {
    state.geojsonError = value
  },
  setMode(state, value) {
    state.mode = value
  },
  setCsvIndex(state, value) {
    state.csvIndex = value
  },
  addGeoField(state) {
    const geoField = defaultColumn()
    geoField.name = 'geo'
    geoField.type = 'geojson'
    state.columns.unshift(geoField)
  },
  setGeoIndex(state, value) {
    state.geoIndex = value
  },
  setGeoProperties(state, value) {
    state.geoProperties = value
  },
  setGeoId(state, value) {
    state.geoId = value
  },
  setTopojsonObject(state, value) {
    state.topojsonObject = value
  },
  setCsvId(state, value) {
    state.csvId = value
  },
  setFilter(state, value) {
    state.filter = value
  },
  setColumns(state, value) {
    state.columns = removeDuplicateColumns(value)
  },
  setColumnsInDatafile(state, value) {
    state.columnsInDataFile = removeDuplicateColumns(value)
  },
  addColumn(state, name) {
    const newColumn = state.columnsInDataFile.filter(c => {
      return c.name === name
    })
    if (newColumn.length === 0) {
      throw new Error('cannot add a column not in the data file')
    }
    state.columns.push(newColumn[0])
  },
  setColumnProperty(state, [index, prop, value]) {
    state.columns[index][prop] = value
  },
  addCalculateField(state, expression) {
    const newField = defaultColumn()
    newField.name = expression
    newField.calculate = expression
    state.columns.push(newField)
  },
  removeColumn(state, index) {
    state.columns.splice(index, 1)
  },
}

function guessColumnType(data) {
  if (!isNaN(data)) {
    return 'quantitative'
  } else if (!isNaN(Date.parse(data))) {
    return 'temporal'
  } else {
    return 'nominal'
  }
}

export const actions = {
  setMode({ commit }, mode) {
    commit('setMode', mode)
    if (mode === modes.topojson || mode === modes.csvTopojson) {
      commit('addProjection', null, { root: true })
    } else {
      commit('clearProjection', null, { root: true })
    }
  },
  setFilter({ commit, dispatch }, value) {
    commit('setFilter', value)
    if (value || value !== '') {
      dispatch('addFilter', value, { root: true })
    } else {
      dispatch('removeFilter', null, { root: true })
    }
  },
  async setCsvIndex({ state, commit, dispatch }, index) {
    await dispatch('resetSpec', null, { root: true })
    commit('setCsvIndex', index)
    commit('setCsvId', '')
    if (index !== null) {
      await dispatch(
        'setVegaSpecData',
        {
          type: 'csv',
          index,
        },
        {
          root: true,
        }
      )
      await dispatch('loadCsvData')
      if (state.mode === modes.csvTopojson) {
        commit('addGeoField')
      }
    }
  },
  async setGeoIndex({ state, commit, dispatch }, { index, type }) {
    await dispatch('resetSpec', null, { root: true })
    commit('setGeoIndex', index)
    commit('setGeoId', '')
    if (index !== null) {
      if (type === 'topojson') {
        await dispatch('loadTopojsonData')
      } else if (type === 'geojson') {
        await dispatch('loadGeojsonData')
      }
      await dispatch(
        'setVegaSpecData',
        {
          type,
          index,
        },
        {
          root: true,
        }
      )
    }
  },
  loadStore({ commit }, newState) {
    commit('setMode', newState.mode)
    commit('setCsvId', newState.csvId)
    commit('setCsvIndex', newState.csvIndex)
    commit('setCsvFiles', newState.csvFiles)
    commit('setGeoId', newState.geoId)
    commit('setGeoIndex', newState.geoIndex)
    commit('setGeojsonFiles', newState.geojsonFiles)
    commit('setGeoProperties', newState.geoProperties)
    commit('setTopojsonFiles', newState.topojsonFiles)
    commit('setTopojsonObject', newState.topojsonObject)
    commit('setColumns', newState.columns)
    commit('setColumnsInDatafile', newState.columnsInDataFile)
    commit('setFilter', newState.filter)
  },
  async loadData({ state, dispatch }) {
    await dispatch('discovery/getDatasetsAndPopulateFileLists', null, {
      root: true,
    })
    if (state.mode === modes.csv) {
      await dispatch('loadCsvData')
    } else if (state.mode === modes.topojson) {
      await dispatch('loadTopojsonData')
    } else if (state.mode === modes.csvTopojson) {
      await dispatch('loadCsvData')
      await dispatch('loadTopojsonData')
    } else if (state.mode === modes.geojson) {
      await dispatch('loadGeojsonData')
    } else if (state.mode === modes.csvGeojson) {
      await dispatch('loadCsvData')
      await dispatch('loadGeojsonData')
    }
  },
  async loadCsvData({ state, commit, dispatch, rootState }) {
    if (state.csvIndex === null || state.csvIndex >= state.csvFiles.length)
      return

    try {
      const data = await downloadFile(state.csvFiles[state.csvIndex].url)
      const csvData = CSV.parse(data)
      const columnNames = csvData[0]
      const columns = columnNames.map((columnName, i) => {
        const defaultProps = defaultColumn()
        defaultProps.type = guessColumnType(csvData[1][i])
        return {
          name: columnName,
          ...defaultProps,
        }
      })
      commit('setColumns', columns.slice(0, 5))
      commit('setColumnsInDatafile', columns)
      if (rootState.geometries.geometries.length === 0) {
        dispatch('geometries/addGeometry', 'line', { root: true })
      }
      commit('setCsvError', null)
    } catch (error) {
      console.error(error)
      commit('setCsvError', `Error loading csv: ${error}`)
    }
  },
  async loadTopojsonData({ state, commit, dispatch, rootState }) {
    if (state.geoIndex === null || state.geoIndex >= state.topojsonFiles.length)
      return

    try {
      const data = await downloadFile(state.topojsonFiles[state.geoIndex].url)
      if ('objects' in data) {
        const object = Object.keys(data.objects)[0]
        const properties = data.objects[object].geometries[0].properties
        const propertyNames = Object.keys(properties)
        commit('setTopojsonObject', object)
        commit('setGeoProperties', propertyNames)
        const columns = propertyNames.map(columnName => {
          const defaultProps = defaultColumn()
          defaultProps.type = guessColumnType(properties[columnName])
          return {
            name: columnName,
            ...defaultProps,
          }
        })
        if (state.mode === modes.topojson) {
          commit('setColumns', columns.slice(0, 5))
          commit('setColumnsInDatafile', columns)
          if (rootState.geometries.geometries.length === 0) {
            dispatch('geometries/addGeometry', 'geoshape', { root: true })
          }
        } else if (state.mode === modes.csvTopojson) {
          commit(
            'setColumnsInDatafile',
            removeDuplicateColumns(state.columnsInDataFile.concat(columns))
          )
        }
        commit('setTopojsonError', null)
      } else {
        commit('setTopojsonError', 'Error loading topojson')
      }
    } catch (error) {
      commit('setTopojsonError', 'Error loading topojson: '.concat(error))
    }
  },
  async loadGeojsonData({ state, commit, rootState, dispatch }) {
    if (state.geoIndex === null || state.geoIndex >= state.geojsonFiles.length)
      return
    try {
      const data = await downloadFile(state.geojsonFiles[state.geoIndex].url)
      if ('features' in data) {
        const properties = data.features[0].properties
        const propertyNames = Object.keys(properties)
        commit('setGeoProperties', propertyNames)
        const columns = propertyNames.map(columnName => {
          const defaultProps = defaultColumn()
          defaultProps.type = guessColumnType(properties[columnName])
          return {
            name: columnName,
            ...defaultProps,
          }
        })
        if (state.mode === modes.geojson) {
          commit('setColumns', columns.slice(0, 5))
          commit('setColumnsInDatafile', columns)
          if (rootState.geometries.geometries.length === 0) {
            dispatch('geometries/addGeometry', 'geoshape', { root: true })
          }
        } else if (state.mode === modes.csvGeojson) {
          commit(
            'setColumnsInDatafile',
            removeDuplicateColumns(state.columnsInDataFile.concat(columns))
          )
        }
        commit('setGeojsonError', null)
      } else {
        commit('setGeojsonError', 'Error loading geojson')
      }
    } catch (error) {
      console.error(error)
      commit('setGeojsonError', `Error loading geojson: ${error}`)
    }
  },
}
