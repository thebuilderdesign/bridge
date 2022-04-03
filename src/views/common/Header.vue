<template>
  <div class="header">
    <CLink class="brand" :to="{ name: 'home' }">
      <img class="brand-logo" src="@/assets/png/logo_white.png" />
      <span class="brand-name">{{ $t('common.header.brandName') }}</span>
    </CLink>
    <CFlexSpan />
    <Menu class="menu" />
    <Wallets class="wallet" />
    <Networks class="network" />

    <div class="header-mobile" style="display: none">
      <Wallets />
      <!-- <el-dropdown>
        <i class="el-icon-setting" style="font-size:30px"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <CLink :to="{ name: 'home' }" target="_self">
              {{ $t('common.menu.token') }}
            </CLink></el-dropdown-item
          >
          <el-dropdown-item>
            <CLink :to="{ name: 'nft' }" target="_self">
              {{ $t('common.menu.nft') }}
            </CLink></el-dropdown-item
          >
          <el-dropdown-item>
            <CLink
              :href="
                mainnet ? 'https://bridge.poly.network/testnet' : 'https://bridge.poly.network'
              "
              target="_self"
            >
              {{ mainnet ? $t('common.networks.mainnet') : $t('common.networks.testnet') }}
            </CLink></el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown> -->
    </div>
  </div>
</template>

<script>
import { TARGET_MAINNET } from '@/utils/env';
import Wallets from './Wallets';
import Networks from './Networks';
import Menu from './Menu';

export default {
  name: 'Header',
  components: {
    Wallets,
    Networks,
    Menu,
  },
  data() {
    return {
      mainnet: TARGET_MAINNET,
    };
  },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  height: 80px;
  padding: 0 50px;
  @include child-margin-h(20px);
}

.brand {
  display: flex;
  align-items: center;
  @include child-margin-h(12px);
}

.brand-name {
  font-size: 20px;
}
</style>
<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .brand-logo {
    margin-top: 110px;
    width: 40px;
    height: 48px;
  }
  .brand-name {
    margin-top: 110px;
    font-size: 2em;
  }
  .menu,
  .wallet,
  .network {
    display: none;
  }
  .header-mobile {
    display: flex !important;
    margin-top: 110px;
    // align-items: center;
    // @include child-margin-h(20px);
  }
}
</style>
