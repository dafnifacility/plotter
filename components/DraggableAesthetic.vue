<template>
  <v-expansion-panel style="border: 1px solid #e0e0e0">
    <v-expansion-panel-header disable-icon-rotate>
      {{ name }}
      <template #actions>
        <v-btn icon @click="deleteColumn">
          <v-icon :color="primaryBlue">mdi-delete</v-icon>
        </v-btn>
        <v-icon>$expand</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <Option
        v-for="option in columnProperties"
        :key="option.name"
        :option="option"
        :index="index"
        :aesthetic="aesthetic"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { columnProperties } from '~/constants/aesthetics'
import { mapActions } from 'vuex'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'DraggableAesthetic',
  props: {
    name: {
      type: String,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },
    aesthetic: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      primaryBlue,
      columnProperties,
    }
  },
  methods: {
    ...mapActions({
      removeAesthetic: 'geometries/removeAesthetic',
    }),
    deleteColumn() {
      this.removeAesthetic({
        index: this.index,
        aesthetic: this.aesthetic,
      })
    },
  },
}
</script>