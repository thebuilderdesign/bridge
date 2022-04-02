<template>
  <div :class="b()">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CCard',
};
</script>

<style lang="scss">
@include block(c-card) {
  background: #182233;
  box-shadow: 0px 2px 10px 7px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  overflow: hidden;
}
</style>
