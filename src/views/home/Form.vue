<template>
  <ValidationObserver ref="validation" tag="div" v-slot="{ invalid }" class="form">
    <div class="card">
      <!-- <div class="card-hidden">
        <div>
          <div style="padding-bottom:20px;font-size:32px">
            <span>The Gorgon Bridge is temporarily closed.</span>
          </div>
          <div style="font-size:20px">
            <span>Please check all the updates through offical twitter </span>
            <a href="https://twitter.com/PolyNetwork2" style="color:#3ec7eb" target="_blank"
              >https://twitter.com/PolyNetwork2</a
            >
          </div>
        </div>
      </div> -->
      <div class="title">{{ $t('home.form.title') }}</div>
      <div class="fields">
        <div class="field">
          <div class="label">{{ $t('home.form.asset') }}</div>
          <CButton class="select-token-basic" @click="selectTokenBasicVisible = true">
            <template v-if="tokenBasic">
              <img class="select-token-basic-icon" :src="tokenBasic.meta" />
              <span class="select-token-basic-name">{{ tokenBasicName }}</span>
            </template>
            <CFlexSpan />
            <img src="@/assets/svg/chevron-right.svg" />
          </CButton>
        </div>

        <div class="fields-row">
          <div class="field">
            <div class="label">{{ $t('home.form.from') }}</div>
            <CButton
              class="select-chain"
              :disabled="!tokenBasic"
              @click="selectFromChainVisible = true"
            >
              <div class="select-chain-content">
                <template v-if="fromChain">
                  <img class="select-chain-icon" :src="fromChain.icon" />
                  <span class="select-chain-name">
                    {{
                      $t('home.form.chainName', {
                        chainName: $formatEnum(fromChainId, { type: 'chainName' }),
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
                <img class="chevron-down" src="@/assets/svg/chevron-right.svg" />
              </div>
            </CButton>
            <div v-if="fromWallet" class="address">
              <span class="address-value">
                {{ $formatLongText(fromWallet.address, { headTailLength: 6 }) }}
              </span>
              <CButton @click="copy(fromWallet.address)">
                <img src="@/assets/svg/copy.svg" />
              </CButton>
            </div>
          </div>

          <CButton :disabled="!toChainId" @click="exchangeFromTo">
            <img src="@/assets/svg/exchange.svg" />
          </CButton>

          <div class="field">
            <div class="label">{{ $t('home.form.to') }}</div>
            <CButton
              class="select-chain"
              :disabled="!toChains"
              @click="selectToChainVisible = true"
            >
              <div class="select-chain-content">
                <template v-if="toChain">
                  <img class="select-chain-icon" :src="toChain.icon" />
                  <span class="select-chain-name">
                    {{
                      $t('home.form.chainName', {
                        chainName: $formatEnum(toChainId, { type: 'chainName' }),
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
            <div v-if="toWallet" class="address">
              <span class="address-value">
                {{ $formatLongText(toWallet.address, { headTailLength: 6 }) }}
              </span>
              <CButton @click="copy(toWallet.address)">
                <img src="@/assets/svg/copy.svg" />
              </CButton>
            </div>
          </div>
        </div>

        <ValidationProvider
          ref="amountValidation"
          tag="div"
          class="field"
          :rules="{
            required: true,
            number: true,
            positive: true,
            maxDecimals: tokenBasic && tokenBasic.decimals,
            maxValue: maxAmount,
            minValue: { min: minAmount, excluded: true },
          }"
          v-slot="{ errors }"
        >
          <div class="label">{{ $t('home.form.amount') }}</div>
          <div class="input">
            <CInput class="input-inner" v-model="amount" />
            <CButton v-if="balance" class="use-max" @click="transferAll">
              {{ $t('home.form.max') }}
            </CButton>
          </div>
          <div class="input-error">{{ errors[0] }}</div>
          <div
            v-if="
              fee &&
              fee.Balance < 500 &&
              fee.SwapTokenHash === 'deaddeaddeaddeaddeaddeaddeaddeaddead0000'
            "
            class="fee"
          >
            <span class="label" style="color: #f56c6c; opacity: 1">{{
              $t('home.form.warningMsg')
            }}</span>
          </div>
          <div
            v-if="
              fee &&
              fee.Balance < 500 &&
              fee.SwapTokenHash === 'e552fb52a4f19e44ef5a967632dbc320b0820639'
            "
            class="fee"
          >
            <span class="label" style="color: #f56c6c; opacity: 1">{{
              $t('home.form.warningMsg')
            }}</span>
          </div>
          <!-- <div v-if="fee && selfPayFlag" class="fee">
            <el-checkbox v-model="selfPayChecked"
              >{{ $t('home.form.selfPay') }}
              <CTooltip>
                <img class="tooltip-icon" src="@/assets/svg/question.svg" />
                <template #content>
                  {{ $t('home.form.selfPay') }}
                </template>
              </CTooltip>
            </el-checkbox>
          </div> -->
          <div v-if="fee" class="fee">
            <span class="label">{{ $t('home.form.maxamount') }}</span>
            <CTooltip>
              <img class="tooltip-icon" src="@/assets/svg/question.svg" />
              <template #content>
                {{ $t('home.form.maxamountTooltip') }}
              </template>
            </CTooltip>
            <CFlexSpan />
            <span class="fee-value">{{ $formatNumber(fee.Balance) }}</span>
            <img class="fee-icon" :src="tokenBasic.meta" />
            <span class="fee-token">{{ fromToken.name }}</span>
          </div>
          <div v-if="balance" class="balance">
            <span class="label">{{ $t('home.form.balance') }}</span>
            <CFlexSpan />
            <span class="value"> {{ $formatNumber(balance) }} {{ fromToken.name }} </span>
            <CTooltip v-if="fromToken.tokenBasicName === 'O3'">
              <img class="tooltip-icon" src="@/assets/svg/question.svg" />
              <template #content>
                {{ $t('home.form.o3ToolTip') }}
              </template>
            </CTooltip>
          </div>
          <div v-if="fee" class="fee">
            <span class="label">{{ $t('home.form.fee') }}</span>
            <CTooltip>
              <img class="tooltip-icon" src="@/assets/svg/question.svg" />
              <template #content>
                {{ $t('home.form.feeTooltip') }}
              </template>
            </CTooltip>
            <CFlexSpan />
            <span class="fee-value">{{ $formatNumber(selfPayChecked ? 0 : fee.TokenAmount) }}</span>
            <img class="fee-icon" :src="fromChain.nftFeeName ? fromChain.icon : tokenBasic.meta" />
            <span class="fee-token">{{
              fromChain.nftFeeName ? fromChain.nftFeeName : fromToken.name
            }}</span>
          </div>
          <div v-if="expectTime" class="fee">
            <span class="label">{{ $t('home.form.time') }}</span>
            <CTooltip>
              <img class="tooltip-icon" src="@/assets/svg/question.svg" />
              <template #content>
                {{ $t('home.form.timeTooltip') }}
              </template>
            </CTooltip>
            <CFlexSpan />
            <span class="fee-value">≈ {{ expectTime.Time }}s</span>
          </div>
        </ValidationProvider>
      </div>

      <CSubmitButton
        v-if="fromChain && toChain && !(fromWallet && toWallet)"
        @click="connectWalletVisible = true"
      >
        {{ $t('home.form.connectWallet') }}
      </CSubmitButton>
      <div v-else-if="!invalid && fromToken && toToken && needApproval" class="approve-wrapper">
        <el-checkbox v-model="approveInfinityChecked"
          >{{ $t('home.form.approveInfinity') }}
          <CTooltip>
            <img class="tooltip-icon" src="@/assets/svg/question.svg" />
            <template #content>
              {{ $t('home.form.approveInfinitytip') }}
            </template>
          </CTooltip>
        </el-checkbox>
        <CSubmitButton :loading="approving" @click="approve">
          {{ approving ? $t('buttons.approving') : $t('buttons.approve') }}
        </CSubmitButton>
      </div>
      <CSubmitButton
        v-else
        :disabled="invalid || !(fromToken && toToken)"
        @click="next"
        class="button-submit"
      >
        {{ $t('buttons.next') }}
      </CSubmitButton>
    </div>

    <div class="history">
      {{ $t('home.form.historyPrefix') }}
      <CLink class="link" :to="{ name: 'transactions' }">{{ $t('home.form.historyLink') }}</CLink>
    </div>

    <SelectTokenBasic
      :visible.sync="selectTokenBasicVisible"
      :tokenBasicName="tokenBasicName"
      @update:tokenBasicName="changeTokenBasicName"
      :tokenBasics="tokenBasics"
      :popularTokenBasics="tokenBasics"
    />
    <SelectChain
      :visible.sync="selectFromChainVisible"
      :chainId="fromChainId"
      @update:chainId="changeFromChainId"
      :chains="fromChains || []"
    />
    <SelectChain
      :visible.sync="selectToChainVisible"
      :chainId="toChainId"
      @update:chainId="changeToChainId"
      :chains="toChains || []"
    />
    <ConnectWallet
      :visible.sync="connectWalletVisible"
      :fromChainId="fromChainId"
      :toChainId="toChainId"
    />
    <Confirm
      :key="confirmUuid"
      :visible.sync="confirmVisible"
      :confirmingData.sync="confirmingData"
      @closed="handleClosed"
      @packed="handlePacked"
    />
    <TransactionDetails
      :visible.sync="transactionDetailsVisible"
      :confirmingData="confirmingData"
    />
  </ValidationObserver>
</template>

<script>
import BigNumber from 'bignumber.js';
import copy from 'clipboard-copy';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_TOKEN_BASIC_NAME } from '@/utils/values';
import { ChainId } from '@/utils/enums';
import TransactionDetails from '@/views/transactions/Details';
import { getWalletApi } from '@/utils/walletApi';
import SelectTokenBasic from './SelectTokenBasic';
import SelectChain from './SelectChain';
import ConnectWallet from './ConnectWallet';
import Confirm from './Confirm';

export default {
  name: 'Form',
  components: {
    SelectTokenBasic,
    SelectChain,
    ConnectWallet,
    Confirm,
    TransactionDetails,
  },
  data() {
    return {
      selectTokenBasicVisible: false,
      selectFromChainVisible: false,
      selectToChainVisible: false,
      connectWalletVisible: false,
      confirmVisible: false,
      transactionDetailsVisible: false,
      tokenBasicName: this.$route.params.token
        ? this.$route.params.token
        : DEFAULT_TOKEN_BASIC_NAME,
      fromChainId: null,
      toChainId: null,
      amount: '',
      approving: false,
      confirmingData: null,
      approveInfinityChecked: false,
      selfPayChecked: false,
      confirmUuid: uuidv4(),
    };
  },
  computed: {
    minAmount() {
      let res;
      if (this.fromChain) {
        if (
          this.fromChain.nftFeeContractHash &&
          this.fromChain.nftFeeContractHash !== '0000000000000000000000000000000000000103'
        ) {
          res = 0;
        } else {
          res = this.fee ? this.fee.TokenAmount : 0;
        }
      } else {
        res = this.fee ? this.fee.TokenAmount : 0;
      }
      return res;
    },
    maxAmount() {
      let res;
      if (this.fee && this.tofee) {
        if (Number(this.fee.Balance) > Number(this.balance)) {
          res = this.balance;
        } else {
          res = this.fee.Balance;
        }
        if (this.fromToken.name === 'C' && res > 2000000000000) {
          res = 2000000000000;
        }
        if (
          this.fromToken.hash === '0000000000000000000000000000000000000000' ||
          this.fromToken.hash === 'deaddeaddeaddeaddeaddeaddeaddeaddead0000'
        ) {
          res = new BigNumber(res).minus(this.fee.TokenAmount).toNumber();
          res = new BigNumber(res).minus(this.tofee.TokenAmount).toNumber();
        }
        if (res < 0) {
          res = 0;
        }
      }
      return res;
    },
    tokenBasics() {
      return this.$store.getters.tokenBasics;
    },
    tokenBasic() {
      return this.$store.getters.getTokenBasic(this.tokenBasicName);
    },
    chains() {
      return this.$store.getters.chains.filter((chain) => chain.id !== ChainId.Poly);
    },
    fromChains() {
      return (
        this.tokenBasic &&
        this.$store.getters
          .getTokensByTokenBasicName(this.tokenBasic.name)
          .map((token) => this.$store.getters.getChain(token.chainId))
          .filter((chain) => chain)
      );
    },
    fromChain() {
      return this.$store.getters.getChain(this.fromChainId);
    },
    fromToken() {
      return (
        this.tokenBasic &&
        this.$store.getters.getTokenByTokenBasicNameAndChainId({
          tokenBasicName: this.tokenBasicName,
          chainId: this.fromChainId,
        })
      );
    },
    fromWallet() {
      return this.$store.getters.getChainConnectedWallet(this.fromChainId);
    },
    getTokenMapsParams() {
      if (this.fromToken) {
        return {
          fromChainId: this.fromChainId,
          fromTokenHash: this.fromToken.hash,
        };
      }
      return null;
    },
    tokenMaps() {
      return this.getTokenMapsParams && this.$store.getters.getTokenMaps(this.getTokenMapsParams);
    },
    toChains() {
      return (
        this.tokenMaps &&
        this.tokenMaps
          .map((tokenMap) => this.$store.getters.getChain(tokenMap.toToken.chainId))
          .filter((chain) => chain)
      );
    },
    toChain() {
      return this.$store.getters.getChain(this.toChainId);
    },
    selfPayFlag() {
      return this.toChain.selfPay;
    },
    toToken() {
      return (
        this.tokenBasic &&
        this.$store.getters.getTokenByTokenBasicNameAndChainId({
          tokenBasicName: this.tokenBasicName,
          chainId: this.toChainId,
        })
      );
    },
    toWallet() {
      return this.$store.getters.getChainConnectedWallet(this.toChainId);
    },
    getBalanceParams() {
      if (this.fromWallet && this.fromToken) {
        return {
          chainId: this.fromChainId,
          address: this.fromWallet.address,
          tokenHash: this.fromToken.hash,
          tokenBasicName: this.fromToken.tokenBasicName,
        };
      }
      return null;
    },
    balance() {
      return this.getBalanceParams && this.$store.getters.getBalance(this.getBalanceParams);
    },
    getAllowanceParams() {
      if (this.fromWallet && this.fromChain && this.fromToken && this.balance) {
        return {
          chainId: this.fromChainId,
          address: this.fromWallet.address,
          tokenHash: this.fromToken.hash,
          spender: this.fromChain.lockContractHash,
        };
      }
      return null;
    },
    allowance() {
      return this.getAllowanceParams && this.$store.getters.getAllowance(this.getAllowanceParams);
    },
    needApproval() {
      return !!this.amount && !!this.allowance && new BigNumber(this.amount).gt(this.allowance);
    },
    getFeeParams() {
      if (this.fromToken && this.toChainId) {
        return {
          fromChainId: this.fromChainId,
          fromTokenHash: this.fromChain.nftFeeContractHash
            ? this.fromChain.nftFeeContractHash
            : this.fromToken.hash,
          toChainId: this.toChainId,
          toTokenHash: this.fromToken.hash,
        };
      }
      return null;
    },
    getToFeeParams() {
      if (this.toToken && this.fromChainId) {
        return {
          fromChainId: this.toChainId,
          fromTokenHash: this.toToken.hash,
          toChainId: this.fromChainId,
          toTokenHash: this.toToken.hash,
        };
      }
      return null;
    },
    getExpectTimeParams() {
      if (this.fromToken && this.toChainId) {
        return {
          fromChainId: this.fromChainId,
          toChainId: this.toChainId,
        };
      }
      return null;
    },
    expectTime() {
      return (
        this.getExpectTimeParams && this.$store.getters.getExpectTime(this.getExpectTimeParams)
      );
    },
    fee() {
      return this.getFeeParams && this.$store.getters.getFee(this.getFeeParams);
    },
    tofee() {
      return this.getToFeeParams && this.$store.getters.getFee(this.getToFeeParams);
    },
  },
  watch: {
    async getBalanceParams(value) {
      if (value) {
        await this.$store.dispatch('ensureChainWalletReady', value.chainId);
        this.$store.dispatch('getBalance', value);
      }
    },
    getFeeParams(value) {
      if (value) {
        this.$store.dispatch('getFee', value);
      }
    },
    getToFeeParams(value) {
      if (value) {
        this.$store.dispatch('getFee', value);
      }
    },
    getExpectTimeParams(value) {
      if (value) {
        this.$store.dispatch('getExpectTime', value);
      }
    },
    getTokenMapsParams(value) {
      if (value) {
        this.$store.dispatch('getTokenMaps', value);
      }
    },
    async getAllowanceParams(value) {
      if (value) {
        await this.$store.dispatch('ensureChainWalletReady', value.chainId);
        this.$store.dispatch('getAllowance', value);
      }
    },
    fromChain() {
      this.selfPayChecked = false;
    },
    fromToken() {
      this.selfPayChecked = false;
    },
    toChain() {
      this.selfPayChecked = false;
    },
  },
  created() {
    this.$store.dispatch('getTokenBasics');
    this.interval = setInterval(() => {
      if (
        this.getBalanceParams &&
        this.fromWallet &&
        this.fromWallet.chainId === this.fromChainId
      ) {
        this.$store.dispatch('getBalance', this.getBalanceParams);
      }
      if (
        this.getAllowanceParams &&
        this.fromWallet &&
        this.fromWallet.chainId === this.fromChainId
      ) {
        this.$store.dispatch('getAllowance', this.getAllowanceParams);
      }
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    changeTokenBasicName(tokenBasicName) {
      this.tokenBasicName = tokenBasicName;
      this.fromChainId = null;
      this.toChainId = null;
      this.clearAmount();
    },
    changeFromChainId(chainId) {
      this.fromChainId = chainId;
      this.toChainId = null;
      this.clearAmount();
    },
    changeToChainId(chainId) {
      this.toChainId = chainId;
      this.clearAmount();
    },
    async exchangeFromTo() {
      await this.$store.dispatch('getTokenMaps', {
        fromChainId: this.toChainId,
        fromTokenHash: this.toToken.hash,
      });
      const { fromChainId } = this;
      this.fromChainId = this.toChainId;
      if (this.toChains && this.toChains.find((chain) => chain.id === fromChainId)) {
        this.toChainId = fromChainId;
      } else {
        this.toChainId = null;
      }
      this.clearAmount();
    },
    copy(text) {
      copy(text);
      this.$message.success(this.$t('messages.copied', { text }));
    },
    transferAll() {
      let res;
      if (Number(this.fee.Balance) > Number(this.balance)) {
        res = this.balance;
      } else {
        res = this.fee.Balance;
      }
      if (
        this.fromToken.hash === '0000000000000000000000000000000000000000' ||
        this.fromToken.hash === 'deaddeaddeaddeaddeaddeaddeaddeaddead0000'
      ) {
        res = new BigNumber(res).minus(this.fee.TokenAmount).toNumber();
        res = new BigNumber(res).minus(this.tofee.TokenAmount).toNumber();
      }
      if (res < 0) {
        this.$message.error(this.$t('errors.wallet.INSUFFICIENT_FUNDS'));
        res = 0;
      }
      this.amount = res;
      this.$nextTick(() => this.$refs.amountValidation.validate());
    },
    async approve() {
      await this.$store.dispatch('ensureChainWalletReady', this.fromChainId);
      // const InfinityAmount = 9999999999999
      try {
        this.approving = true;
        const walletApi = await getWalletApi(this.fromWallet.name);
        const totalSupply = await walletApi.getTotalSupply({
          chainId: this.fromChainId,
          tokenHash: this.fromToken.hash,
        });
        const InfinityAmount = totalSupply > 0 ? totalSupply : 9999999999999;
        if (!new BigNumber(this.allowance).isZero()) {
          await walletApi.approve({
            chainId: this.fromChainId,
            address: this.fromWallet.address,
            tokenHash: this.fromToken.hash,
            spender: this.fromChain.lockContractHash,
            amount: 0,
          });
        }

        await walletApi.approve({
          chainId: this.fromChainId,
          address: this.fromWallet.address,
          tokenHash: this.fromToken.hash,
          spender: this.fromChain.lockContractHash,
          amount: this.approveInfinityChecked ? InfinityAmount : this.amount,
        });

        await this.$store.dispatch('getAllowance', this.getAllowanceParams);
      } finally {
        this.approving = false;
      }
    },
    next() {
      this.confirmingData = {
        fromAddress: this.fromWallet.address,
        toAddress: this.toWallet.address,
        fromChainId: this.fromChainId,
        toChainId: this.toChainId,
        fromTokenHash: this.fromToken.hash,
        toTokenHash: this.toToken.hash,
        amount: this.amount,
        fee: this.selfPayChecked ? 0 : this.fee.TokenAmount,
      };
      this.confirmVisible = true;
    },
    handleClosed() {
      this.$nextTick(() => {
        this.confirmUuid = uuidv4();
      });
    },
    handlePacked() {
      this.transactionDetailsVisible = true;
      this.clearAmount();
    },
    clearAmount() {
      this.amount = '';
      this.$nextTick(() => this.$refs.amountValidation.reset());
    },
  },
};
</script>
<style>
.el-checkbox__inner {
  background-color: rgba(0, 0, 0, 0);
  border-color: #606266;
  border-radius: 7px;
}
.el-checkbox__label:hover {
  color: #606266;
  transition: all ease 0.3s;
}
.el-checkbox__input.is-checked {
  background-color: rgba(0, 0, 0, 0);
  border-color: rgba(0, 0, 0, 0);
  border-radius: 7px;
}
.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #282bdb !important;
  border-color: rgba(0, 0, 0, 0) !important;
  border-radius: 7px;
}
.el-checkbox__input.is-focus .el-checkbox__inner {
  background-color: rgba(0, 0, 0, 0);
  border-color: #606266;
  border-radius: 7px;
}
.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
  transition: all ease 0.3s;
}
.el-checkbox__inner:hover {
  border-color: #606266;
}
.el-checkbox__inner {
  border-radius: 7px;
  transition: all ease 0.3s;
}
.el-checkbox__label {
  transition: all ease 0.3s;
}
.tooltip-icon {
  vertical-align: middle !important;
}
</style>
<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  @include child-margin-v(30px);
}

.card {
  box-sizing: border-box;
  width: 452px;
  padding: 40px 50px 54px;
  background: #7d5040;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
  border-radius: 10px;
  position: relative;
}
.card-hidden {
  box-sizing: border-box;
  width: 452px;
  height: 100%;
  padding: 40px 50px 54px;
  background: rgba(23, 31, 49, 0.9);
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
  border-radius: 10px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-weight: 500px;
  font-size: 20px;
  text-align: center;
  @include next-margin-v(30px);
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
  font-size: 12px;
}

.value {
  font-size: 10px;
}

.select-token-basic {
  display: flex;
  align-items: center;
  width: stretch;
  height: 40px;
  padding: 0 14px;
  background: rgba(#000000, 0.26);
  border-radius: 4px;
  @include child-margin-h(8px);
}

.select-token-basic-icon {
  width: 20px;
  border-radius: 10px;
}

.select-token-basic-name {
  font-size: 14px;
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

.input {
  display: flex;
  padding: 18px 14px;
  background: rgba(#000000, 0.26);
  border-radius: 4px;
}

.input-error {
  color: $--color-danger;
  font-size: 12px;
}

.use-max {
  padding: 5px;
  border-radius: 4px;
  color: rgba(#ffffff, 0.6);
  background: rgba(#ffffff, 0.05);
  font-weight: 600;
  font-size: 12px;
}

.balance,
.fee {
  display: flex;
  align-items: center;
  @include child-margin-h(4px);
}

.tooltip-icon {
  vertical-align: middle;
}

.fee-value {
  font-size: 12px;
}

.fee-icon {
  width: 14px;
  border-radius: 7px;
}

.fee-token {
  font-size: 10px;
}

.link {
  color: #2fd8ca;
  text-decoration: underline;
}
.approve-wrapper {
  label {
    margin-bottom: 10px;
  }
}
</style>
<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .card {
    max-width: 90vw;
    padding: 20px 30px;
  }
  .button-submit {
    margin: 20px 0 30px 0 !important;
  }
  .chevron-down {
    margin-top: -12px;
  }
}
</style>
