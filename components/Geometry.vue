<template>
  <v-card :class="[headerClass]" outlined @click="selectGeometry">
    <v-card-title style="font-size: 1rem; display: flex">
      <v-icon :color="primaryBlue" class="pr-1" v-text="geometry.icon" />
      {{ geometry.text }}
      <v-spacer />
      <v-btn icon @click="deleteGeometry">
        <v-icon :color="primaryBlue">mdi-delete</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="geometry.options.length > 0">
      <v-row>
        <GeometryOption
          v-for="option in geometry.options"
          :key="option.value"
          :option="option"
          :index="index"
          type="geometry"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { geometries } from '~/constants/geometries'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Geometry',
  props: {
    index: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return { primaryBlue }
  },
  computed: {
    ...mapState({
      activeLayerIndex: state => state.activeLayerIndex,
      layers: state => state.vegaSpec.layer,
    }),
    geometry() {
      return geometries.find(geo => geo.value === this.type)
    },
    supportedGeometries() {
      return geometries.map(geo => {
        return geo.value
      })
    },
    headerClass() {
      return this.index === this.activeLayerIndex && 'bg-grey'
    },
    type() {
      return this.layers[this.index].mark.type
    },
  },
  methods: {
    ...mapMutations({
      setActiveLayerIndex: 'setActiveLayerIndex',
    }),
    ...mapActions({
      removeLayer: 'removeLayer',
    }),
    selectGeometry() {
      this.setActiveLayerIndex(this.index)
    },
    deleteGeometry() {
      this.removeLayer(this.index)
    },
  },
}
</script>
