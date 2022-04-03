<template>
  <CDrawer v-bind="$attrs" v-on="$listeners">
    <div class="content">
      <div class="title">{{ $t('home.connectWallet.title') }}</div>
      <CDivider />
      <div class="scroll">
        <div v-if="fromChain" class="from">
          <div class="chain">
            <img class="chain-icon" :src="fromChain.icon" />
            <span class="chain-name">
              {{
                $t('home.connectWallet.chainName', {
                  chainName: $formatEnum(fromChainId, { type: 'chainName' }),
                })
              }}
            </span>
          </div>
          <div class="wallets">
            <div v-for="wallet in fromChainWallets" :key="wallet.name">
              <div
                v-if="wallet.connected && wallet.name === fromChain.selectedWalletName"
                class="wallet"
              >
                <img class="wallet-icon" :src="wallet.icon" />
                <span class="wallet-name">
                  {{
                    $t('home.connectWallet.walletConnected', {
                      walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                    })
                  }}
                </span>
              </div>
              <CButton v-else class="connect" @click="connect(fromChain, wallet)">
                <span class="wallet-name">
                  {{
                    $t('home.connectWallet.connectWallet', {
                      walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                    })
                  }}
                </span>
                <img class="wallet-icon" :src="wallet.icon" />
              </CButton>
            </div>
          </div>
        </div>

        <div v-if="toChain" class="to">
          <div class="chain">
            <img class="chain-icon" :src="toChain.icon" />
            <span class="chain-name">
              {{
                $t('home.connectWallet.chainName', {
                  chainName: $formatEnum(toChainId, { type: 'chainName' }),
                })
              }}
            </span>
          </div>
          <div class="wallets">
            <div v-for="wallet in toChainWallets" :key="wallet.name">
              <div
                v-if="wallet.connected && wallet.name === toChain.selectedWalletName"
                class="wallet"
              >
                <img class="wallet-icon" :src="wallet.icon" />
                <span class="wallet-name">
                  {{
                    $t('home.connectWallet.walletConnected', {
                      walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                    })
                  }}
                </span>
              </div>
              <CButton v-else class="connect" @click="connect(toChain, wallet)">
                <span class="wallet-name">
                  {{
                    $t('home.connectWallet.connectWallet', {
                      walletName: $formatEnum(wallet.name, { type: 'walletName' }),
                    })
                  }}
                </span>
                <img class="wallet-icon" :src="wallet.icon" />
              </CButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CDrawer>
</template>

<script>
import { getWalletApi } from '@/utils/walletApi';

export default {
  name: 'ConnectWallet',
  props: {
    fromChainId: Number,
    toChainId: Number,
  },
  inheritAttrs: false,
  computed: {
    fromChain() {
      return this.$store.getters.getChain(this.fromChainId);
    },
    fromChainWallets() {
      return this.$store.getters.getWalletsByChainId(this.fromChainId);
    },
    fromWallet() {
      return this.$store.getters.getChainConnectedWallet(this.fromChainId);
    },
    toChain() {
      return this.$store.getters.getChain(this.toChainId);
    },
    toChainWallets() {
      return this.$store.getters.getWalletsByChainId(this.toChainId);
    },
    toWallet() {
      return this.$store.getters.getChainConnectedWallet(this.toChainId);
    },
  },
  methods: {
    async connect(chain, wallet) {
      if (wallet.installed) {
        if (!wallet.connected) {
          const walletApi = await getWalletApi(wallet.name);
          await walletApi.connect();
        }
        this.$store.dispatch('setChainSelectedWallet', {
          chainId: chain.id,
          walletName: wallet.name,
        });
        if (this.fromWallet && this.toWallet) {
          this.$emit('update:visible', false);
        }
      } else {
        window.open(wallet.downloadUrl);
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
  background: #7d5040;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
}

.title {
  padding: 80px 50px 20px;
  font-weight: 500;
}

.from,
.to {
  @include child-margin-v(20px);
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
  font-weight: 300;
  font-size: 12px;
}

.scroll {
  display: flex;
  justify-content: space-between;
  flex: 1;
  padding: 16px 50px;
  overflow-y: auto;
  @include scroll-bar(rgba(#fff, 0.2), transparent);
}

.wallets {
  display: flex;
  flex-direction: column;
  @include child-margin-v(16px);
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

.wallet-icon {
  width: 24px;
}

.wallet-name {
  font-size: 12px;
}

.connect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-width: 167px;
  height: 34px;
  padding: 0px 15px;
  border-radius: 4px;
  border: 1px solid #ffffff;
  @include child-margin-h(8px);
}
</style>
