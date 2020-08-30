import { geometries } from '~/constants/geometries'
import { defaultColumn } from '~/store/dataset'

function defaultGeometry(name = 'line') {
  console.log('contructing defaultGeometry', name)
  const geo = geometries.filter((geo) => {
    return geo.name === name
  })[0]
  console.log(geo)
  console.log(geo.defaultAesthetics)
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
  geometries: [defaultGeometry()],
})

export const actions = {
  removeGeometry({ commit, state }, index) {
    console.log('remove geometry', index)
    if (state.selectedGeometry === index) {
      console.log('removing selected', state.selectedGeometry)
      if (index >= state.geometries.length - 1) {
        commit('setSelectedGeometry', index - 1)
      } else {
        commit('setSelectedGeometry', index)
      }
    }
    commit('removeGeometry', index)
  },
}

export const mutations = {
  addGeometry(state, name) {
    const newGeometry = defaultGeometry(name)
    state.geometries.push(newGeometry)
    state.selectedGeometry = state.geometries.length - 1
  },
  setDefaultGeometries(state, mode) {
    if (mode === 'csv + topojson') {
      state.geometries = [defaultGeometry('geoshape')]
      const geoField = defaultColumn()
      geoField.name = 'geo'
      geoField.type = 'geojson'
      state.geometries[0].aesthetics.shape = [geoField]
    } else if (mode === 'topojson') {
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
  updateAesthetics(state, [name, value]) {
    const aes = state.geometries[state.selectedGeometry].aesthetics
    const oldValue = aes[name]
    const diff = value.filter((x) => !oldValue.includes(x))
    // should just be zero or one column in aesthetic now
    if (diff.length === 0) {
      aes[name] = []
    } else {
      const column = diff[0]
      // make sure this is copied
      aes[name] = [{ ...column }]
    }
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
    console.log('set geometry property', index, prop, value)
    const geometry = state.geometries[index]
    geometry.options[prop] = value
  },
  removeAestheticColumn(state, [aesthetic, index]) {
    const aes = state.geometries[state.selectedGeometry].aesthetics
    aes[aesthetic].splice(index, 1)
  },
  setSelectedGeometry(state, index) {
    console.log('select index', index)
    state.selectedGeometry = index
  },
}

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
