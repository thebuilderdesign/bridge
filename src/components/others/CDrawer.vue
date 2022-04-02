<template>
  <CDialog
    v-bind="$attrs"
    :class="b('wrapper')"
    :customClass="`${$attrs.customClass || ''} ${b()}`"
    v-on="$listeners"
  >
    <CButton v-if="showClose" :class="b('close')" @click="$emit('update:visible', false)">
      <img :class="b('close-icon')" src="@/assets/svg/close.svg" />
    </CButton>
    <slot />
  </CDialog>
</template>

<script>
export default {
  name: 'CDrawer',
  inheritAttrs: false,
  props: {
    showClose: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss">
@include block(c-drawer) {
  margin: unset;

  @include element(wrapper) {
    justify-content: flex-end;

    &.dialog-fade-enter-active {
      animation: drawer-fade-in 0.3s;
    }

    &.dialog-fade-leave-active {
      animation: drawer-fade-out 0.3s;
    }
  }

  @include element(close) {
    position: absolute;
    transform: translateX(-100%);
    padding: 30px;
  }

  @include element(close-icon) {
    width: 20px;
  }
}

@keyframes drawer-fade-in {
  0% {
    transform: translate3d(20px, 0, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes drawer-fade-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(20px, 0, 0);
    opacity: 0;
  }
}
</style>

<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  @include block(c-drawer) {
    @include element(close) {
      position: absolute;
      transform: translate(0%, 0%);
      right: 0px;
      top: 50px;
    }
  }
}
</style>
