<template>
  <v-expansion-panel
    prepend-icon="mdi-chart-scatter-plot"
    style="border: 1px solid #e0e0e0"
    @click="selectGeometry"
  >
    <v-expansion-panel-header
      :class="['px-3 py-2', headerClass]"
      disable-icon-rotate
    >
      <span>
        <v-icon :color="primaryBlue" v-text="geometry.icon" />
        {{ geometry.name }}
      </span>
      <template #actions>
        <v-btn icon @click="deleteGeometry">
          <v-icon :color="primaryBlue">mdi-delete</v-icon>
        </v-btn>
        <v-icon>$expand</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <Option
        v-for="option in geometry.options"
        :key="option.name"
        :option="option"
        :index="index"
        type="geometry"
      />
      <v-card-text v-if="geometry.options == 0"> No options </v-card-text>
    </v-expansion-panel-content>
  </v-expansion-panel>
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
      selectedGeometry: state => state.geometries.selectedGeometry,
      geometries: state => state.geometries.geometries,
    }),
    geometry() {
      return geometries.filter(geo => {
        return geo.name === this.data.type
      })[0]
    },
    supportedGeometries() {
      return geometries.map(geo => {
        return geo.name
      })
    },
    headerClass() {
      return this.index === this.selectedGeometry && 'bg-grey'
    },
    data() {
      return this.geometries[this.index]
    },
    type() {
      return this.data.type
    },
  },
  methods: {
    ...mapMutations({
      setSelectedGeometry: 'geometries/setSelectedGeometry',
    }),
    ...mapActions({
      removeGeometry: 'geometries/removeGeometry',
    }),
    selectGeometry() {
      this.setSelectedGeometry(this.index)
    },
    deleteGeometry() {
      this.removeGeometry(this.index)
    },
  },
}
</script>
