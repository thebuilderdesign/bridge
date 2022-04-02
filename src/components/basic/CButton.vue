<template>
  <button v-bind="$attrs" :class="b({ fade })" v-on="$listeners">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'CButton',
  inheritAttrs: false,
  props: {
    fade: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss">
@include block(c-button) {
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  transition: all 0.3s;
  cursor: pointer;

  > * {
    vertical-align: middle;
  }

  @include modifier(fade) {
    &:hover {
      filter: brightness(0.6);
    }
  }

  &:disabled {
    filter: brightness(0.3);
    cursor: not-allowed;
  }
}
</style>
