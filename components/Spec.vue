<template>
  <div />
</template>
<!--template>
  <v-card class="pa-1">
    <v-card-title>
      <v-row no-gutters>
        <v-col cols="10"> Vega-Lite Specification </v-col>
        <v-col cols="2">
          <v-icon :color="primaryBlue"> mdi-code-json </v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <pre>
      {{ vegaSpecString }}
    </pre>
  </v-card>
</template>
<script>
import { mapActions } from 'vuex'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Spec',
  data() {
    return { primaryBlue }
  },
  computed: {
    vegaSpecString() {
      return JSON.stringify(await this.vegaSpec, null, 2)
    },
  },
  methods: {
    ...mapActions({
      vegaSpec: 'vegaSpec',
    }),
  },
}
</script-->
