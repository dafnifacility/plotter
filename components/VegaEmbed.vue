<template>
  <div ref="box">
    <div id="viz" />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import _ from 'lodash'
import axios from 'axios'
import { uploadPlot } from '~/api/nivs'

export default {
  props: {
    spec: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      width: 0,
    }
  },
  computed: {
    ...mapState({
      authenticated: state => state.auth.authenticated,
    }),
  },
  async mounted() {
    window.addEventListener('resize', this.handleResize)
    await this.handleResize()
  },
  // bind event handlers to the `handleResize` method (defined below)
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    ...mapMutations({
      setVegaSpecWidth: 'setVegaSpecWidth',
      setVegaSpecHeight: 'setVegaSpecHeight',
    }),
    ...mapActions({
      refreshVegaEmbed: 'refreshVegaEmbed',
    }),
    // whenever the document is resized, re-set the 'fullHeight' variable
    handleResize: _.debounce(function () {
      this.width = this.$refs.box.clientWidth
      this.draw()
    }, 1000),
    async draw() {
      this.setVegaSpecWidth(0.7 * this.width)
      this.setVegaSpecHeight(0.55 * this.width)
      await this.refreshVegaEmbed()
    },
    async uploadPlot(title, description, filename) {
      try {
        const pngUrl = await this.view.toImageURL('png')
        const response = await axios.get(pngUrl, { responseType: 'blob' })
        const id = await uploadPlot(title, description, filename, response.data)
        console.log('Successfully uploaded plot', id)
      } catch (error) {
        console.error('ERROR uploading image', error)
      }
    },
  },
}
</script>
