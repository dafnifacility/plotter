<template>
  <v-expansion-panel style="border: 1px solid #e0e0e0">
    <v-expansion-panel-header disable-icon-rotate>
      {{ name }}
      <template #actions>
        <v-btn icon @click="deleteColumn">
          <v-icon :color="primaryBlue">mdi-delete</v-icon>
        </v-btn>
        <v-icon :color="primaryBlue">$expand</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-text-field
        v-model="title"
        label="Title"
        hint="Text used for the axis label, legend, etc."
      />

      <v-select
        v-model="type"
        :items="typeOptions"
        item-value="value"
        item-text="text"
        label="Field type"
      />

      <v-select
        v-show="type === 'quantitative'"
        v-model="scale"
        :items="scaleOptions"
        item-value="value"
        label="Data scale"
        hint="Used to set the type of the scale for the data"
        persistent-hint
        clearable
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" style="max-width: 600px" v-on="on">
            <v-list-item-content :id="attrs['aria-labelledby']">
              <span>
                <strong>{{ item.text }}</strong> - {{ item.description }}
              </span>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <v-select
        v-model="timeUnit"
        :items="timeOptions"
        item-value="value"
        label="Unit of time"
        hint="Used to discretize time data"
        persistent-hint
        clearable
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" style="max-width: 600px" v-on="on">
            <v-list-item-content :id="attrs['aria-labelledby']">
              <span>
                <strong>{{ item.text }}</strong> - {{ item.description }}
              </span>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <v-select
        v-model="aggregate"
        :items="aggregateOptions"
        item-value="value"
        label="Aggregate data"
        hint="Used to compute aggregate summary statistics (e.g., median, min, max) over groups of data"
        persistent-hint
        clearable
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" style="max-width: 600px" v-on="on">
            <v-list-item-content :id="attrs['aria-labelledby']">
              <span>
                <strong>{{ item.text }}</strong> - {{ item.description }}
              </span>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <v-checkbox
        v-model="bin"
        label="Bin"
        hint="Binning discretizes numeric values into a set of bins. A common use case is to create a histogram"
        persistent-hint
      />

      <v-text-field
        v-show="bin"
        v-model="maxBins"
        label="Max bins"
        hint="Maximum number of bins"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import {
  aggregateOptions,
  scaleOptions,
  timeOptions,
  typeOptions,
} from '~/constants/aesthetics'
import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'DraggableAesthetic',
  props: {
    name: {
      type: String,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },
    aesthetic: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      aggregateOptions,
      scaleOptions,
      typeOptions,
      timeOptions,
      primaryBlue,
    }
  },
  computed: {
    ...mapGetters({
      getSimpleAestheticOption: 'geometries/getSimpleAestheticOption',
      getMaxBins: 'geometries/getMaxBins',
      getScale: 'geometries/getScale',
    }),
    type: {
      get() {
        return this.getSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'type',
        })
      },
      set(value) {
        this.updateSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'type',
          value,
        })
      },
    },
    aggregate: {
      get() {
        return this.getSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'aggregate',
        })
      },
      set(value) {
        this.updateSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'aggregate',
          value,
        })
      },
    },
    bin: {
      get() {
        return this.getSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'bin',
        })
      },
      set(value) {
        this.updateSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'bin',
          value,
        })
      },
    },
    maxBins: {
      get() {
        return this.getMaxBins({ aesthetic: this.aesthetic })
      },
      set(value) {
        this.updateMaxBins({ aesthetic: this.aesthetic, value })
      },
    },
    title: {
      get() {
        return this.getSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'title',
        })
      },
      set(value) {
        this.debouncedSetSimple({
          aesthetic: this.aesthetic,
          option: 'title',
          value,
        })
      },
    },
    scale: {
      get() {
        return this.getScale({ aesthetic: this.aesthetic })
      },
      set(value) {
        this.updateScale({ aesthetic: this.aesthetic, value })
      },
    },
    timeUnit: {
      get() {
        return this.getSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'timeUnit',
        })
      },
      set(value) {
        this.updateSimpleAestheticOption({
          aesthetic: this.aesthetic,
          option: 'timeUnit',
          value,
        })
      },
    },
  },
  methods: {
    ...mapActions({
      updateSimpleAestheticOption: 'geometries/updateSimpleAestheticOption',
      updateMaxBins: 'geometries/updateMaxBins',
      updateScale: 'geometries/updateScale',
      removeAesthetic: 'geometries/removeAesthetic',
    }),
    deleteColumn() {
      this.removeAesthetic({
        index: this.index,
        aesthetic: this.aesthetic,
      })
    },
    debouncedSetSimple: _.debounce(function (value) {
      this.updateSimpleAestheticOption(value)
    }, 500),
  },
}
</script>
