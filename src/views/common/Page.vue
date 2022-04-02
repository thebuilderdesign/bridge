<template>
  <div class="page">
    <Header />
    <slot />
    <Footer />
  </div>
</template>

<script>
import Header from './Header';
import Footer from './Footer';

export default {
  name: 'Page',
  components: {
    Header,
    Footer,
  },
};
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
