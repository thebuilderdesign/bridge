<template>
  <CDrawer
    v-bind="$attrs"
    :closeOnClickModal="!confirming"
    :closeOnPressEscape="!confirming"
    v-on="$listeners"
  >
    <transition v-if="confirmingData" name="fade" mode="out-in">
      <div class="content">
        <div class="title">{{ $t('home.confirm.title') }}</div>
        <CDivider />
        <div v-if="!packing" class="scroll">
          <div class="fields">
            <div class="field">
              <div class="select-nft-basic">
                <div class="image">
                  <div v-if="confirmingData.nft.Image" class="img-wrapper">
                    <img :src="confirmingData.nft.Image" />
                  </div>
                </div>
                <div class="token-id"># {{ confirmingData.nft.TokenId }}</div>
              </div>
            </div>

            <div class="field">
              <div class="label">{{ $t('home.confirm.from') }}</div>
              <div class="chain">
                <img class="chain-icon" :src="fromChain.icon" />
                <span class="chain-name">
                  {{
                    $t('home.confirm.chainName', {
                      chainName: $formatEnum(confirmingData.fromChainId, { type: 'chainName' }),
                    })
                  }}
                </span>
              </div>
              <div class="address">
                {{ confirmingData.fromAddress }}
              </div>
            </div>

            <div class="field">
              <div class="label">{{ $t('home.confirm.to') }}</div>
              <div class="chain">
                <img class="chain-icon" :src="toChain.icon" />
                <span class="chain-name">
                  {{
                    $t('home.confirm.chainName', {
                      chainName: $formatEnum(confirmingData.toChainId, { type: 'chainName' }),
                    })
                  }}
                </span>
              </div>
              <div class="address">
                {{ confirmingData.toAddress }}
              </div>
            </div>

            <div class="field">
              <div class="label">{{ $t('home.confirm.fee') }}</div>
              <div class="fee">
                <span class="fee-value">{{ $formatNumber(confirmingData.fee.TokenAmount) }}</span>
                <span class="token-basic-name">{{ fromChain.nftFeeName }}</span>
              </div>
            </div>
          </div>

          <CSubmitButton :loading="confirming" @click="confirm">
            {{ confirming ? $t('buttons.confirming') : $t('buttons.confirm') }}
          </CSubmitButton>
        </div>

        <div v-else class="packing">
          <img class="packing-icon" src="@/assets/svg/pending-large.svg" />
          <span class="packing-text">
            {{
              $t('home.confirm.packing', {
                chainName: $formatEnum(confirmingData.fromChainId, { type: 'chainName' }),
              })
            }}
          </span>
          <CLink
            class="hash"
            target="_blank"
            :href="$format(fromChain.explorerUrl, { txHash: confirmingData.transactionHash })"
            :disabled="!confirmingData.transactionHash"
          >
            {{
              $t('home.confirm.hash', {
                hash: $formatLongText(confirmingData.transactionHash || 'N/A', {
                  headTailLength: 10,
                }),
              })
            }}
          </CLink>
        </div>
      </div>
    </transition>
  </CDrawer>
</template>

<script>
import BigNumber from 'bignumber.js';
import delay from 'delay';
import { SingleTransactionStatus } from '@/utils/enums';
import { getWalletApi } from '@/utils/walletApi';

export default {
  name: 'Confirm',
  inheritAttrs: false,
  props: {
    confirmingData: Object,
  },
  data() {
    return {
      confirming: false,
      packing: false,
    };
  },
  computed: {
    tokenBasic() {
      return (
        this.confirmingData &&
        this.$store.getters.getTokenBasicByChainIdAndTokenHash({
          chainId: this.confirmingData.fromChainId,
          tokenHash: this.confirmingData.fromTokenHash,
        })
      );
    },
    fromChain() {
      return this.confirmingData && this.$store.getters.getChain(this.confirmingData.fromChainId);
    },
    fromToken() {
      return (
        this.tokenBasic &&
        this.$store.getters.getTokenByTokenBasicNameAndChainId({
          tokenBasicName: this.tokenBasic.name,
          chainId: this.confirmingData.fromChainId,
        })
      );
    },
    toChain() {
      return this.confirmingData && this.$store.getters.getChain(this.confirmingData.toChainId);
    },
    toToken() {
      return (
        this.tokenBasic &&
        this.$store.getters.getTokenByTokenBasicNameAndChainId({
          tokenBasicName: this.tokenBasic.name,
          chainId: this.confirmingData.toChainId,
        })
      );
    },
    receivingAmount() {
      return (
        this.confirmingData &&
        new BigNumber(this.confirmingData.amount).minus(this.confirmingData.fee).toString()
      );
    },
    fromWallet() {
      return (
        this.confirmingData &&
        this.$store.getters.getChainConnectedWallet(this.confirmingData.fromChainId)
      );
    },
  },
  methods: {
    async confirm() {
      await this.$store.dispatch('ensureChainWalletReady', this.confirmingData.fromChainId);
      try {
        this.confirming = true;
        const walletApi = await getWalletApi(this.fromWallet.name);
        const transactionHash = await walletApi.nftLock({
          fromChainId: this.confirmingData.fromChainId,
          fromAddress: this.confirmingData.fromAddress,
          fromTokenHash: this.confirmingData.fromTokenHash,
          toChainId: this.confirmingData.toChainId,
          toAddress: this.confirmingData.toAddress,
          id: this.confirmingData.nft.TokenId,
          fee: this.confirmingData.fee.TokenAmount,
        });
        this.packing = true;
        let status = SingleTransactionStatus.Pending;
        this.$emit('update:confirmingData', {
          ...this.confirmingData,
          transactionHash,
          transactionStatus: status,
        });

        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            // eslint-disable-next-line no-await-in-loop
            status = await walletApi.getTransactionStatus({ transactionHash });
            if (status !== SingleTransactionStatus.Pending) {
              break;
            }
            // eslint-disable-next-line no-await-in-loop
            await delay(5000);
          } catch (error) {
            // ignore error
          }
        }
        this.$emit('update:confirmingData', {
          ...this.confirmingData,
          transactionHash,
          transactionStatus: status,
        });
        this.$emit('packed');
        this.$emit('update:visible', false);
      } finally {
        this.confirming = false;
        this.packing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 500px;
  height: 100vh;
  background: #171f31;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
}

.title {
  padding: 80px 50px 20px;
  font-weight: 500;
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
}

.field {
  @include child-margin-v(10px);
}

.label {
  opacity: 0.6;
  font-weight: 500;
  font-size: 14px;
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

.select-nft-basic {
  display: flex;
  align-items: center;
  > .image {
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
  > .token-id {
    margin-left: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    line-height: 20px;
  }
}
</style>
