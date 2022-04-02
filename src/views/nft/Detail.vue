<template>
  <CDialog
    v-bind="$attrs"
    :closeOnClickModal="!confirming"
    :closeOnPressEscape="!confirming"
    v-on="$listeners"
  >
    <div class="card">
      <div class="title">{{ $t('home.form.title') }}</div>
      <div class="fields" style="margin-top:40px">
        <div class="field" v-if="nftData">
          <div class="select-nft-basic">
            <div class="image">
              <div v-if="nftData.nft.Image" class="img-wrapper">
                <img :src="nftData.nft.Image" />
              </div>
            </div>
            <div class="token-id"># {{ nftData.nft.TokenId }}</div>
          </div>
        </div>

        <div class="fields-row" style="margin-top:40px">
          <div class="field">
            <div class="label">{{ $t('home.form.from') }}</div>
            <CButton class="select-chain">
              <div class="select-chain-content">
                <template v-if="fromChain">
                  <img class="select-chain-icon" :src="fromChain.icon" />
                  <span class="select-chain-name">
                    {{
                      $t('home.form.chainName', {
                        chainName: $formatEnum(nftData.fromChainId, { type: 'chainName' }),
                      })
                    }}
                  </span>
                </template>
                <template v-else>
                  <img class="select-chain-icon" src="@/assets/svg/from.svg" />
                  <span class="select-chain-name">
                    {{ $t('home.form.chainName', { chainName: $t('home.form.from') }) }}
                  </span>
                </template>
                <img style="opacity:0" class="chevron-down" src="@/assets/svg/chevron-right.svg" />
              </div>
            </CButton>
            <div v-if="nftData" class="address">
              <span class="address-value">
                {{ $formatLongText(nftData.fromWallet.address, { headTailLength: 6 }) }}
              </span>
              <CButton @click="copy(nftData.fromWallet.address)">
                <img src="@/assets/svg/copy.svg" />
              </CButton>
            </div>
          </div>

          <CButton disabled>
            <img src="@/assets/svg/arrow-right.svg" />
          </CButton>

          <div class="field">
            <div class="label">{{ $t('home.form.to') }}</div>
            <CButton class="select-chain" @click="openSelectToChain()">
              <div class="select-chain-content">
                <template v-if="toChain">
                  <img class="select-chain-icon" :src="toChain.icon" />
                  <span class="select-chain-name">
                    {{
                      $t('home.form.chainName', {
                        chainName: $formatEnum(nftData.toChainId, { type: 'chainName' }),
                      })
                    }}
                  </span>
                </template>
                <template v-else>
                  <img class="select-chain-icon" src="@/assets/svg/to.svg" />
                  <span class="select-chain-name">
                    {{ $t('home.form.chainName', { chainName: $t('home.form.to') }) }}
                  </span>
                </template>
                <img class="chevron-down" src="@/assets/svg/chevron-right.svg" />
              </div>
            </CButton>
            <div v-if="nftData.toWallet" class="address">
              <span class="address-value">
                {{ $formatLongText(nftData.toWallet.address, { headTailLength: 6 }) }}
              </span>
              <CButton @click="copy(nftData.toWallet.address)">
                <img src="@/assets/svg/copy.svg" />
              </CButton>
            </div>
          </div>
        </div>
      </div>

      <CSubmitButton
        v-if="!nftData.toWallet"
        :disabled="!toChain"
        @click="openConnectWallet()"
        class="s-button"
      >
        {{ $t('home.form.connectWallet') }}
      </CSubmitButton>
      <CSubmitButton
        v-else-if="nftData.needApproval"
        :loading="approving"
        class="s-button"
        @click="approve"
      >
        {{ approving ? $t('buttons.approving') : $t('buttons.approve') }}
      </CSubmitButton>
      <CSubmitButton v-else class="s-button" @click="next">
        {{ $t('buttons.next') }}
      </CSubmitButton>
    </div>
  </CDialog>
</template>

<script>
import copy from 'clipboard-copy';
import BigNumber from 'bignumber.js';
import delay from 'delay';
import { SingleTransactionStatus } from '@/utils/enums';
import { getWalletApi } from '@/utils/walletApi';

