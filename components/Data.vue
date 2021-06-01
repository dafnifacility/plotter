<template>
  <div>
    <v-row dense>
      <v-col cols="2">
        <v-select
          v-model="mode"
          :items="availableModes"
          label="what is your input data?"
          hint="selection will reset geometry data"
        />
      </v-col>
      <v-col cols="3">
        <v-select
          v-if="
            mode == 'csv' || mode == 'csv + topojson' || mode == 'csv + geojson'
          "
          v-model="csvIndex"
          :items="csvFiles"
          item-text="filename"
          item-value="index"
          label="csv file"
        >
          <template #append-outer>
            <v-btn icon :color="primaryBlue" @click="downloadFile('csv')">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-select>
        <v-select
          v-if="mode == 'topojson'"
          v-model="topojsonIndex"
          :items="topojsonFiles"
          item-text="filename"
          item-value="index"
          label="topojson file"
        >
          <template #append-outer>
            <v-btn icon :color="primaryBlue" @click="downloadFile('topojson')">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-select>
        <v-select
          v-if="mode == 'geojson'"
          v-model="geojsonIndex"
          :items="geojsonFiles"
          item-text="filename"
          item-value="index"
          label="geojson file"
        >
          <template #append-outer>
            <v-btn icon :color="primaryBlue" @click="downloadFile('geojson')">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-select>
      </v-col>
      <v-col cols="2">
        <v-select
          v-if="mode == 'csv + topojson' || mode == 'csv + geojson'"
          v-model="csvId"
          :items="csvProperties"
          label="csv id field"
        />
      </v-col>
      <v-col cols="3">
        <v-select
          v-if="mode == 'csv + topojson'"
          v-model="topojsonIndex"
          :items="topojsonFiles"
          item-text="filename"
          item-value="index"
          label="topojson file"
        >
          <template #append-outer>
            <v-btn icon :color="primaryBlue" @click="downloadFile('topojson')">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-select>
        <v-select
          v-if="mode == 'csv + geojson'"
          v-model="geojsonIndex"
          :items="geojsonFiles"
          item-text="filename"
          item-value="index"
          label="geojson file"
        >
          <template #append-outer>
            <v-btn icon :color="primaryBlue" @click="downloadFile('geojson')">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-select>
      </v-col>
      <v-col cols="2">
        <v-select
          v-if="mode == 'csv + topojson' || mode == 'csv + geojson'"
          v-model="geoId"
          :items="geoProperties"
          label="geometry id field"
        />
      </v-col>
      <v-col v-if="csvError" cols="12">
        <v-alert type="error" dense dismissible>
          {{ csvError }}
        </v-alert>
      </v-col>
      <v-col v-if="topojsonError" cols="12">
        <v-alert type="error" dense dismissible>
          {{ topojsonError }}
        </v-alert>
      </v-col>
      <v-col v-if="geojsonError" cols="12">
        <v-alert type="error" dense dismissible>
          {{ geojsonError }}
        </v-alert>
      </v-col>
      <v-col v-if="syncError" cols="12">
        <v-alert type="error" dense dismissible>
          {{ syncError }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { aggregateOps } from '~/constants/aggregate'
import axios from 'axios'
import fileDownload from 'js-file-download'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Data',
  components: {},
  data() {
    return { primaryBlue }
  },
  computed: {
    ...mapState({
      columnsInDataFile: state => state.dataset.columnsInDataFile,
      csvError: state => state.dataset.csvError,
      getCsvFiles: state => state.dataset.csvFiles,
      getCsvId: state => state.dataset.csvId,
      getCsvIndex: state => state.dataset.csvIndex,
      loadCsvProgress: state => state.dataset.loadCsvProgress,
      geojsonError: state => state.dataset.geojsonError,
      getGeoId: state => state.dataset.geoId,
      getGeoIndex: state => state.dataset.geoIndex,
      getGeojsonFiles: state => state.dataset.geojsonFiles,
      geoProperties: state => state.dataset.geoProperties,
      loadGeoProgress: state => state.dataset.loadGeoProgress,
      topojsonError: state => state.dataset.topojsonError,
      getTopojsonFiles: state => state.dataset.topojsonFiles,
      getPreLookupAggregate: state => state.dataset.preLookupAggregate,
      getMode: state => state.dataset.mode,
      syncError: state => state.syncError,
    }),
    csvFiles() {
      return this.getCsvFiles.map((x, i) => {
        return { ...x, index: i }
      })
    },
    topojsonFiles() {
      return this.getTopojsonFiles.map((x, i) => {
        return { ...x, index: i }
      })
    },
    geojsonFiles() {
      return this.getGeojsonFiles.map((x, i) => {
        return { ...x, index: i }
      })
    },
    availableAggregates() {
      return Object.keys(aggregateOps)
    },
    preLookupAggregate: {
      get() {
        return this.getPreLookupAggregate
      },
      set(value) {
        this.setPreLookupAggregate(value)
      },
    },
    availableModes() {
      const modes = []
      if (this.csvFiles.length > 0) {
        modes.push('csv')
      }
      if (this.topojsonFiles.length > 0) {
        modes.push('topojson')
      }
      if (this.geojsonFiles.length > 0) {
        modes.push('geojson')
      }
      if (this.csvFiles.length > 0 && this.topojsonFiles.length > 0) {
        modes.push('csv + topojson')
      }
      if (this.csvFiles.length > 0 && this.geojsonFiles.length > 0) {
        modes.push('csv + geojson')
      }
      return modes
    },
    mode: {
      get() {
        return this.getMode
      },
      async set(value) {
        this.setMode(value)
        this.setCsvIndex(0)
        this.setGeoIndex(0)
        if (value === 'csv + topojson') {
          await this.loadCsvData()
          this.addGeoField()
          this.loadTopojsonData()
        } else if (value === 'csv + geojson') {
          await this.loadCsvData()
          this.addGeoField()
          this.loadGeojsonData()
        } else if (value === 'topojson') {
          this.loadTopojsonData()
        } else if (value === 'geojson') {
          this.loadGeojsonData()
        } else {
          this.loadCsvData()
        }
        this.setDefaultGeometries(value)
      },
    },
    csvIndex: {
      get() {
        return this.getCsvIndex
      },
      async set(value) {
        console.log('id', this.csvId)
        console.log('value', value)
        this.setCsvIndex(value)
        this.setCsvId('')
        await this.loadCsvData()
        if (this.mode === 'csv + topojson') {
          this.addGeoField()
        }
      },
    },
    topojsonIndex: {
      get() {
        return this.getGeoIndex
      },
      set(value) {
        this.setGeoIndex(value)
        this.setGeoId('')
        this.loadTopojsonData()
      },
    },
    geojsonIndex: {
      get() {
        return this.getGeoIndex
      },
      set(value) {
        this.setGeoIndex(value)
        this.setGeoId('')
        this.loadGeojsonData()
      },
    },
    csvProperties() {
      return this.columnsInDataFile.map(c => {
        return c.name
      })
    },
    csvId: {
      get() {
        console.log('getCsvId', this.getCsvId)
        return this.getCsvId
      },
      set(value) {
        console.log('valuecsvid', value)
        this.setCsvId(value)
        const idColumn = this.columnsInDataFile.filter(c => {
          return c.name === value
        })[0]
        this.addAesthetic('detail')
        this.updateAesthetics(['detail', [idColumn]])
      },
    },
    geoId: {
      get() {
        return this.getGeoId
      },
      set(value) {
        this.setGeoId(value)
      },
    },
  },
  methods: {
    ...mapMutations({
      addAesthetic: 'geometries/addAesthetic',
      updateAesthetics: 'geometries/updateAesthetics',
      addGeoField: 'dataset/addGeoField',
      setCsvId: 'dataset/setCsvId',
      setCsvIndex: 'dataset/setCsvIndex',
      setGeoId: 'dataset/setGeoId',
      setGeoIndex: 'dataset/setGeoIndex',
      loadGeojsonData: 'dataset/loadGeojsonData',
      setMode: 'dataset/setMode',
      setPreLookupAggregate: 'dataset/setPreLookupAggregate',
      setDefaultGeometries: 'geometries/setDefaultGeometries',
    }),
    ...mapActions({
      loadCsvData: 'dataset/loadCsvData',
      loadGeojsonData: 'dataset/loadGeojsonData',
      loadTopojsonData: 'dataset/loadTopojsonData',
    }),
    async downloadFile(type) {
      let urlString = ''
      let filename = ''
      if (type === 'csv') {
        urlString = this.csvFiles[this.csvIndex].url
        filename = this.csvFiles[this.csvIndex].filename
      } else if (type === 'topojson') {
        urlString = this.topojsonFiles[this.topojsonIndex].url
        filename = this.topojsonFiles[this.topojsonIndex].filename
      } else if (type === 'geojson') {
        urlString = this.geojsonFiles[this.geojsonIndex].url
        filename = this.geojsonFiles[this.geojsonIndex].filename
      }

      const res = await axios.get(urlString, {})
      // topojson or geojson files will be objects
      if (typeof res.data === 'object' && res.data !== null) {
        fileDownload(JSON.stringify(res.data, null, 2), filename)
      } else {
        fileDownload(res.data, filename)
      }
    },
  },
}
</script>
