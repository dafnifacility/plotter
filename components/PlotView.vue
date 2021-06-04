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
    <VegaEmbed ref="vegaEmbed" />
  </v-card>
</template>
<script>
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'PlotView',
  data() {
    return {
      primaryBlue,
      vegaEmbedRef: {},
    }
  },
  mounted() {
    this.vegaEmbedRef = this.$refs.vegaEmbed
  },
}
</script>
