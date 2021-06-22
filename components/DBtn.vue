<template>
  <v-btn
    :absolute="absolute"
    :block="block"
    :color="color"
    dark
    depressed
    :disabled="disabled"
    :exact="exact"
    :height="height"
    :href="href"
    :icon="icon"
    :large="large"
    :left="left"
    :light="light"
    :link="link"
    :loading="loading"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :min-height="minHeight"
    :min-width="icon ? '' : '88px'"
    :nuxt="nuxt"
    :outlined="secondary"
    :right="right"
    :ripple="false"
    :rounded="rounded"
    :small="small"
    :target="target"
    :text="text"
    :to="to"
    :top="top"
    :type="type"
    :value="value"
    :width="width"
    :x-large="xLarge"
    :x-small="xSmall"
    :class="[
      primary ? 'btn-primary' : '',
      secondary ? 'btn-secondary' : '',
      tertiary ? 'btn-tertiary' : '',
      text ? 'btn-text-link' : '',
      warning ? 'btn-warning' : '',
    ]"
    @click="click"
  >
    <slot />
  </v-btn>
</template>
<script>
import { VBtn } from 'vuetify/lib'
export default {
  extends: VBtn,
  props: {
    primary: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
    tertiary: {
      type: Boolean,
      default: false,
    },
    warning: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>
<style lang="scss" scoped>
.v-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
  transition: background-color 0.25s ease-in-out;
}
.btn-primary {
  color: $color-white !important;
  background-color: $color-primary-blue !important;
  &:hover,
  &:focus {
    background-color: darken($color-primary-blue, 8%) !important;
  }
  &::before {
    opacity: 0 !important;
  }
}
.theme--dark.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  color: $color-grey-faded-dark !important;
  background-color: $color-grey-faded-light !important;
}
.theme--dark.v-btn.v-btn--disabled {
  color: $color-grey-faded-dark !important;
}
.btn-secondary {
  color: $color-primary-blue !important;
  &:hover,
  &:focus {
    color: darken($color-primary-blue, 8%) !important;
  }
  &::before {
    opacity: 0 !important;
  }
}
.btn-tertiary {
  color: $color-primary-blue !important;
}
.btn-warning {
  color: $color-red !important;
  background-color: $color-red-light !important;
  &:hover,
  &:focus {
    color: darken($color-red, 14%) !important;
    background-color: darken($color-red-light, 8%) !important;
  }
  &::before {
    opacity: 0 !important;
  }
}
.btn-text-link {
  padding: 0 4px !important;
  height: auto !important;
  min-width: auto !important;
}
.btn-text-link {
  color: $color-primary-blue !important;
  padding: 0 !important;
  height: auto !important;
  min-width: auto !important;
  &::before {
    background-color: transparent !important;
  }
}
</style>
