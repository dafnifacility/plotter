<template>
  <v-row>
    <v-col class="py-0" cols="2">
      <v-select
        v-model="mode"
        :items="availableModes"
        label="what is your input data?"
        hint="selection will reset geometry data"
      />
    </v-col>
    <v-col class="py-0" cols="3">
      <v-select
        v-if="
          mode == modes.csv ||
          mode == modes.csvTopojson ||
          mode == modes.csvGeojson
        "
        v-model="csvIndex"
        :items="csvFiles"
        item-text="file"
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
        v-if="mode == modes.topojson"
        v-model="topojsonIndex"
        :items="topojsonFiles"
        item-text="file"
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
        v-if="mode == modes.geojson"
        v-model="geojsonIndex"
        :items="geojsonFiles"
        item-text="file"
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
    <v-col class="py-0" cols="2">
      <v-select
        v-if="mode == modes.csvTopojson || mode == modes.csvGeojson"
        v-model="csvId"
        :items="csvProperties"
        label="csv id field"
      />
    </v-col>
    <v-col class="py-0" cols="3">
      <v-select
        v-if="mode == modes.csvTopojson"
        v-model="topojsonIndex"
        :items="topojsonFiles"
        item-text="file"
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
        v-if="mode == modes.csvGeojson"
        v-model="geojsonIndex"
        :items="geojsonFiles"
        item-text="file"
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
    <v-col class="py-0" cols="2">
      <v-select
        v-if="mode == modes.csvTopojson || mode == modes.csvGeojson"
        v-model="geoId"
        :items="geoProperties"
        label="geometry id field"
      />
    </v-col>
    <v-col v-if="csvError" class="py-0" cols="12">
      <v-alert type="error" dense dismissible>
        {{ csvError }}
      </v-alert>
    </v-col>
    <v-col v-if="topojsonError" class="py-0" cols="12">
      <v-alert type="error" dense dismissible>
        {{ topojsonError }}
      </v-alert>
    </v-col>
    <v-col v-if="geojsonError" class="py-0" cols="12">
      <v-alert type="error" dense dismissible>
        {{ geojsonError }}
      </v-alert>
    </v-col>
    <v-col v-if="syncError" class="py-0" cols="12">
      <v-alert type="error" dense dismissible>
        {{ syncError }}
      </v-alert>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { aggregateOps } from '~/constants/aggregate'
import { downloadFileFromMinio } from '~/api/minio'
import fileDownload from 'js-file-download'
import modes from '~/constants/modes'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Data',
  components: {},
  data() {
    return { modes, primaryBlue }
  },
  computed: {
    ...mapState({
      columnsInDataFile: state => state.dataset.columnsInDataFile,
      csvError: state => state.dataset.csvError,
      getCsvFiles: state => state.dataset.csvFiles,
      getCsvId: state => state.dataset.csvId,
      getCsvIndex: state => state.dataset.csvIndex,
      geojsonError: state => state.dataset.geojsonError,
      getGeoId: state => state.dataset.geoId,
      getGeoIndex: state => state.dataset.geoIndex,
      getGeojsonFiles: state => state.dataset.geojsonFiles,
      geoProperties: state => state.dataset.geoProperties,
      topojsonError: state => state.dataset.topojsonError,
      getTopojsonFiles: state => state.dataset.topojsonFiles,
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
    availableModes() {
      const aModes = []
      if (this.csvFiles.length > 0) {
        aModes.push(modes.csv)
      }
      if (this.topojsonFiles.length > 0) {
        aModes.push(modes.topojson)
      }
      if (this.geojsonFiles.length > 0) {
        aModes.push(modes.geojson)
      }
      // if (this.csvFiles.length > 0 && this.topojsonFiles.length > 0) {
      //   aModes.push(modes.csvTopojson)
      // }
      // if (this.csvFiles.length > 0 && this.geojsonFiles.length > 0) {
      //   aModes.push(modes.csvGeojson)
      // }
      return aModes
    },
    mode: {
      get() {
        return this.getMode
      },
      set(value) {
        this.setMode(value)
        this.setCsvIndex(null)
        this.setGeoIndex({ index: null, type: 'none' })
      },
    },
    csvIndex: {
      get() {
        return this.getCsvIndex
      },
      async set(value) {
        this.setLoading(true)
        await this.setCsvIndex(value)
        this.setLoading(false)
      },
    },
    topojsonIndex: {
      get() {
        return this.getGeoIndex
      },
      async set(value) {
        this.setLoading(true)
        await this.setGeoIndex({ index: value, type: 'topojson' })
        this.setLoading(false)
      },
    },
    geojsonIndex: {
      get() {
        return this.getGeoIndex
      },
      async set(value) {
        this.setLoading(true)
        await this.setGeoIndex({ index: value, type: 'geojson' })
        this.setLoading(false)
      },
    },
    csvProperties() {
      return this.columnsInDataFile.map(c => {
        return c.name
      })
    },
    csvId: {
      get() {
        return this.getCsvId
      },
      set(value) {
        this.setCsvId(value)
        const idColumn = this.columnsInDataFile.filter(c => {
          return c.name === value
        })[0]
        this.addAesthetic('detail')
        this.updateAesthetic({ name: 'detail', value: [idColumn] })
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
      setLoading: 'setLoading',
      addAesthetic: 'geometries/addAesthetic',
      setCsvId: 'dataset/setCsvId',
      setGeoId: 'dataset/setGeoId',
      setDefaultGeometries: 'geometries/setDefaultGeometries',
    }),
    ...mapActions({
      setMode: 'dataset/setMode',
      updateAesthetic: 'geometries/updateAesthetic',
      setCsvIndex: 'dataset/setCsvIndex',
      setGeoIndex: 'dataset/setGeoIndex',
    }),
    async downloadFile(type) {
      let urlString = ''
      let filename = ''
      if (type === modes.csv) {
        urlString = this.csvFiles[this.csvIndex].url
        filename = this.csvFiles[this.csvIndex].file
      } else if (type === modes.topojson) {
        urlString = this.topojsonFiles[this.topojsonIndex].url
        filename = this.topojsonFiles[this.topojsonIndex].file
      } else if (type === modes.geojson) {
        urlString = this.geojsonFiles[this.geojsonIndex].url
        filename = this.geojsonFiles[this.geojsonIndex].file
      }

      const res = await downloadFileFromMinio(urlString)
      // topojson or geojson files will be objects
      if (typeof res === 'object' && res !== null) {
        fileDownload(JSON.stringify(res, null, 2), filename)
      } else {
        fileDownload(res, filename)
      }
    },
  },
}
</script>
