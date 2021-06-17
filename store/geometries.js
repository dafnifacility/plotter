import { defaultColumn } from '~/store/dataset'
import { geometries } from '~/constants/geometries'
import modes from '~/constants/modes'

export function defaultGeometry(name = 'line') {
  const geo = geometries.filter(geo => {
    return geo.name === name
  })[0]
  return {
    type: name,
    aesthetics: geo.defaultAesthetics.reduce((map, aes) => {
      map[aes] = []
      return map
    }, {}),
    options: geo.options.reduce((map, option) => {
      map[option.name] = option.default
      return map
    }, {}),
  }
}

export const state = () => ({
  selectedGeometry: 0,
  geometries: [],
})

export const getters = {
  geometry(state) {
    if (
      state.selectedGeometry >= state.geometries.length ||
      state.selectedGeometry < 0
    ) {
      return {
        type: 'None',
        aesthetics: {},
        options: {},
      }
    }
    return state.geometries[state.selectedGeometry]
  },
}

export const mutations = {
  addGeometry(state, g) {
    state.geometries.push(g)
  },
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
  removeGeometry(state, index) {
    state.geometries.splice(index, 1)
  },
  setGeometries(state, value) {
    state.geometries = value
  },
  updateAesthetic(state, { name, value }) {
    const aes = state.geometries[state.selectedGeometry].aesthetics
    const oldValue = aes[name]
    const diff = value.filter(x => !oldValue.includes(x))
    const column = diff[0]
    aes[name] = [{ ...column }]
  },
  setAesthetics(state, value) {
    state.aesthetics = value
  },
  addAesthetic(state, value) {
    const geometry = state.geometries[state.selectedGeometry]
    geometry.aesthetics[value] = []
    geometry.aesthetics = { ...geometry.aesthetics }
  },
  setAestheticColumnProperty(state, [aesthetic, index, prop, value]) {
    const aes = state.geometries[state.selectedGeometry].aesthetics
    aes[aesthetic][index][prop] = value
  },
  setGeometryProperty(state, [index, prop, value]) {
    const geometry = state.geometries[index]
    geometry.options[prop] = value
  },
  removeAestheticColumn(state, [aesthetic, index]) {
    const aes = state.geometries[state.selectedGeometry].aesthetics
    aes[aesthetic].splice(index, 1)
  },
  setSelectedGeometry(state, index) {
    state.selectedGeometry = index
  },
}

export const actions = {
  updateAesthetic({ commit, dispatch }, { name, value }) {
    commit('updateAesthetic', { name, value })
    dispatch('updateAesthetic', { name, value: value[0] }, { root: true })
  },
  addAesthetic({ state, commit, dispatch }, aesthetic) {
    console.log('AddAesthetic Action')
    commit('addAesthetic', aesthetic)
    commit('setSelectedGeometry', state.geometries.length - 1)
    dispatch('addAesthetic', aesthetic, { root: true })
  },
  addGeometry({ state, commit, dispatch }, name) {
    const newGeometry = defaultGeometry(name)
    commit('addGeometry', newGeometry)
    commit('setSelectedGeometry', state.geometries.length - 1)
    dispatch('addLayer', newGeometry, { root: true })
  },
  loadStore({ state, commit, dispatch }, newState) {
    commit('setSelectedGeometry', newState.selectedGeometry)
    commit('setGeometries', newState.geometries)
    if (state.geometries.length === 0) {
      dispatch('addGeometry', 'line')
    }
  },
  removeGeometry({ commit, state }, index) {
    if (state.selectedGeometry === index) {
      if (index >= state.geometries.length - 1) {
        commit('setSelectedGeometry', index - 1)
      } else {
        commit('setSelectedGeometry', index)
      }
    }
    commit('removeGeometry', index)
  },
}
