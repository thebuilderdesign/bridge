import Vue from 'vue';
import {
  reverseHex,
  integerToHex,
  toStandardHex,
  objectToBase64,
  base64ToObject,
} from '@/utils/convertors';
import { ChainId, EthNetworkChainIdMaps } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { formatEnum } from '@/utils/formatters';
import { CHAINS } from '@/utils/values';
import { TARGET_MAINNET } from '@/utils/env';
import { getWalletApi } from '@/utils/walletApi';

const CHAIN_SELECTED_WALLETS_KEY = 'CHAIN_SELECTED_WALLETS';

const ETH_NETWORK_CHAIN_ID_MAPS = EthNetworkChainIdMaps;

export default {
  state: {
    chainMap: CHAINS.reduce((pre, cur) => {
      const lockContractHash = cur.lockContractHash && toStandardHex(cur.lockContractHash);
      return { ...pre, [cur.id]: { ...cur, lockContractHash } };
    }, {}),
    chainSelectedWalletMap: {},
  },
  getters: {
    chains: (state, getters) => {
      return Object.keys(state.chainMap).map(key => getters.getChain(key));
    },
    getChain: state => id => {
      const chain = state.chainMap[id];
      if (!chain) {
        return null;
      }
      return { ...chain, selectedWalletName: state.chainSelectedWalletMap[id] };
    },
    getChainConnectedWallet: (state, getters) => id => {
      const wallet = getters.getWallet(state.chainSelectedWalletMap[id]);
      return wallet && wallet.connected ? wallet : null;
    },
  },
  mutations: {
    setChainSelectedWallet(state, { chainId, walletName }) {
      Vue.set(state.chainSelectedWalletMap, chainId, walletName);
    },
    setChainSelectedWalletMap(state, map) {
      state.chainSelectedWalletMap = map;
    },
  },
  actions: {
    loadChainSelectedWallets({ commit }) {
      const data = base64ToObject(sessionStorage.getItem(CHAIN_SELECTED_WALLETS_KEY), null);
      if (data) {
        commit('setChainSelectedWalletMap', data);
      }
    },
    saveChainSelectedWallets({ state }) {
      const data = objectToBase64(state.chainSelectedWalletMap);
      sessionStorage.setItem(CHAIN_SELECTED_WALLETS_KEY, data);
    },
    setChainSelectedWallet({ commit, dispatch }, { chainId, walletName }) {
      commit('setChainSelectedWallet', { chainId, walletName });
      dispatch('saveChainSelectedWallets');
    },
    async ensureChainWalletReady({ getters }, chainId) {
      const wallet = getters.getChainConnectedWallet(chainId);
      const walletApi = await getWalletApi(wallet.name);
      if (!wallet) {
        throw new WalletError('Wallet is not connected.', {
          code: WalletError.CODES.NOT_CONNECTED,
          detail: {
            chainName: formatEnum(chainId, { type: 'chainName' }),
          },
        });
      }
      if (wallet.chainId !== chainId) {
        const fromChainId = ETH_NETWORK_CHAIN_ID_MAPS[chainId];
        const waitChainId = `0x${fromChainId.toString(16)}`;
        try {
          /* window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: waitChainId }],
          }); */
          walletApi.changeChain(waitChainId);
        } catch (switchError) {
          console.log(switchError);
        }
        throw new WalletError('Wallet is not in correct network.', {
          code: WalletError.CODES.INCORRECT_NETWORK,
          detail: {
            walletName: formatEnum(wallet.name, { type: 'walletName' }),
            chainNetworkName: formatEnum(chainId, { type: 'chainNetworkName' }),
          },
        });
      }
    },
  },
};
