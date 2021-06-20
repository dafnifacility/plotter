import { defaultColumn } from '~/store/dataset'
import { geometries } from '~/constants/geometries'
import modes from '~/constants/modes'

export function defaultGeometry(name = 'line') {
  const geo = geometries.filter(g => {
    return g.value === name
  })[0]
  return {
    type: name,
    aesthetics: geo.defaultAesthetics.reduce((map, aes) => {
      map[aes] = []
      return map
    }, {}),
    options: geo.options.reduce((map, option) => {
      map[option.value] = option.default
      return map
    }, {}),
  }
}

export const state = () => ({
  geometries: [],
})

export const getters = {
  getGeometryOption:
    state =>
    ({ option, index }) => {
      return state.geometries[index].options[option]
    },
}

export const mutations = {
  setDefaultGeometries(state, mode) {
    if (mode === modes.csvTopojson || mode === modes.csvGeojson) {
      state.geometries = [defaultGeometry('geoshape')]
      const geoField = defaultColumn()
      geoField.name = 'geo'
      geoField.type = 'geojson'
      state.geometries[0].aesthetics.shape = [geoField]
    } else if (mode === modes.topojson || mode === modes.geojson) {
      state.geometries = [defaultGeometry('geoshape')]
    } else {
      state.geometries = [defaultGeometry()]
    }
  },
  addAesthetic({ state, rootState }, value) {
    const geometry = state.geometries[rootState.activeLayerIndex]
    geometry.aesthetics[value] = []
    geometry.aesthetics = { ...geometry.aesthetics }
  },
  setGeometryOption(state, { index, option, value }) {
    const geometry = state.geometries[index]
    geometry.options[option] = value
  },
}

export const actions = {
  updateGeometryOption({ commit, dispatch }, { index, option, value }) {
    commit('setGeometryOption', { index, option, value })
    dispatch('updateLayerOption', { index, option, value }, { root: true })
  },
  loadStore({ state, commit, dispatch }, newState) {
    commit('setGeometryIndex', newState.geometryIndex)
    commit('setGeometries', newState.geometries)
    if (state.geometries.length === 0) {
      dispatch('addGeometry', 'line')
    }
  },
}
