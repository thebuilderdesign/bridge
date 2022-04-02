<template>
  <div :class="b({ theme, direction })" />
</template>

<script>
export default {
  name: 'CDivider',
  props: {
    theme: {
      type: String,
      default: 'regular',
      validator(value) {
        return ['regular', 'light'].includes(value);
      },
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value);
      },
    },
  },
};
</script>

<style lang="scss">
@include block(c-divider) {
  @include modifier(theme-regular) {
    background: $--border-color-base;
  }

  @include modifier(theme-light) {
    background: $--border-color-light;
  }

  @include modifier(direction-horizontal) {
    display: block;
    align-self: stretch;
    height: 1px;
  }

  @include modifier(direction-vertical) {
    display: inline-block;
    align-self: stretch;
    width: 1px;
  }
}
</style>
