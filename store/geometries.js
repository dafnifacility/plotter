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
  geometryIndex: 0,
  geometries: [],
})

export const getters = {
  getSimpleAestheticOption:
    (state, getters) =>
    ({ aesthetic, option }) => {
      const aes = getters.getAestheticObject(aesthetic)
      console.log('1aes', aes)
      console.log('aesthetic', aesthetic)
      return aes[option]
    },
  getMaxBins:
    (state, getters) =>
    ({ aesthetic }) => {
      const aes = getters.getAestheticObject(aesthetic)
      console.log('2aes', aes)
      console.log('aesthetic', aesthetic)
      return (aes.bin && aes.bin.maxbins) || null
    },
  getScale:
    (state, getters) =>
    ({ aesthetic }) => {
      const aes = getters.getAestheticObject(aesthetic)
      console.log('3aes', aes)
      console.log('aesthetic', aesthetic)
      return (aes.scale && aes.scale.type) || null
    },
  getAestheticObject(state) {
    return function (aesthetic) {
      console.log('aesthet', aesthetic)
      const aesList = state.geometries[state.geometryIndex].aesthetics
      return deepCopy(aesList[aesthetic][0])
    }
  },
  selectedGeometry(state) {
    if (
      state.geometryIndex >= state.geometries.length ||
      state.geometryIndex < 0
    ) {
      return {
        type: 'None',
        aesthetics: {},
        options: {},
      }
    }
    return state.geometries[state.geometryIndex]
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
    const aes = state.geometries[state.geometryIndex].aesthetics
    aes[name] = value
  },
  addAesthetic(state, value) {
    const geometry = state.geometries[state.geometryIndex]
    geometry.aesthetics[value] = []
    geometry.aesthetics = { ...geometry.aesthetics }
  },
  setGeometryProperty(state, [index, prop, value]) {
    const geometry = state.geometries[index]
    geometry.options[prop] = value
  },
  removeAestheticColumn(state, { aesthetic, index }) {
    const aes = state.geometries[state.geometryIndex].aesthetics
    aes[aesthetic].splice(index, 1)
  },
  setGeometryIndex(state, index) {
    state.geometryIndex = index
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
  updateAesthetic({ commit, dispatch, state }, { name, value }) {
    const aesList = state.geometries[state.geometryIndex].aesthetics
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
  addGeometry({ state, commit, dispatch }, name) {
    const newGeometry = defaultGeometry(name)
    commit('addGeometry', newGeometry)
    commit('setGeometryIndex', state.geometries.length - 1)
    dispatch('addLayer', newGeometry, { root: true })
  },
  removeGeometry({ commit, dispatch, state }, index) {
    if (state.geometryIndex === index) {
      if (index >= state.geometries.length - 1) {
        commit('setGeometryIndex', index - 1)
      } else {
        commit('setGeometryIndex', index)
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
