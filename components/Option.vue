<template>
  <v-col cols="6">
    <v-select
      v-if="option.type === 'select'"
      v-model="optionValue"
      :items="Object.keys(option.options)"
      :label="option.name"
      :clearable="option.optional"
      :hint="option.hint"
    >
      <template #item="{ item, attrs, on }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-content>
            <v-list-item-title :id="attrs['aria-labelledby']" v-text="item" />

            <v-list-item-subtitle v-text="option.options[item]" />
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-select>
    <v-text-field
      v-if="option.type === 'textBox'"
      v-model="optionValue"
      :label="option.name"
      :clearable="option.optional"
      :hint="option.hint"
    />
    <v-text-field
      v-if="option.type === 'textBoxNumber'"
      v-model="optionValue"
      :label="option.name"
      type="number"
      :clearable="option.optional"
      :hint="option.hint"
    />
    <v-checkbox
      v-if="option.type === 'checkBox'"
      v-model="optionValue"
      :label="option.name"
      :hint="option.hint"
      persistent-hint
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
      getOption: 'option',
    }),
    optionValue: {
      get() {
        return this.getOption(this.option.name, this.index)
      },
      set(value) {
        this.debouncedSetOption({
          name: this.option.name,
          index: this.index,
          value,
        })
      },
    },
  },
  methods: {
    ...mapActions({
      setOption: 'setOption',
    }),
    debouncedSetOption: _.debounce(function (value) {
      this.setOption(value)
    }, 500),
  },
}
</script>
