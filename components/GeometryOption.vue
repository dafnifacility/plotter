<template>
  <v-col cols="6" class="py-0">
    <v-text-field
      v-if="option.type === 'textBox'"
      v-model="optionValue"
      :label="option.value"
      :clearable="option.optional"
      :hint="option.hint"
      dense
    />
    <v-checkbox
      v-if="option.type === 'checkBox'"
      v-model="optionValue"
      :label="option.value"
      :hint="option.hint"
      persistent-hint
      dense
    />
  </v-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'Column',
  props: {
    option: {
      type: Object,
      default: () => {
        return {}
      },
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      getGeometryOption: 'geometries/getGeometryOption',
    }),
    optionValue: {
      get() {
        return this.getGeometryOption({
          option: this.option.value,
          index: this.index,
        })
      },
      set(value) {
        this.debouncedSetOption({
          option: this.option.value,
          index: this.index,
          value,
        })
      },
    },
  },
  methods: {
    ...mapActions({
      updateGeometryOption: 'geometries/updateGeometryOption',
    }),
    debouncedSetOption: _.debounce(function (value) {
      this.updateGeometryOption(value)
    }, 500),
  },
}
</script>
