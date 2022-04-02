/* eslint-disable */
<template>
  <CCard>
    <div class="header-mobile" style="display: none">
      <div class="header-mobile-title">Connect wallet</div>
      <CButton class="header-mobile-close" @click="$emit('close')">
        <img src="@/assets/svg/close.svg" />
      </CButton>
    </div>

    <div class="content">
      <div class="chains" v-if="$route.name == 'home'">
        <CButton
          v-for="chain in chains"
          :key="chain.id"
          class="chain"
          :class="{ selected: chainIdWithDefault === chain.id }"
          @click="chainId = chain.id"
          @mouseover="chainId = chain.id"
        >
          <img class="chain-icon" :src="chain.icon" />
        </CButton>
      </div>
      <div class="chains" v-if="$route.name == 'transactions'">
        <CButton
          v-for="chain in chains"
          :key="chain.id"
          class="chain"
          :class="{ selected: chainIdWithDefault === chain.id }"
          @click="chainId = chain.id"
          @mouseover="chainId = chain.id"
        >
          <img class="chain-icon" :src="chain.icon" />
        </CButton>
      </div>
      <div class="chains" v-if="$route.name == 'nft'">
        <CButton
          v-for="chain in nftChains"
          :key="chain.id"
          class="chain"
          :class="{ selected: chainIdWithDefault === chain.id }"
          @click="chainId = chain.id"
          @mouseover="chainId = chain.id"
        >
          <img class="chain-icon" :src="chain.icon" />
        </CButton>
      </div>
      <!-- <div class="chains" v-if="$route.name == 'transactions'">
        <CButton
          v-for="chain in chains"
          :key="chain.id"
          class="chain"
          :class="{ selected: chainIdWithDefault === chain.id }"
          @click="chainId = chain.id"
          @mouseover="chainId = chain.id"
        >
          <img class="chain-icon" :src="chain.icon" />
        </CButton>
      </div> -->

      <CDivider direction="vertical" />

      <transition name="fade" mode="out-in">
        <div class="wallets" :key="chain.id">
          <div class="chain-name">
            {{
              $t('common.connectWallet.chainName', {
                chainName: $formatEnum(chain.id, { type: 'chainName' }),
              })
            }}
          </div>
          <div v-for="wallet in chainWallets" :key="wallet.name">
            <div v-if="wallet.connected && wallet.name === chain.selectedWalletName" class="wallet">
              <img class="wallet-icon" :src="wallet.icon" />
              <span class="wallet-name">
                {{
                  $t('common.connectWallet.walletConnected', {
                    walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                  })
                }}
              </span>
            </div>
            <CButton v-else class="connect" @click="connect(chain, wallet)">
              <span class="wallet-name">
                {{
                  $t('common.connectWallet.connectWallet', {
                    walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                  })
                }}
              </span>
              <img class="wallet-icon" :src="wallet.icon" />
            </CButton>
          </div>
        </div>
      </transition>
    </div>
  </CCard>
</template>

<script>
import { ChainId } from '@/utils/enums';
import { getWalletApi } from '@/utils/walletApi';

export default {
  name: 'ConnectWallet',
  data() {
    return {
      chainId: 0,
    };
  },
  computed: {
    chains() {
      return this.$store.getters.chains.filter(chain => chain.id !== ChainId.Poly);
    },
    nftChains() {
      return this.$store.getters.chains.filter(
        chain => chain.id !== ChainId.Poly && chain.id !== ChainId.Ont && chain.id !== ChainId.Neo,
      );
    },
    chainIdWithDefault() {
      return this.chainId ? this.chainId : this.chains[0].id;
    },
    chain() {
      return this.$store.getters.getChain(this.chainIdWithDefault);
    },
    chainWallets() {
      return this.$store.getters.getWalletsByChainId(this.chainIdWithDefault);
    },
  },
  methods: {
    async connect(chain, wallet) {
      console.log(wallet);
      if (wallet.installed) {
        if (!wallet.connected) {
          const walletApi = await getWalletApi(wallet.name);
          await walletApi.connect();
        }
        this.$store.dispatch('setChainSelectedWallet', {
          chainId: chain.id,
          walletName: wallet.name,
        });
      } else {
        console.log(1);
        window.open(wallet.downloadUrl);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  min-width: 310px;
  max-height: calc(100vh - 100px);
}

.chains {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.chains::-webkit-scrollbar-track-piece {
  //滚动条凹槽的颜色，还可以设置边框属性

  background-color: rgba(37, 37, 48, 0.8);
}

.chains::-webkit-scrollbar {
  //滚动条的宽度

  width: 2px;

  height: 9px;
}

.chains::-webkit-scrollbar-thumb {
  //滚动条的设置

  background-color: rgba(0, 0, 0, 0.4);

  background-clip: padding-box;

  min-height: 28px;
}
.chains::-webkit-scrollbar-thumb:hover {
  background-color: (0, 0, 0, 0.8);
}

.chain {
  padding: 20px;

  &.selected {
    background: rgba(#ffffff, 0.05);
  }
}

.chain-icon {
  width: 30px;
}

.wallets {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
  @include child-margin-v(16px);
}

.wallet-icon {
  width: 24px;
}

.chain-name {
  font-weight: 500;
  font-size: 12px;
  @include next-margin-v(8px);
}

.wallet {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 167px;
  height: 34px;
  padding: 0px 16px;
  @include child-margin-h(8px);
}

.wallet-name {
  font-size: 12px;
}

.connect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  padding: 0px 15px;
  border-radius: 4px;
  border: 1px solid #ffffff;
  @include child-margin-h(8px);
}
</style>

<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .content {
    width: 100vw;
    height: 100vh;
  }
  .chains {
    flex: 0.6;
  }
  .chain-name {
    margin-bottom: 15px;
  }
  .connect {
    padding: 10px 15px;
    height: 100%;
    border: 1px solid #616161;
  }
  .header-mobile {
    display: flex !important;
    justify-content: space-between;
    padding: 80px 20px 40px 20px;
    &-title {
      font-size: 16px;
    }
    &-close {
      width: 20px;
    }
    &-close::before {
      content: '';
      position: absolute;
      width: 60px;
      height: 60px;
      transform: translate(-20px, -20px);
    }
  }
}
</style>
