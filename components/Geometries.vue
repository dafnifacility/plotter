<template>
  <div>
    <v-expansion-panels
      v-model="panelOpen"
      flat
      hover
      style="border: 1px solid #e0e0e0"
    >
      <v-expansion-panel>
        <v-expansion-panel-header
          class="py-3 text-h6 font-weight-bold bg-grey"
          disable-icon-rotate
        >
          <v-icon :color="primaryBlue" class="pr-1" style="flex: none">
            mdi-shape-plus
          </v-icon>
          Geometries
          <template #actions>
            <d-btn secondary @click.stop="openGeometriesDialog">
              Add geometry
            </d-btn>
            <v-icon class="pl-3" :color="primaryBlue">$expand</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-divider />
        <v-expansion-panel-content class="pt-3">
          <v-row>
            <v-col cols="12">
              <span style="font-size: 0.875rem; color: rgba(0, 0, 0, 0.6)">
                Add layers to plot
              </span>
            </v-col>
            <v-col v-show="layers.length > 0" cols="12">
              <Geometry
                v-for="(layer, i) in layers"
                :key="i"
                :name="layer.value"
                :index="i"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog v-model="dialogOpen" persistent scrollable>
      <v-card outlined>
        <v-card-title class="headline bg-grey py-4 px-5" primary-title>
          Select Geometry
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-item-group
            v-model="selectedGeometry"
            active-class="activeGeometry"
          >
            <v-row>
              <v-col
                v-for="geom in geometries"
                :key="geom.value"
                cols="12"
                sm="6"
                md="3"
              >
                <v-item v-slot="{ toggle }">
                  <v-card outlined style="height: 100%" @click="toggle">
                    <v-card-title>
                      {{ geom.text }}
                    </v-card-title>
                    <v-card-text style="display: flex; justify-content: center">
                      <v-icon x-large :color="primaryBlue" v-text="geom.icon" />
                    </v-card-text>
                    <v-card-subtitle>
                      {{ geom.description }}
                    </v-card-subtitle>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>
        </v-card-text>
        <v-card-actions>
          <d-btn secondary class="ma-0" @click="closeGeometriesDialog">
            Cancel
          </d-btn>
          <v-spacer />
          <d-btn primary class="ma-0" @click="selectGeometry">
            Add geometry
          </d-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import DBtn from '~/components/DBtn'
import { geometries } from '~/constants/geometries'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Geometries',
  components: {
    DBtn,
  },
  data() {
    return {
      primaryBlue,
      geometries,
      panelOpen: 0,
      dialogOpen: false,
      selectedGeometry: null,
    }
  },
  computed: {
    ...mapState({
      getLayers: state => state.vegaSpec.layer,
    }),
    supportedGeometriesNames() {
      return geometries.map(geo => {
        return geo.value
      })
    },
    layers() {
      return this.getLayers
    },
  },
  methods: {
    ...mapMutations({
      setLoading: 'setLoading',
    }),
    ...mapActions({
      addLayer: 'addLayer',
    }),
    async selectGeometry() {
      console.log(geometries[this.selectedGeometry])
      this.setLoading(true)
      const selectedGeom = geometries[this.selectedGeometry].value
      this.closeGeometriesDialog()
      await this.addLayer(selectedGeom)
      this.setLoading(false)
    },
    getComponentData() {
      return {
        attrs: {
          flat: true,
          hover: true,
        },
      }
    },
    openGeometriesDialog() {
      this.dialogOpen = true
    },
    closeGeometriesDialog() {
      this.dialogOpen = false
      this.selectedGeometry = null
    },
  },
}
</script>
<style lang="scss" scoped>
.activeGeometry {
  border-color: $color-primary-blue !important;
  background-color: $color-grey-light !important;
}
.v-card--link:focus:before {
  opacity: 0;
}
</style>
