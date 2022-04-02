<template>
  <ElPopover
    v-bind="$attrs"
    :popperClass="`${$attrs.popperClass || ''} ${b()}`"
    :popperOptions="popperOptions"
    :visibleArrow="visibleArrow"
    v-on="$listeners"
  >
    <template slot="reference">
      <slot />
    </template>
    <slot name="content" />
  </ElPopover>
</template>

<script>
export default {
  name: 'CPopover',
  inheritAttrs: false,
  props: {
    visibleArrow: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    popperOptions() {
      return {
        boundariesPadding: 16,
        ...this.$attrs.popperOptions,
      };
    },
  },
};
</script>

<style lang="scss">
@include block(c-popover) {
  min-width: unset;
  padding: unset;
  border: unset;
  background: unset;
  color: unset;
  word-break: unset;
  text-align: unset;
  @media screen and (max-width: 900px) {
    transform: translate3d(0px, -12px, 0px) !important;
  }
}
</style>
