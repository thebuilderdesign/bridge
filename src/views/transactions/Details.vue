<template>
  <CDrawer
    v-bind="$attrs"
    :closeOnClickModal="!confirmingData || failed || finished"
    :closeOnPressEscape="!confirmingData || failed || finished"
    v-on="$listeners"
  >
    <div class="content">
      <div class="title">{{ $t('transactions.details.title') }}</div>
      <div v-if="steps" class="scroll">
        <div v-for="(step, index) in steps" :key="step.chainId" class="step">
          <template v-if="step.chainId != null">
            <img
              class="step-icon"
              :class="{ [getStepStatus(index)]: true }"
              :src="statusIcons[getStepStatus(index)]"
            />
            <div v-if="index !== steps.length - 1" class="step-line" />
            <div class="step-title">{{ $formatEnum(step.chainId, { type: 'chainName' }) }}</div>
            <div class="description">
              {{
                $t(`transactions.details.${getStepStatus(index)}`, {
                  chainName: $formatEnum(step.chainId, { type: 'chainName' }),
                })
              }}
            </div>
            <div class="progress">
              <ElProgress
                class="progress-bar"
                :percentage="(step.blocks / step.needBlocks || 0) * 100"
                :showText="false"
              />
              <span class="progress-text">
                {{
                  $t('transactions.details.confirmation', {
                    blocks: step.blocks != null ? step.blocks : '-',
                    needBlocks: step.needBlocks != null ? step.needBlocks : '-',
                  })
                }}
              </span>
            </div>
            <CLink
              class="link"
              :href="$format(getChain(step.chainId).explorerUrl, { txHash: step.hash })"
              target="_blank"
              :disabled="!step.hash"
            >
              {{
                $t('transactions.details.hash', {
                  hash: $formatLongText(step.hash || 'N/A', { headTailLength: 16 }),
                })
              }}
            </CLink>
            <div
              class="speedup"
              v-if="
                index == 2 &&
                  getStepStatus(2) === 'pending' &&
                  $route.name === 'home' &&
                  step.chainId !== 3 &&
                  step.chainId !== 4 &&
                  step.chainId !== 5 &&
                  step.chainId !== 14 &&
                  step.chainId !== 88
              "
            >
              {{ $t('home.form.speedup') }}
              <a
                target="_blank"
                href="https://medium.com/poly-network/poly-bridge-new-acceleration-function-pc-user-manual-cd0b6cacceea"
                style="color: #fff"
                >Link</a
              >
            </div>

            <div
              class="speedup"
              v-if="
                index == 2 &&
                  getStepStatus(2) === 'pending' &&
                  $route.name === 'transactions' &&
                  speedUpMSGFlag &&
                  step.chainId !== 3 &&
                  step.chainId !== 4 &&
                  step.chainId !== 5 &&
                  step.chainId !== 14 &&
                  step.chainId !== 88
              "
            >
              {{ $t('home.form.speedUpMSG') }}
            </div>
            <CSubmitButton
              :loading="selfPayLoading"
              v-if="
                index == 2 &&
                  getStepStatus(2) === 'pending' &&
                  $route.name === 'transactions' &&
                  step.chainId !== 3 &&
                  step.chainId !== 4 &&
                  step.chainId !== 5 &&
                  step.chainId !== 14 &&
                  step.chainId !== 88
              "
              @click="payTochainFee"
              class="button-submit"
            >
              {{ selfPay ? $t('buttons.pay') : $t('buttons.speedup') }}
            </CSubmitButton>
          </template>

          <template v-else-if="step.failed">
            <img class="step-icon failed" src="@/assets/svg/status-failed.svg" />
            <div v-if="index !== steps.length - 1" class="step-line" />
            <div class="failed-title">{{ $t('transactions.details.failedTitle') }}</div>
            <CLink v-if="confirmingData" class="link" :to="{ name: 'transactions' }">
              {{ $t('transactions.details.gotoHistory') }}
            </CLink>
          </template>

          <template v-else-if="step.finished">
            <img class="step-icon succeeded" src="@/assets/svg/status-succeeded.svg" />
            <div v-if="index !== steps.length - 1" class="step-line" />
            <div class="finished-title">{{ $t('transactions.details.finishedTitle') }}</div>
            <CLink v-if="confirmingData" class="link" :to="{ name: 'transactions' }">
              {{ $t('transactions.details.gotoHistory') }}
            </CLink>
          </template>
        </div>
      </div>
    </div>
    <ConnectWallet
      v-if="steps"
      :visible.sync="connectWalletVisible"
      :toChainId="steps[2].chainId"
    />
  </CDrawer>
</template>

<script>
import { ChainId, SingleTransactionStatus, TransactionStatus } from '@/utils/enums';
import { HttpError } from '@/utils/errors';
import { getWalletApi } from '@/utils/walletApi';
import httpApi from '@/utils/httpApi';
import ConnectWallet from '../home/ConnectWallet';

