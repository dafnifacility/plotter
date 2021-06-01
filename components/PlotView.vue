<template>
  <v-card outlined>
    <v-card-title class="py-3 text-h6 font-weight-bold bg-grey">
      <v-icon :color="primaryBlue" class="pr-1"> mdi-chart-line </v-icon>
      Plot
      <!-- <v-col cols="3">
          <SavePlot :vega-embed-ref="vegaEmbedRef" />
        </v-col>
        <v-col cols="3">
          <SaveTemplate />
        </v-col> -->
    </v-card-title>
    <v-divider />
    <VegaEmbed ref="vegaEmbed" :spec="vegaSpec" />
  </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'PlotView',
  data() {
    return {
      primaryBlue,
      vegaEmbedRef: {},
    }
  },
  computed: {
    ...mapGetters({
      getVegaSpec: 'vegaSpec',
    }),
    vegaSpec() {
      // sync to backend everytime we need to regenerate the spec
      this.uploadState()
      return this.getVegaSpec
    },
  },
  mounted() {
    this.vegaEmbedRef = this.$refs.vegaEmbed
  },
  methods: {
    ...mapActions({
      uploadState: 'uploadState',
    }),
  },
}
</script>
