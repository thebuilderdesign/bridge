<template>
  <CPopover
    v-bind="$attrs"
    :popperClass="`${$attrs.popperClass || ''} ${b()}`"
    :visibleArrow="visibleArrow"
    :trigger="trigger"
    :placement="placement"
    v-on="$listeners"
  >
    <CButton>
      <slot />
    </CButton>
    <template slot="content">
      <CCard :class="b('content')">
        <slot name="content" />
      </CCard>
    </template>
  </CPopover>
</template>

<script>
export default {
  name: 'CTooltip',
  inheritAttrs: false,
  props: {
    visibleArrow: {
      type: Boolean,
      default: true,
    },
    trigger: {
      type: String,
      default: 'hover',
    },
    placement: {
      type: String,
      default: 'top',
    },
  },
};
</script>

<style lang="scss">
@include block(c-tooltip) {
  @include element(content) {
    width: 300px;
    border-radius: 7px;
    padding: 16px;
  }
}
</style>
