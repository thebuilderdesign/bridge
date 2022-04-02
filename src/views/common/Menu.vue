<template>
  <div class="menu">
    <CLink @click="goAudit" class="item" target="_self">
      {{ $t('common.menu.audit') }}
    </CLink>
    <CLink
      :to="{ name: 'home' }"
      :class="$route.name == 'home' ? 'active item' : 'item'"
      target="_self"
    >
      {{ $t('common.menu.token') }}
    </CLink>
    <CLink
      :to="{ name: 'nft' }"
      :class="$route.name == 'nft' ? 'active item' : 'item'"
      target="_self"
    >
      {{ $t('common.menu.nft') }}
    </CLink>
  </div>
</template>

<script>
import { TARGET_MAINNET } from '@/utils/env';

export default {
  name: 'Menu',
  data() {
    return {
      mainnet: TARGET_MAINNET,
    };
  },
  methods: {
    goAudit() {
      window.open('https://github.com/polynetwork/audit-report');
    },
  },
};
</script>
<style scoped lang="scss">
.menu {
  display: flex;
  .item {
    font-size: 14px;
    font-family: PingFangTC-Medium, PingFangTC;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    line-height: 20px;
    padding: 0 40px 0 0;
    transition: all ease 0.3s;
  }
  .item:hover {
    color: rgba(255, 255, 255, 1);
    transition: all ease 0.3s;
  }
  .active {
    color: rgba(255, 255, 255, 1) !important;
  }
}
</style>
