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
            <v-btn @click="openGeometriesDialog"> Add geometry </v-btn>
            <v-icon :color="primaryBlue">$expand</v-icon>
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
            <v-col cols="12">
              <Geometry
                v-for="(geometry, i) in geometries"
                :key="i"
                :name="geometry.name"
                :index="i"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog v-model="dialogOpen" persistent>
      <v-card outlined>
        <v-card-title class="headline bg-grey py-4 px-5" primary-title>
          Select Geometry
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-item-group>
            <v-row>
              <v-col cols="3" v-for="geom in geometriesConst" :key="geom.name">
                <v-item v-slot="{active, toggle}">
                  <v-card outlined @click="toggle">
                    <v-card-title>
                      {{ geom.name }}
                    </v-card-title>
                    <v-card-text>
                      <v-icon :color="primaryBlue" v-text="geom.icon" />
                    </v-card-text>
                    <v-card-subtitle>
                      {{ geom.text }}
                    </v-card-subtitle>
                  </v-card>
                </v-item>
              </v-col>
          </v-item-group>
          
           </v-card-text>
        <v-card-actions>
          <d-btn secondary class="ma-0" @click="close()"> Cancel </d-btn>
          <v-spacer />
          <d-btn primary class="ma-0" @click="selectGeometry">
            Add geometry
          </d-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <!-- <v-card outlined>
    <v-card-title class="py-3 text-h6 font-weight-bold bg-grey">
      <v-icon :color="primaryBlue" class="pr-1"> mdi-shape-plus </v-icon>
      Geometries
    </v-card-title>
    <v-divider />
    <v-card-subtitle> Add layers to plot </v-card-subtitle>
    <v-card-text>
      <Geometry
        v-for="(geometry, i) in geometries"
        :key="i"
        :name="geometry.name"
        :index="i"
      />
      <v-overflow-btn
        v-model="addGeometrySelected"
        :items="geometriesConst"
        item-value="name"
        label="Add new geometry"
        flat
        filled
        hide-details
        class="pt-2"
        @input="selectGeometry"
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" style="max-width: 600px" v-on="on">
            <v-list-item-icon>
              <v-icon :color="primaryBlue" v-text="item.icon" />
            </v-list-item-icon>
            <v-list-item-content :id="attrs['aria-labelledby']">
              <span>
                <strong>{{ item.name }}</strong> - {{ item.text }}
              </span>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-overflow-btn>
    </v-card-text>
  </v-card> -->
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { geometries } from '~/constants/geometries'
import { primaryBlue } from '~/static/js/colours'
import DBtn from '~/components/DBtn'

export default {
  name: 'Geometries',
  components: {
    DBtn,
  },
  data() {
    return {
      primaryBlue,
      geometriesConst: geometries,
      addGeometrySelected: null,
      panelOpen: 0,
      dialogOpen: false,
    }
  },
  computed: {
    ...mapState({
      getGeometries: state => state.geometries.geometries,
    }),
    supportedGeometriesNames() {
      return this.geometriesConst.map(geo => {
        return geo.name
      })
    },
    data() {
      return this.geometries[this.index]
    },
    geometries: {
      get() {
        return this.getGeometries
      },
      set(value) {
        this.setGeometries(value)
      },
    },
  },
  methods: {
    ...mapActions({
      addGeometry: 'geometries/addGeometry',
    }),
    ...mapMutations({
      setGeometries: 'geometries/setGeometries',
    }),
    selectGeometry(name) {
      this.addGeometry(name)
      this.$nextTick(() => {
        this.addGeometrySelected = null
      })
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
      this.dialogOpen = !this.dialogOpen
    },
  },
}
</script>
