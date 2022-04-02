<template>
  <Page class="transactions">
    <img class="top-decoration" src="@/assets/svg/poly-bg.svg" />
    <div class="bottom-decoration-wrapper">
      <img class="bottom-decoration" src="@/assets/svg/poly-bg.svg" />
    </div>
    <div class="content">
      <div class="content-inner">
        <div class="title">{{ $t('transactions.index.title') }}</div>

        <div class="table-wrapper">
          <ElTable :data="transactions.items" class="table">
            <ElTableColumn width="20" />
            <ElTableColumn
              #default="{ row }"
              :label="$t('transactions.index.fromChain')"
              min-width="150"
            >
              <div class="chain">
                <img
                  class="chain-icon"
                  :src="getChain(row.fromChainId) ? getChain(row.fromChainId).icon : ''"
                />
                <span>{{ $formatEnum(row.fromChainId, { type: 'chainName' }) }}</span>
              </div>
              <CLink
                class="hash"
                :href="
                  $format(getChain(row.fromChainId) ? getChain(row.fromChainId).explorerUrl : '', {
                    txHash: row.fromTransactionHash,
                  })
                "
                target="_blank"
                :disabled="!row.fromTransactionHash"
              >
                {{
                  $t('transactions.index.hash', {
                    hash: $formatLongText(row.fromTransactionHash || 'N/A'),
                  })
                }}
              </CLink>
            </ElTableColumn>
            <ElTableColumn
              #default="{ row }"
              :label="$t('transactions.index.toChain')"
              min-width="150"
            >
              <div class="chain">
                <img
                  class="chain-icon"
                  :src="getChain(row.toChainId) ? getChain(row.toChainId).icon : ''"
                />
                <span>{{ $formatEnum(row.toChainId, { type: 'chainName' }) }}</span>
              </div>
              <CLink
                class="hash"
                :href="
                  $format(getChain(row.toChainId) ? getChain(row.toChainId).explorerUrl : '', {
                    txHash: row.toTransactionHash,
                  })
                "
                target="_blank"
                :disabled="!row.toTransactionHash"
              >
                {{
                  $t('transactions.index.hash', {
                    hash: $formatLongText(row.toTransactionHash || 'N/A'),
                  })
                }}
              </CLink>
            </ElTableColumn>
            <ElTableColumn
              #default="{ row }"
              min-width="120"
              :label="$t('transactions.index.amount')"
            >
              {{ $formatNumber(row.amount) }} {{ row.tokenBasicName }}
            </ElTableColumn>
            <ElTableColumn #default="{ row }" min-width="120" :label="$t('transactions.index.fee')">
              {{ $formatNumber(row.fee) }} {{ row.txfeeToken.name }}
            </ElTableColumn>
            <!-- <ElTableColumn :label="$t('transactions.index.asset')"
                           prop="tokenBasicName" /> -->
            <ElTableColumn
              #default="{ row }"
              :label="$t('transactions.index.time')"
              min-width="110"
            >
              {{ $formatTime(row.time) }}
            </ElTableColumn>
            <ElTableColumn
              #default="{ row }"
              :label="$t('transactions.index.status')"
              align="right"
            >
              <CButton class="view-details" @click="viewDetails(row)">
                {{ $formatEnum(row.status, { type: 'transactionStatus' }) }}
              </CButton>
            </ElTableColumn>
            <ElTableColumn width="20" />
          </ElTable>
          <div class="pagination">
            <CButton @click="page--" :disabled="page <= 1 || transactions.pageCount == null">
              <img src="@/assets/svg/arrow-left.svg" />
            </CButton>
            <span>{{
              $t('transactions.index.pagination', {
                page: page,
                pageCount: transactions.pageCount || 1,
              })
            }}</span>
            <CButton @click="page++" :disabled="!(page < transactions.pageCount)">
              <img src="@/assets/svg/arrow-right.svg" />
            </CButton>
          </div>
        </div>
      </div>
    </div>
    <TransactionDetails :visible.sync="transactionDetailsVisible" :hash="transactionHash" />
  </Page>
</template>

<script>
import _ from 'lodash';
import Page from '@/views/common/Page';
import TransactionDetails from './Details';

export default {
  name: 'Transactions',
  components: {
    Page,
    TransactionDetails,
  },
  data() {
    return {
      transactionDetailsVisible: false,
      transactionHash: null,
      page: 1,
      pageSize: 10,
      transactions: {
        items: [],
        pageCount: 0,
      },
    };
  },
  computed: {
    addressHexs() {
      return this.$store.getters.wallets
        .filter(wallet => wallet.addressHex)
        .map(wallet => wallet.addressHex);
    },
    getTransactionsParams() {
      return {
        addressHexs: this.addressHexs,
        page: this.page,
        pageSize: this.pageSize,
        vary: ['pageSize'],
      };
    },
    netTransactions() {
      console.log(this.$store.getters.getTransactions(this.getTransactionsParams));
      return this.$store.getters.getTransactions(this.getTransactionsParams) || {};
    },
  },
  watch: {
    getTransactionsParams: {
      handler(value, oldValue) {
        if (!_.isEqual(value, oldValue)) {
          this.$store.dispatch('getTransactions', value);
        }
      },
      immediate: true,
    },
    netTransactions(value, oldValue) {
      if (oldValue.items) {
        if (value.items.length >= oldValue.items.length) {
          console.log('value.items.length');
          console.log(value.items.length);
          console.log(oldValue.items.length);
          this.transactions = value;
        }
      } else {
        this.transactions = value;
      }
    },
  },
  methods: {
    getChain(chainId) {
      return this.$store.getters.getChain(chainId);
    },
    viewDetails(transaction) {
      this.transactionHash = transaction.hash;
      this.transactionDetailsVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (min-width: 900px) {
  .transactions {
    min-width: 1440px;
  }
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

.content {
  display: flex;
  flex: 1;
  margin: auto;
  @include child-margin-v(24px);
}

.content-inner {
  @media screen and (min-width: 900px) {
    width: 1160px;
  }
  margin: 40px auto 20px;
  @include child-margin-v(24px);
}

.title {
  font-size: 20px;
}

.table-wrapper {
  padding: 12px 0 24px;
  border-radius: 20px;
  background: #182233;
  @include child-margin-v(24px);
}

.chain {
  display: flex;
  align-items: center;
  @include child-margin-h(6px);
}

.chain-icon {
  width: 24px;
}

.hash {
  color: #2fd8ca;
  font-size: 14px;
}

.view-details {
  color: #2fd8ca;
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  @include child-margin-h(6px);
}
</style>
<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .transactions {
    max-width: 100vw;
  }
  .top-decoration {
    display: none;
  }
  .bottom-decoration-wrapper {
    display: none;
  }
  .table {
    max-width: 90vw;
  }
  .content {
    margin-top: 40px;
    .title {
      display: none;
      // margin-top: 20px;
      // text-align: center;
    }
    .content-inner {
      margin-top: 0;
    }
  }
}
</style>
