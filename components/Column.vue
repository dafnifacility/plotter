<template>
  <v-card outlined>
    <v-card-title style="font-size: 0.9375rem; font-weight: 400; display: flex">
      <span>
        {{ name }}
      </span>
      <v-spacer />
      <v-btn icon @click="deleteColumn">
        <v-icon :color="primaryBlue">mdi-delete</v-icon>
      </v-btn>
    </v-card-title>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Column',
  props: {
    type: {
      type: String,
      default: 'column',
    },
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
    }
  },
  methods: {
    ...mapActions({
      removeColumn: 'removeColumn',
    }),
    deleteColumn() {
      this.removeColumn([this.type, this.index, this.aesthetic])
    },
  },
}
</script>
