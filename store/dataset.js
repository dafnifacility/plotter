import * as CSV from 'csv-string'
import { columnProperties } from '~/constants/aesthetics'

export const state = () => {
  return {
    mode: 'csv',
    csvIndex: 0,
    csvFiles: [],
    csvError: null,
    topojsonError: null,
    geojsonError: null,
    loadCsvProgress: 0,
    geoIndex: 0,
    topojsonFiles: [],
    geojsonFiles: [],
    loadGeoProgress: 0,
    geoProperties: [],
    geoId: '',
    topojsonObject: '',
    preLookupAgregate: '',
    csvId: '',
    columns: [],
    columnsInDataFile: [],
    filter: null,
  }
}

export function defaultColumn() {
  return columnProperties.reduce((map, prop) => {
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
  setLoadCsvProgress(state, value) {
    state.loadCsvProgress = value
  },
  setLoadGeoProgress(state, value) {
    state.loadGeoProgress = value
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
  setTopjsonObject(state, value) {
    state.topojsonObject = value
  },
  setPrelookupAgregate(state, value) {
    state.preLookupAgregate = value
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
  loadStore({ commit }, newState) {
    commit('setMode', newState.mode)
    commit('setCsvIndex', newState.csvIndex)
    commit('setGeoIndex', newState.geoIndex)
    commit('setGeoProperties', newState.geoProperties)
    commit('setGeoProperties', newState.geoProperties)
    commit('setGeoId', newState.geoId)
    commit('setTopjsonObject', newState.topjsonObject)
    commit('setPrelookupAgregate', newState.preLookupAgregate)
    commit('setCsvId', newState.csvId)
    commit('setColumns', newState.columns)
    commit('setFilter', newState.filter)
  },
  async loadData({ state, commit, dispatch }) {
    await dispatch('discovery/getDatasetsAndPopulateFileLists', null, {
      root: true,
    })
    if (state.mode === 'csv') {
      dispatch('loadCsvData')
    } else if (state.mode === 'topojson') {
      dispatch('loadTopojsonData')
    } else if (state.mode === 'csv + topojson') {
      dispatch('loadCsvData')
      dispatch('loadTopojsonData')
    } else if (state.mode === 'geojson') {
      dispatch('loadGeojsonData')
    } else if (state.mode === 'csv + geojson') {
      dispatch('loadCsvData')
      dispatch('loadGeojsonData')
    }
  },
  loadCsvData({ state, commit }) {
    if (state.csvIndex >= state.csvFiles.length) {
      return
    }
    return fetch(state.csvFiles[state.csvIndex].url, {
      method: 'GET',
    })
      .then(response => response.text())
      .then(function (text) {
        const data = CSV.parse(text)
        const columnNames = data[0]
        const columns = columnNames.map((columnName, i) => {
          const defaultProps = defaultColumn()
          defaultProps.type = guessColumnType(data[1][i])
          return {
            name: columnName,
            ...defaultProps,
          }
        })
        commit('setColumns', columns.slice(0, 5))
        commit('setColumnsInDatafile', columns)
        commit('setCsvError', null)
      })
      .catch(function (error) {
        commit('setCsvError', 'Error loading csv: '.concat(error))
      })
  },
  loadTopojsonData({ commit, state }) {
    if (state.geoIndex >= state.topojsonFiles.length) {
      return
    }
    return fetch(state.topojsonFiles[state.geoIndex].url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(function (json) {
        if ('objects' in json) {
          const object = Object.keys(json.objects)[0]
          const properties = json.objects[object].geometries[0].properties
          const propertyNames = Object.keys(properties)
          commit('setTopjsonObject', object)
          commit('setGeoProperties', propertyNames)
          const columns = propertyNames.map(columnName => {
            const defaultProps = defaultColumn()
            defaultProps.type = guessColumnType(properties[columnName])
            return {
              name: columnName,
              ...defaultProps,
            }
          })
          if (state.mode === 'topojson') {
            commit('setColumns', columns.slice(0, 5))
            commit('setColumnsInDatafile', columns)
          } else if (state.mode === 'csv + topojson') {
            commit(
              'setColumnsInDatafile',
              removeDuplicateColumns(state.columnsInDataFile.concat(columns))
            )
          }
          commit('setTopojsonError', null)
        } else {
          commit('setTopojsonError', 'Error loading topojson')
        }
      })
      .catch(function (error) {
        commit('setTopojsonError', 'Error loading topojson: '.concat(error))
      })
  },
  loadGeojsonData({ commit, state }) {
    if (state.geoIndex >= state.geojsonFiles.length) {
      return
    }
    return fetch(state.geojsonFiles[state.geoIndex].url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(function (json) {
        if ('features' in json) {
          const properties = json.features[0].properties
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
          if (state.mode === 'geojson') {
            commit('setColumns', columns.slice(0, 5))
            commit('setColumnsInDatafile', columns)
          } else if (state.mode === 'csv + geojson') {
            commit(
              'setColumnsInDatafile',
              removeDuplicateColumns(state.columnsInDataFile.concat(columns))
            )
          }
          commit('setGeojsonError', null)
        } else {
          commit('setGeojsonError', 'Error loading geojson')
        }
      })
      .catch(function (error) {
        commit('setGeojsonError', 'Error loading geojson: '.concat(error))
      })
  },
}