export default {
  name: 'Details',
  components: {
    ConnectWallet,
  },
  inheritAttrs: false,
  props: {
    hash: String,
    confirmingData: Object,
  },
  data() {
    return {
      selfPayLoading: false,
      connectWalletVisible: false,
      speedUpMSGFlag: false,
    };
  },
  computed: {
    mergedHash() {
      return this.hash || (this.confirmingData && this.confirmingData.transactionHash);
    },
    transaction() {
      return this.$store.getters.getTransaction(this.mergedHash);
    },
    fromWallet() {
      return (
        this.transaction &&
        this.$store.getters.getChainConnectedWallet(this.transaction.fromChainId)
      );
    },
    toWallet() {
      return (
        this.transaction && this.$store.getters.getChainConnectedWallet(this.transaction.toChainId)
      );
    },
    mergedTransaction() {
      return (
        this.transaction ||
        (this.confirmingData && {
          steps: [
            {
              hash: this.confirmingData.transactionHash,
              chainId: this.confirmingData.fromChainId,
            },
            {
              chainId: ChainId.Poly,
            },
            {
              chainId: this.confirmingData.toChainId,
            },
          ],
        })
      );
    },
    steps() {
      if (!this.mergedTransaction) {
        return null;
      }
      let { steps } = this.mergedTransaction;
      if (this.failed) {
        steps = [...steps, { failed: this.failed }];
      }
      if (this.finished) {
        steps = [...steps, { finished: this.finished }];
      }
      return steps;
    },
    failed() {
      return (
        !!this.confirmingData &&
        this.confirmingData.transactionStatus === SingleTransactionStatus.Failed
      );
    },
    selfPay() {
      return Number(this.transaction.fee) === 0;
    },
    finished() {
      return !!this.transaction && this.transaction.status === TransactionStatus.Finished;
    },
    closeable() {
      return !this.confirmingData || this.failed || this.finished;
    },
    statusIcons() {
      return {
        waiting: require('@/assets/svg/status-waiting.svg'),
        pending: require('@/assets/svg/status-pending.svg'),
        succeeded: require('@/assets/svg/status-succeeded.svg'),
        failed: require('@/assets/svg/status-failed.svg'),
      };
    },
  },
  watch: {
    mergedHash() {
      this.getTransaction();
    },
    finished() {
      if (this.finished) {
        this.selfPayLoading = false;
      }
    },
    hash() {
      this.speedUpMSGFlag = false;
    },
  },
  created() {
    console.log(this.$route);
    this.interval = setInterval(() => {
      this.getTransaction();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getChain(chainId) {
      return this.$store.getters.getChain(chainId);
    },
    getStepStatus(index) {
      if (!this.steps) {
        return null;
      }
      if (this.failed && index === 0) {
        return 'failed';
      }
      const step = this.steps[index];
      if (step.blocks >= step.needBlocks) {
        return 'succeeded';
      }
      const lastStep = this.steps[index - 1];
      if (!lastStep || lastStep.blocks >= lastStep.needBlocks) {
        return 'pending';
      }
      return 'waiting';
    },
    async getTransaction() {
      if (this.mergedHash && this.$attrs.visible) {
        try {
          await this.$store.dispatch('getTransaction', this.mergedHash);
        } catch (error) {
          if (error instanceof HttpError) {
            if (error.code === HttpError.CODES.BAD_REQUEST) {
              return;
            }
          }
          throw error;
        }
      }
    },
    async payTochainFee() {
      if (!this.toWallet) {
        this.connectWalletVisible = true;
      }
      await this.$store.dispatch('ensureChainWalletReady', this.transaction.toChainId);
      if (this.transaction.steps[1].hash) {
        try {
          this.selfPayLoading = true;
          // this.$store.dispatch('getManualTxData', this.transaction.steps[1].hash);
          const polyHash = this.transaction.steps[1].hash;
          const result = await httpApi.getManualTxData({ polyHash });
          this.sendTx(result);
        } catch (error) {
          if (error instanceof HttpError) {
            if (error.code === HttpError.CODES.BAD_REQUEST) {
              return;
            }
          }
          throw error;
        }
      }
    },
    async sendTx($payload) {
      const self = this;
      console.log(self.toWallet);
      const walletApi = await getWalletApi(self.toWallet.name);
      const params = {
        data: $payload.data,
        toAddress: $payload.dst_ccm,
        toChainId: self.steps[2].chainId,
      };
      try {
        await walletApi.sendSelfPayTx(params);
        this.selfPayLoading = false;
        this.speedUpMSGFlag = true;
      } catch (error) {
        console.log(error);
        if (error.toString().indexOf('promise') < 0) {
          this.selfPayLoading = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.speedup {
  opacity: 0.6;
  padding-top: 20px;
}
.button-submit {
  margin-top: 30px;
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
  padding: 80px 50px 40px;
  font-weight: 600;
  font-size: 40px;
}

.scroll {
  flex: 1;
  padding: 40px 50px 40px 80px;
  overflow-y: auto;
  @include scroll-bar(rgba(#fff, 0.2), transparent);
  @include child-margin-v(56px);
}

.step {
  position: relative;
}

.step-icon {
  position: absolute;
  left: -31px;
  top: 1px;

  &.pending {
    animation: rotation 2s infinite linear;
  }
}

.step-line {
  position: absolute;
  left: -24.5px;
  top: 18px;
  width: 1px;
  height: calc(100% + 36px);
  background: #ffffff;
  opacity: 0.3;
}

.step-title {
  font-weight: 500;
  @include next-margin-v(10px);
}

.description {
  opacity: 0.6;
  font-size: 14px;
  @include next-margin-v(20px);
}

.progress {
  display: flex;
  align-items: center;
  @include child-margin-h(20px);
  @include next-margin-v(26px);
}

.progress-bar {
  flex: 1;
  ::v-deep .el-progress-bar__outer {
    background: rgba(#ffffff, 0.3);
  }

  ::v-deep .el-progress-bar__inner {
    background: #ffffff;
  }
}

.progress-text {
  opacity: 0.6;
  font-size: 12px;
}

.link {
  display: inline-block;
  opacity: 0.6;
  color: #3ec7eb;
  font-size: 14px;
  text-decoration: underline;
}

.failed-title {
  color: #ff4141;
  font-weight: 500;
  font-size: 24px;
  @include next-margin-v(10px);
}

.finished-title {
  color: #2fd8ca;
  font-weight: 500;
  font-size: 24px;
  @include next-margin-v(10px);
}
</style>

<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .content {
    .title {
      font-size: 20px;
    }
    width: 100vw;
  }
}
</style>
