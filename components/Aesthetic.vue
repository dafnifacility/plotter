<template>
  <div style="border: 1px solid #e0e0e0">
    <v-row align="center">
      <v-col cols="auto">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              <v-icon
                :color="primaryBlue"
                class="pl-2"
                v-text="aesthetic.icon"
              />
              {{ name }}
            </span>
          </template>
          <span>{{ aesthetic.text }}</span>
        </v-tooltip>
      </v-col>
      <v-col class="py-0">
        <draggable
          v-model="aesMap"
          :group="{ name: 'aesthetics', put: true }"
          :sort="true"
          tag="v-expansion-panels"
          :component-data="getComponentData()"
          @add="addEvent"
          @remove="removeEvent"
        >
          <DraggableAesthetic
            v-for="(aes, i) in aesMap"
            :key="aes.field"
            :name="aes.field"
            :index="i"
            :aesthetic="name"
            type="aesthetic"
          />
          <v-card-text
            v-if="aesMap.length == 0"
            slot="footer"
            class="c-grey"
            style="justify-content: flex-end; display: flex"
          >
            Add
          </v-card-text>
        </draggable>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { aesthetics } from '~/constants/aesthetics'
import draggable from 'vuedraggable'
import DraggableAesthetic from './DraggableAesthetic'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Aesthetic',
  components: {
    draggable,
    DraggableAesthetic,
  },
  props: {
    name: {
      type: String,
      default: 'x',
    },
  },
  data() {
    return { primaryBlue }
  },
  computed: {
    ...mapGetters({
      getActiveLayer: 'getActiveLayer',
      getActiveLayerEncodingOption: 'getActiveLayerEncodingOption',
    }),
    aesthetic() {
      return aesthetics.filter(x => {
        return x.name === this.name
      })[0]
    },
    encodingOptions() {
      console.log('encodingOptions', this.name)
      return this.getActiveLayerEncodingOption({
        aesthetic: this.name,
      })
    },
    aesMap: {
      get() {
        console.log('watch on encoding', this.encodingOptions)
        return this.encodingOptions ? [this.encodingOptions] : []
      },
      set(value) {
        if (value) this.addEncoding(value)
      },
    },
  },
  // watch: {
  //   encodingOptions: {
  //     deep: true,
  //     handler() {
  //       console.log('watch on encoding', this.encodingOptions)
  //       this.aesMap = this.encodingOptions ? [this.encodingOptions] : []
  //     },
  //   },
  // },
  methods: {
    ...mapActions({
      updateEncoding: 'updateEncoding',
    }),
    getComponentData() {
      return {
        attrs: {
          flat: true,
          hover: true,
        },
      }
    },
    addEncoding(newValue) {
      this.updateEncoding({ name: this.name, value: newValue[0] })
    },
    addEvent(event) {
      console.log('===========AddEvent===========')
      // let newIndex = event.newIndex
      // if (newIndex > 0 && newIndex === this.aesMap.length) {
      //   newIndex = newIndex - 1
      // }
      // const newValue = this.aesMap[newIndex]
      // console.log('newValue', newValue)
      // this.updateEncoding({ name: this.name, value: newValue })
    },
    removeEvent(event) {
      this.updateEncoding({ name: this.name, value: null })
    },
  },
}
</script>
