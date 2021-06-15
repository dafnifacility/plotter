<template>
  <v-btn
    dark
    depressed
    :ripple="false"
    :color="primaryBlue"
    @click="goToInstance"
  >
    Go to instance
  </v-btn>
</template>
<script>
import { backendsPromise, instanceID } from '~/api/backends/'
import { primaryBlue } from '~/static/js/colours'

export default {
  name: 'Home',
  data() {
    return {
      primaryBlue,
    }
  },
  methods: {
    async goToInstance() {
      await backendsPromise
      this.$router.push(`instance/${instanceID}`)
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
.theme--dark.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  color: $color-grey-faded-dark !important;
  background-color: $color-grey-faded-light !important;
}
.theme--dark.v-btn.v-btn--disabled {
  color: $color-grey-faded-dark !important;
}
</style>
