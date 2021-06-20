import { deepCopy } from '~/static/js/utils'
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
  getGeometries(state) {
    return state.geometries
  },
  getGeometryOption:
    state =>
    ({ option, index }) => {
      return state.geometries[index].options[option]
    },
  getAestheticObject(state, rootState) {
    return function (aesthetic) {
      console.log('aesthet', aesthetic)
      const aesList = state.geometries[rootState.activeLayerIndex].aesthetics
      return deepCopy(aesList[aesthetic][0])
    }
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
  updateAesthetic({ state, rootState }, { name, value }) {
    const aes = state.geometries[rootState.activeLayerIndex].aesthetics
    aes[name] = value
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
  removeAestheticColumn({ state, rootState }, { aesthetic, index }) {
    const aes = state.geometries[rootState.activeLayerIndex].aesthetics
    aes[aesthetic].splice(index, 1)
  },
}

export const actions = {
  removeAesthetic({ commit, dispatch }, { aesthetic, index }) {
    commit('removeAestheticColumn', { aesthetic, index })
    dispatch('updateEncoding', { name: aesthetic, value: null }, { root: true })
  },
  updateSimpleAestheticOption(
    { dispatch, getters },
    { aesthetic, option, value }
  ) {
    const currentAes = getters.getAestheticObject(aesthetic)
    currentAes[option] = value
    console.log('aesthetic', aesthetic)
    console.log('option', option)
    console.log('currentAes', currentAes)
    dispatch('updateAesthetic', { name: aesthetic, value: [currentAes] })
  },
  updateMaxBins({ dispatch, getters }, { aesthetic, value }) {
    const currentAes = getters.getAestheticObject(aesthetic)
    if (value) {
      currentAes.bin = {
        binned: true,
        maxbins: value,
      }
    } else {
      currentAes.bin = null
    }
    console.log('aesthetic', aesthetic)
    console.log('currentAes', currentAes)
    dispatch('updateAesthetic', { name: aesthetic, value: [currentAes] })
  },
  updateScale({ dispatch, getters }, { aesthetic, value }) {
    const currentAes = getters.getAestheticObject(aesthetic)
    if (value) {
      currentAes.scale = {
        type: value,
      }
    } else {
      currentAes.scale = null
    }
    console.log('aesthetic', aesthetic)
    console.log('currentAes', currentAes)
    dispatch('updateAesthetic', { name: aesthetic, value: [currentAes] })
  },
  updateAesthetic({ commit, dispatch, state, rootState }, { name, value }) {
    const aesList = state.geometries[rootState.activeLayerIndex].aesthetics
    const oldValue = aesList[name]
    const diff = value.filter(x => !oldValue.includes(x))
    if (diff.length === 0) {
      // when diff length is 0 this means a user has moved the draggable
      // from one aesthetic to another this should leave the original
      // aesthetic empty
      if (oldValue.calculate) {
        // If the existing aesthetic has a calculate field we need to delete
        // the transform as well as the aesthetic
        dispatch('removeTransform', name, { root: true })
      }
      commit('updateAesthetic', { name, value: [] })
      dispatch('updateEncoding', { name, value: null }, { root: true })
    } else {
      // when diff length is greater than 0 this means a user has moved a
      // draggable column onto an aesthetic and so we should add the column
      // to the aesthetic
      const column = diff[0]
      if (column.calculate) {
        // If the column has a calulate field set we need to add a transform to
        // the vega spec
        dispatch('addTransform', column, { root: true })
      }
      commit('updateAesthetic', { name, value: [{ ...column }] })
      dispatch('updateEncoding', { name, value: column }, { root: true })
    }
  },
  updateGeometryOption({ commit, dispatch }, { index, option, value }) {
    commit('setGeometryOption', { index, option, value })
    dispatch('updateLayerOption', { index, option, value }, { root: true })
  },
  async addGeometry({ state, commit, dispatch }, name) {
    const newGeometry = defaultGeometry(name)
    commit('addGeometry', newGeometry)
    commit('setActiveLayerIndex', state.geometries.length - 1, { root: true })
    await dispatch('addLayer', newGeometry, { root: true })
  },
  clearGeometries({ commit }) {
    commit('setGeometries', [])
    commit('setActiveLayerIndex', null, { root: true })
  },
  removeGeometry({ commit, dispatch, state, rootState }, index) {
    if (rootState.activeLayerIndex === index) {
      if (index >= state.geometries.length - 1) {
        commit('setActiveLayerIndex', index - 1, { root: true })
      } else {
        commit('setActiveLayerIndex', index, { root: true })
      }
    }
    commit('removeGeometry', index)
    dispatch('removeLayer', index, { root: true })
  },
  loadStore({ state, commit, dispatch }, newState) {
    commit('setGeometryIndex', newState.geometryIndex)
    commit('setGeometries', newState.geometries)
    if (state.geometries.length === 0) {
      dispatch('addGeometry', 'line')
    }
  },
}
