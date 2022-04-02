<template>
  <div class="networks">
    <CLink :href="mainnet ? 'https://bridge.poly.network/testnet' : 'https://bridge.poly.network'"
           target="_self">
      {{ mainnet ? $t('common.networks.mainnet') : $t('common.networks.testnet') }}
    </CLink>
  </div>
</template>

<script>
import { TARGET_MAINNET } from '@/utils/env';

export default {
  name: 'Networks',
  data () {
    return {
      mainnet: TARGET_MAINNET,
    };
  },
};
</script>
