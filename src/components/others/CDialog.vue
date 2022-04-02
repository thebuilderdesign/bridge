<template>
  <ElDialog
    v-bind="$attrs"
    :class="b('wrapper')"
    :customClass="`${$attrs.customClass || ''} ${b()}`"
    :top="null"
    appendToBody
    v-on="$listeners"
  >
    <slot />
  </ElDialog>
</template>

<script>
export default {
  name: 'CDialog',
  inheritAttrs: false,
};
</script>

<style lang="scss">
@include block(c-dialog) {
  width: unset;
  margin: auto;
  background: unset;
  box-shadow: unset;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: unset;
    word-break: unset;
    color: unset;
    font-size: unset;
  }

  @include element(wrapper) {
    margin: 0 !important;
    display: flex;
  }
}
</style>
