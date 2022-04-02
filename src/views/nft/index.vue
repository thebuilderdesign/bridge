<template>
  <Page class="nft">
    <img class="top-decoration"
         src="@/assets/svg/poly-bg.svg" />
    <div class="bottom-decoration-wrapper">
      <img class="bottom-decoration"
           src="@/assets/svg/poly-bg.svg" />
    </div>
    <div class="content">
      <Form />
    </div>
  </Page>
</template>

<script>
import Page from '@/views/common/Page';
import Form from './Form';

export default {
  name: 'Home',
  components: {
    Page,
    Form,
  },
};
</script>

<style lang="scss" scoped>
.nft {
  min-width: 1440px;
  background-image: var(--background-image);
}

.top-decoration {
  position: absolute;
  top: 0;
  z-index: -1;
}

.bottom-decoration-wrapper {
  position: absolute;
  right: 0px;
  bottom: 0px;
  overflow: hidden;
  z-index: -1;
}

.bottom-decoration {
  transform: translate3d(60px, 60px, 0) scale(1.2);
}

.decoration {
  position: absolute;
  top: 0;
  z-index: -1;
}

.content {
  position: relative;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  @include child-margin-h(128px);
}

.slogan {
  position: relative;
  top: -40px;
  white-space: pre-line;
  font-weight: 500;
  font-size: 50px;
  line-height: 68px;

  ::v-deep > em {
    font-style: normal;
    color: #3ec7eb;
  }
}
</style>
