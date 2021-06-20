<template>
  <v-container fluid>
    <v-row>
      <v-col class="py-0" cols="12">
        <Data />
      </v-col>
      <v-col cols="12" lg="5">
        <Geometries />
        <v-row class="pt-3">
          <v-col cols="12" md="6">
            <Columns />
          </v-col>
          <v-col cols="12" md="6">
            <Aesthetics />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="7">
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
  computed: {
    ...mapState({
      loading: state => state.loading,
      authenticated: state => state.auth.authenticated,
      getUrl: state => state.dataset.url,
    }),
    url: {
      get() {
        return this.getUrl
      },
      async set(value) {
        this.setLoading(true)
        this.setUrl(value)
        await this.loadData()
        this.setLoading(false)
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
      setLoading: 'setLoading',
      setUrl: 'dataset/setUrl',
    }),
    ...mapActions({
      loadStore: 'loadStore',
      loadData: 'dataset/loadData',
    }),
    async initialiseApp() {
      if (this.authenticated) {
        this.setLoading(true)
        await this.loadStore()
        this.setLoading(false)
      }
    },
  },
}
</script>
