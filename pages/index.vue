<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12">
        <Data />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" lg="2">
        <Geometries />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <Aesthetics />
      </v-col>
      <v-col cols="12" md="6" lg="2">
        <Columns />
      </v-col>
      <v-col cols="12" md="6" lg="5">
        <PlotView />
        <!-- <v-col>
          <Spec />
        </v-col> -->
      </v-col>
    </v-row>
    <transition name="fade">
      <overlay v-if="loading" loading />
    </transition>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import Aesthetics from '~/components/Aesthetics'
import Columns from '~/components/Columns'
import Geometries from '~/components/Geometries'
import overlay from '~/components/overlay/Overlay'
import PlotView from '~/components/PlotView'
// import Spec from '~/components/Spec'

export default {
  name: 'Homepage',
  components: {
    Aesthetics,
    Columns,
    Geometries,
    overlay,
    PlotView,
    // Spec,
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapState({
      authenticated: state => state.auth.authenticated,
      getUrl: state => state.dataset.url,
    }),
    url: {
      get() {
        return this.getUrl
      },
      set(value) {
        this.setUrl(value)
        this.loadData()
      },
    },
  },
  watch: {
    authenticated() {
      this.initialiseApp()
    },
  },
  created() {
    this.initialiseApp()
  },
  methods: {
    ...mapMutations({
      setUrl: 'dataset/setUrl',
    }),
    ...mapActions({
      loadStore: 'loadStore',
      loadData: 'dataset/loadData',
    }),
    async initialiseApp() {
      if (this.authenticated) {
        this.loading = true
        await this.loadStore()
        this.loading = false
      }
    },
  },
}
</script>
