<template>
  <div ref="box">
    <div id="viz" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import embed from 'vega-embed'
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
    ...mapGetters({
      getVegaSpec: 'vegaSpec',
    }),
    vegaSpec() {
      // sync to backend everytime we need to regenerate the spec
      this.uploadState()
      return this.getVegaSpec
    },
  },
  watch: {
    vegaSpec(v) {
      if (v) this.draw()
    },
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
    ...mapActions({
      uploadState: 'uploadState',
    }),
    // whenever the document is resized, re-set the 'fullHeight' variable
    handleResize(event) {
      this.width = this.$refs.box.clientWidth
      this.draw()
    },
    async draw() {
      if (!this.vegaSpec) return

      this.vegaSpec.width = 0.7 * this.width
      this.vegaSpec.height = 0.55 * this.width

      const embedOptions = {
        actions: false,
      }
      try {
        const res = await embed('#viz', this.vegaSpec, embedOptions)
        return res.finalize()
      } catch (error) {
        console.error('ERROR in vega-embed: ', error)
      }
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
