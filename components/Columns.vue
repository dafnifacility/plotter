<template>
  <v-card outlined>
    <v-card-title class="py-3 text-h6 font-weight-bold bg-grey">
      <v-icon :color="primaryBlue" class="pr-1"> mdi-table </v-icon>
      Columns
    </v-card-title>
    <v-divider />
    <v-card-subtitle>Drag columns to an aesthetic</v-card-subtitle>
    <v-card-text>
      <v-expansion-panels class="pb-2" />
      <draggable
        v-model="columns"
        :group="{ name: 'aesthetics', pull: 'clone', put: false }"
        :sort="false"
        tag="v-card"
        :component-data="getComponentData()"
      >
        <Column
          v-for="(column, i) in columns"
          :key="column.field"
          :name="column.field"
          :index="i"
        />
      </draggable>

      <v-overflow-btn
        v-model="addColumnSelected"
        :items="columnsInDataFile"
        label="Add new field"
        flat
        filled
        hide-details
        class="py-2"
        @input="selectColumn"
      />
      <v-text-field
        v-model="calculateExpression"
        class="pt-2"
        label="Calculate new field"
        append-icon="mdi-plus"
        persistent-hint
        hint="e.g. '2*datum.fieldName'"
        filled
        @click:append="selectCalculateField"
      >
        <template #message="{ message }">
          <span>
            {{ message }}
            <a
              href="https://vega.github.io/vega/docs/expressions"
              target="_blank"
            >
              (syntax)
            </a>
          </span>
        </template>
      </v-text-field>
      <v-text-field
        v-model="filterExpression"
        label="Filter data"
        hint="e.g. 'datum.fieldName > 60'"
        filled
        persistent-hint
      >
        <template #message="{ message }">
          <span>
            {{ message }}
            <a
              href="https://vega.github.io/vega/docs/expressions"
              target="_blank"
            >
              (syntax)
            </a>
          </span>
        </template>
      </v-text-field>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import _ from 'lodash'
import Column from '~/components/Column'
import draggable from 'vuedraggable'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Columns',
  components: {
    draggable,
    Column,
  },
  data() {
    return { primaryBlue, calculateExpression: null, addColumnSelected: null }
  },
  computed: {
    ...mapState({
      getColumnsInDataFile: state => state.dataset.columnsInDataFile,
      columns: state => state.dataset.columns,
      filter: state => state.dataset.filter,
    }),
    columnsInDataFile() {
      const cols = this.getColumnsInDataFile.map(c => {
        return c.field
      })
      const unselectedCols = cols.filter(
        col => !this.columns.find(c => c.field === col)
      )
      return unselectedCols
    },
    filterExpression: {
      get() {
        return this.filter
      },
      set(value) {
        this.debouncedSetFilter(value)
      },
    },
  },
  methods: {
    ...mapMutations({
      addCalculateField: 'dataset/addCalculateField',
      addColumn: 'dataset/addColumn',
    }),
    ...mapActions({
      updateEncoding: 'updateEncoding',
      setFilter: 'dataset/setFilter',
    }),
    debouncedSetFilter: _.debounce(function (value) {
      this.setFilter(value)
    }, 500),
    getComponentData() {
      return {
        attrs: {
          flat: true,
          hover: true,
        },
      }
    },
    selectColumn(name) {
      this.addColumn(name)
      this.$nextTick(() => {
        this.addColumnSelected = null
      })
    },
    selectCalculateField(mouseEvent) {
      this.addCalculateField(this.calculateExpression)
      this.$nextTick(() => {
        this.calculateExpression = null
      })
    },
  },
}
</script>
