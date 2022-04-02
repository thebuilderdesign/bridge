import Vue from 'vue';
import getStoreKey from '@/utils/getStoreKey';
import { getWalletApi } from '@/utils/walletApi';

export default {
  state: {
    allowanceMap: {},
  },
  getters: {
    getAllowance: state => ({ chainId, address, tokenHash, spender }) =>
      state.allowanceMap[getStoreKey({ chainId, address, tokenHash, spender })],
  },
  mutations: {
    setAllowance(state, { params, value }) {
      Vue.set(state.allowanceMap, getStoreKey(params), value);
    },
  },
  actions: {
    async getAllowance({ getters, commit }, { chainId, address, tokenHash, spender }) {
      const wallet = getters.getChainConnectedWallet(chainId);
      let allowance = null;
      if (wallet) {
        const walletApi = await getWalletApi(wallet.name);
        console.log('getAllowance111', chainId);
        allowance = await walletApi.getAllowance({ chainId, address, tokenHash, spender });
      }
      const oldValue = getters.getAllowance({ chainId, address, tokenHash, spender });
      if (oldValue !== allowance) {
        commit('setAllowance', {
          params: { chainId, address, tokenHash, spender },
          value: allowance,
        });
      }
    },
  },
};
