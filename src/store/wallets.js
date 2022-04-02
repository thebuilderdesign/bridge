import Deferred from 'promise-deferred';
import _ from 'lodash';
import Vue from 'vue';
import { WALLETS } from '@/utils/values';

export default {
  state: {
    walletMap: WALLETS.reduce(
      (pre, cur) => ({ ...pre, [cur.name]: { ...cur, deferred: new Deferred() } }),
      {},
    ),
  },
  getters: {
    wallets: state => Object.values(state.walletMap),
    getWallet: state => name => state.walletMap[name],
    getWalletsByChainId: (state, getters) => chainId =>
      getters.wallets.filter(wallet => wallet.supportedChainIds.includes(chainId)),
  },
  mutations: {
    setWallet(state, wallet) {
      Vue.set(state.walletMap, wallet.name, wallet);
    },
  },
  actions: {
    updateWallet({ getters, commit }, wallet) {
      const oldValue = getters.getWallet(wallet.name);
      const newValue = { ...oldValue, ...wallet };
      if (!_.isEqual(oldValue, newValue)) {
        commit('setWallet', newValue);
      }
    },
  },
};
