<template>
  <img
    :class="[loadingClass, position]"
    src="/ui/loading.svg"
    width="48"
    height="48"
    alt=""
  />
</template>

<script>
export default {
  name: 'Loading',
  props: {
    position: {
      type: String,
      default: 'centered',
    },
    loadingClass: {
      type: String,
      default: 'loading',
    },
  },
}
</script>
