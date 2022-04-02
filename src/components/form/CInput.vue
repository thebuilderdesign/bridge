<template>
  <textarea
    v-if="$attrs.type === 'textarea'"
    v-bind="$attrs"
    :class="b({ type: $attrs.type })"
    v-on="listeners"
  />
  <input v-else v-bind="$attrs" :class="b({ type: $attrs.type })" v-on="listeners" />
</template>

<script>
export default {
  name: 'CInput',
  inheritAttrs: false,
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: event => this.$emit('input', event.target.value),
      };
    },
  },
};
</script>

<style lang="scss">
@include block(c-input) {
  width: stretch;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
}
</style>
