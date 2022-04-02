<template>
  <CCard class="wallet">
    <div class="top">
      <img class="wallet-icon" :src="wallet.icon" />
      <span class="wallet-name">
        {{ $formatEnum(wallet.name, { type: 'walletName' }) }}
      </span>
    </div>
    <div class="address">
      <span class="address-value">{{ $formatLongText(wallet.address) }}</span>
      <CButton @click="copy(wallet.address)">
        <img src="@/assets/svg/copy.svg" />
      </CButton>
    </div>
  </CCard>
</template>

<script>
import copy from 'clipboard-copy';

export default {
  name: 'Wallet',
  props: {
    wallet: Object,
  },
  methods: {
    copy(text) {
      copy(text);
      this.$message.success(this.$t('messages.copied', { text }));
    },
  },
};
</script>

<style lang="scss" scoped>
.wallet {
  padding: 20px;
  @include child-margin-v(12px);
}

.top {
  display: flex;
  align-items: center;
  @include child-margin-h(12px);
}

.wallet-icon {
  width: 24px;
}

.wallet-name {
  opacity: 0.6;
  font-weight: 400;
  font-size: 12px;
}

.address {
  display: flex;
  align-items: center;
  @include child-margin-h(12px);
}

.address-value {
  font-size: 12px;
}
</style>
