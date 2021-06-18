<template>
  <div>
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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { columnProperties } from '~/constants/aesthetics'

export default {
  name: 'Column',
  props: {
    option: {
      type: Object,
      default: () => {
        return columnProperties[0]
      },
    },
    type: {
      type: String,
      default: 'column',
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
    return {}
  },
  computed: {
    ...mapGetters({
      getOption: 'option',
    }),
    optionValue: {
      get() {
        const args = {
          index: this.index,
          aesthetic: this.aesthetic,
        }
        return this.getOption(this.type, this.option.name, args)
      },
      set(value) {
        const args = {
          index: this.index,
          aesthetic: this.aesthetic,
        }
        this.setOption([this.type, this.option.name, args, value])
      },
    },
  },
  methods: {
    ...mapActions({
      setOption: 'setOption',
    }),
  },
}
</script>
