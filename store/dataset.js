import axios from 'axios'
import * as CSV from 'csv-string'
import { columnProperties } from '~/constants/aesthetics'
import { csvFiles, topojsonFiles, geojsonFiles } from '~/constants/data'

export const state = () => ({
  mode: 'csv',
  csvUrl: csvFiles[0].url,
  csvError: null,
  topojsonError: null,
  geojsonError: null,
  loadCsvProgress: 0,
  geoUrl: topojsonFiles[0].url,
  loadGeoProgress: 0,
  geoProperties: [],
  geoId: '',
  topojsonObject: '',
  preLookupAgregate: '',
  csvId: '',
  columns: [],
  columnsInDataFile: [],
  filter: null,
})

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
  const noDuplicatesArray = Object.keys(noDuplicates).map((key) => {
    return {
      ...noDuplicates[key],
    }
  })
  return noDuplicatesArray
}

export const mutations = {
  setCsvError(state, value) {
    state.csvError = value
  },
  setTopojsonError(state, value) {
    console.log('setTopojsonError', value)
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
  setCsvUrl(state, value) {
    state.csvUrl = value
  },
  addGeoField(state) {
    const geoField = defaultColumn()
    geoField.name = 'geo'
    geoField.type = 'geojson'
    state.columns.unshift(geoField)
  },
  setGeoUrl(state, value) {
    state.geoUrl = value
  },
  setDefaultGeoUrl(state, mode) {
    if (mode === 'topojson' || mode === 'csv + topojson') {
      state.geoUrl = topojsonFiles[0].url
    } else {
      state.geoUrl = geojsonFiles[0].url
    }
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
    const newColumn = state.columnsInDataFile.filter((c) => {
      return c.name === name
    })[0]
    state.columns.push(newColumn)
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
  loadCsvData(context) {
    return axios({
      methods: 'get',
      url: context.state.csvUrl,
      onDownloadProgress(progressEvent) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        context.commit('setLoadCsvProgress', percentCompleted)
      },
    })
      .then(function (response) {
        if (response.headers['content-type'].includes('csv')) {
          const data = CSV.parse(response.data)
          const columnNames = data[0]
          const columns = columnNames.map((columnName, i) => {
            const defaultProps = defaultColumn()
            defaultProps.type = guessColumnType(data[1][i])
            return {
              name: columnName,
              ...defaultProps,
            }
          })
          context.commit('setColumns', columns.slice(0, 5))
          context.commit('setColumnsInDatafile', columns)
          context.commit('setCsvError', null)
        } else {
          context.commit('setCsvError', 'Error loading csv')
        }
      })
      .catch(function (error) {
        context.commit('setCsvError', 'Error loading csv: '.concat(error))
      })
  },
  loadTopojsonData({ commit, state }) {
    return axios({
      methods: 'get',
      url: state.geoUrl,
      onDownloadProgress(progressEvent) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        commit('setLoadGeoProgress', percentCompleted)
      },
    })
      .then(function (response) {
        console.log(response)

        const isObject =
          typeof response.data === 'object' && response.data !== null
        if (isObject && 'objects' in response.data) {
          const object = Object.keys(response.data.objects)[0]
          const properties =
            response.data.objects[object].geometries[0].properties
          const propertyNames = Object.keys(properties)
          commit('setTopjsonObject', object)
          commit('setGeoProperties', propertyNames)
          if (state.mode === 'topojson') {
            const columns = propertyNames.map((columnName) => {
              const defaultProps = defaultColumn()
              defaultProps.type = guessColumnType(properties[columnName])
              return {
                name: columnName,
                ...defaultProps,
              }
            })
            commit('setColumns', columns.slice(0, 5))
            commit('setColumnsInDatafile', columns)
          }
          commit('setTopojsonError', null)
        } else {
          commit('setTopojsonError', 'Error loading topojson')
        }
      })
      .catch(function (error) {
        commit('setTopjsonError', 'Error loading topojson: '.concat(error))
      })
  },
  loadGeojsonData({ commit, state }) {
    return axios({
      methods: 'get',
      url: state.geoUrl,
      onDownloadProgress(progressEvent) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        commit('setLoadGeoProgress', percentCompleted)
      },
    })
      .then(function (response) {
        console.log(response)
        const isObject =
          typeof response.data === 'object' && response.data !== null
        if (isObject && 'features' in response.data) {
          const properties = response.data.features[0].properties
          const propertyNames = Object.keys(properties)
          commit('setGeoProperties', propertyNames)
          if (state.mode === 'geojson') {
            const columns = propertyNames.map((columnName) => {
              const defaultProps = defaultColumn()
              defaultProps.type = guessColumnType(properties[columnName])
              return {
                name: columnName,
                ...defaultProps,
              }
            })
            commit('setColumns', columns.slice(0, 5))
            commit('setColumnsInDatafile', columns)
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
