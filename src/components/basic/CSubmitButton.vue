<template>
  <CButton v-bind="$attrs" :class="b()" :disabled="loading || $attrs.disabled" v-on="$listeners">
    <img v-if="loading" :class="b('loading-icon')" src="@/assets/svg/pending.svg" />
    <span> <slot /></span>
  </CButton>
</template>

<script>
import CButton from './CButton';

export default {
  name: 'CSubmitButton',
  inheritAttrs: false,
  components: {
    CButton,
  },
  props: {
    loading: Boolean,
  },
};
</script>

<style lang="scss">
@include block(c-submit-button) {
  width: stretch;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(225deg, #3ec7eb 0%, #50372e 100%);
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  @include child-margin-h(8px);

  @include element(loading-icon) {
    width: 16px;
    animation: rotation 2s infinite linear;
  }
}
</style>