export default {
  name: 'Confirm',
  inheritAttrs: false,
  props: {
    nftData: Object,
  },
  data() {
    return {
      confirming: false,
      packing: false,
      approving: false,
      selectFromChainVisible: false,
      selectToChainVisible: false,
      needApproval: true,
    };
  },
  computed: {
    fromChain() {
      return this.nftData && this.$store.getters.getChain(this.nftData.fromChainId);
    },
    toChain() {
      return this.nftData && this.$store.getters.getChain(this.nftData.toChainId);
    },
  },
  methods: {
    openSelectToChain() {
      this.$emit('openSelectToChain');
    },
    openConnectWallet() {
      this.$emit('openConnectWallet');
    },
    copy(text) {
      copy(text);
      this.$message.success(this.$t('messages.copied', { text }));
    },
    async approve() {
      try {
        this.approving = true;
        let nftspender = this.fromChain.nftLockContractHash;
        if (this.fromChain.id === 2 && this.toChain.id === 8) {
          nftspender = this.fromChain.pltNftLockContractHash;
        }
        const walletApi = await getWalletApi(this.nftData.fromWallet.name);
        await walletApi.nftApprove({
          address: this.nftData.fromWallet.address,
          tokenHash: this.nftData.assetHash,
          spender: nftspender,
          id: this.nftData.nft.TokenId,
        });
        this.nftData.needApproval = await walletApi.getNFTApproved({
          fromChainId: this.nftData.fromChainId,
          toChainId: this.nftData.toChainId,
          tokenHash: this.nftData.assetHash,
          id: this.nftData.nft.TokenId,
        });
        console.log(this.nftData);
      } finally {
        this.approving = false;
      }
    },
    async getApproved() {
      const walletApi = await getWalletApi(this.nftData.fromWallet.name);
      this.nftData.needApproval = await walletApi.getNFTApproved({
        fromChainId: this.nftData.fromChainId,
        tokenHash: this.nftData.assetHash,
        id: this.nftData.nft.TokenId,
      });
      console.log(this.needApproval);
    },
    next() {
      this.$emit('openConfirm');
    },
  },
};
</script>

<style lang="scss" scoped>
.s-button {
  background: linear-gradient(225deg, #3ec7eb 0%, #282bdb 100%);
}
.content {
  display: flex;
  flex-direction: column;
  width: 500px;
  height: 100vh;
  background: #171f31;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
}

.title {
  font-weight: 500px;
  font-size: 20px;
  text-align: left;
  @include next-margin-v(30px);
}

.scroll {
  flex: 1;
  padding: 40px 50px;
  overflow-y: auto;
  @include child-margin-v(40px);
  @include scroll-bar(rgba(#fff, 0.2), transparent);
}

.fields {
  @include child-margin-v(20px);
  @include next-margin-v(40px);
}

.fields-row {
  display: flex;
  @include child-margin-h(18px);
}

.field {
  flex: 1;
  @include child-margin-v(10px);
}
.label {
  opacity: 0.6;
  font-weight: 500;
  font-size: 14px;
}
.value {
  font-size: 10px;
}

.amount {
  display: flex;
  align-items: center;
  @include child-margin-h(10px);
}

.amount-value {
  font-weight: 500;
  font-size: 20px;
}

.token-basic-name {
  opacity: 0.6;
  font-size: 14px;
}

.chain {
  display: flex;
  align-items: center;
  @include child-margin-h(8px);
}

.chain-icon {
  width: 20px;
}

.chain-name {
  opacity: 0.6;
  font-size: 14px;
}

.address {
  opacity: 0.6;
  font-size: 14px;
}

.fee {
  display: flex;
  align-items: center;
  @include child-margin-h(8px);
}

.fee-value {
  font-weight: 500;
  font-size: 14px;
}

.packing {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 0;
  @include child-margin-v(20px);
}

.packing-icon {
  animation: rotation 2s infinite linear;
}

.packing-text {
  font-weight: 500;
  @include last-margin-v(60px);
}

.hash {
  display: inline-block;
  opacity: 0.6;
  color: #3ec7eb;
  font-size: 14px;
  text-decoration: underline;
}
.card {
  box-sizing: border-box;
  width: 452px;
  padding: 40px;
  background: #171f31;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
  border-radius: 10px;
}
.select-nft-basic-icon {
  width: 20px;
  border-radius: 10px;
}

.select-nft-basic-name {
  font-size: 14px;
}
.select-nft-basic {
  display: flex;
  align-items: center;
  > .token-id {
    margin-left: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    line-height: 20px;
  }
}
.select-chain {
  width: 100%;
}

.select-chain-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: stretch;
  padding: 15px;
  border: 1px solid rgba(#ffffff, 0.1);
  border-radius: 4px;
  background: rgba(#ffffff, 0.04);
}

.select-chain-icon {
  width: 40px;
  @include next-margin-v(8px);
}

.select-chain-name {
  font-size: 14px;
  white-space: pre-line;
  text-align: left;
}

.address {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-value {
  font-size: 12px;
}

.chevron-down {
  align-self: flex-end;
}

.image {
  width: 60px;
  height: 60px;
  background-image: url('../../assets/svg/back.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  .img-wrapper {
    background-color: #000;
    text-align: center;
    width: 100%;
    height: 100%;
    img {
      height: 100%;
    }
  }
}
</style>
