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

export default {
  name: 'Homepage',
  components: {
    Aesthetics,
    Columns,
    Geometries,
    overlay,
    PlotView,
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
    }),
  },
  mounted() {
    this.initialiseApp()
  },
  methods: {
    ...mapMutations({
      setLoading: 'setLoading',
    }),
    ...mapActions({
      loadStore: 'loadStore',
    }),
    async initialiseApp() {
      this.setLoading(true)
      await this.loadStore()
      this.setLoading(false)
    },
  },
}
</script>
