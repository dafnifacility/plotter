<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12">
        <Data />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <Geometries />
      </v-col>
      <v-col cols="3">
        <Aesthetics />
      </v-col>
      <v-col cols="2">
        <Columns />
      </v-col>
      <v-col cols="5">
        <PlotView />
        <!-- <v-col>
          <Spec />
        </v-col> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import Aesthetics from '~/components/Aesthetics'
import Columns from '~/components/Columns'
import Geometries from '~/components/Geometries'
import PlotView from '~/components/PlotView'
// import Spec from '~/components/Spec'

export default {
  name: 'Homepage',
  components: {
    Aesthetics,
    Columns,
    Geometries,
    PlotView,
    // Spec,
  },
  computed: {
    ...mapState({
      authenticated: state => state.auth.authenticated,
    }),
    url: {
      get() {
        return this.$store.state.dataset.url
      },
      set(value) {
        this.setUrl(value)
        this.loadData()
      },
    },
  },
  watch: {
    authenticated() {
      if (this.authenticated) {
        this.loadStore()
      }
    },
  },
  created() {
    if (this.authenticated) {
      this.loadStore()
    }
  },
  methods: {
    ...mapMutations({
      setUrl: 'dataset/setUrl',
    }),
    ...mapActions({
      loadStore: 'loadStore',
      loadData: 'dataset/loadData',
    }),
  },
}
</script>
