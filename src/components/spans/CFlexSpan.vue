<template>
  <span :class="b()" />
</template>

<script>
export default {
  name: 'CFlexSpan',
};
</script>

<style lang="scss">
@include block(c-flex-span) {
  flex: 1;
  margin: 0 !important;
}
</style>
