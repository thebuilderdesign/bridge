import Vue from 'vue';
import getStoreKey from '@/utils/getStoreKey';
import httpApi from '@/utils/httpApi';

export default {
  state: {
    transactionsMap: {},
    transactionMap: {},
    nfttransactionsMap: {},
    nfttransactionMap: {},
  },
  getters: {
    getTransactions: state => ({ addressAndChainIds, page, pageSize, vary }) =>
      state.transactionsMap[getStoreKey({ addressAndChainIds, page, pageSize, vary })],
    getTransaction: state => hash => state.transactionMap[hash],
    getNftTransactions: state => ({ addressAndChainIds, page, pageSize, vary }) =>
      state.nfttransactionsMap[getStoreKey({ addressAndChainIds, page, pageSize, vary })],
    getNftTransaction: state => hash => state.nfttransactionMap[hash],
  },
  mutations: {
    setTransactions (state, { params, value }) {
      Vue.set(state.transactionsMap, getStoreKey(params), value);
    },
    setTransaction (state, { key, value }) {
      Vue.set(state.transactionMap, key, value);
    },
    setNftTransactions (state, { params, value }) {
      Vue.set(state.nfttransactionsMap, getStoreKey(params), value);
    },
    setNftTransaction (state, { key, value }) {
      Vue.set(state.nfttransactionMap, key, value);
    },
  },
  actions: {
    async getTransactions ({ commit }, { addressHexs, page, pageSize, vary }) {
      const result = await httpApi.getTransactions({ addressHexs, page, pageSize });
      commit('setTransactions', {
        params: { addressHexs, page, pageSize, vary },
        value: result,
      });
    },
    async getTransaction ({ commit }, hash) {
      const result = await httpApi.getTransaction({ hash });
      commit('setTransaction', { key: hash, value: result });
    },
    async getNftTransactions ({ commit }, { addressHexs, page, pageSize, vary }) {
      const result = await httpApi.getNftTransactions({ addressHexs, page, pageSize });
      commit('setNftTransactions', {
        params: { addressHexs, page, pageSize, vary },
        value: result,
      });
    },
    async getNftTransaction ({ commit }, hash) {
      const result = await httpApi.getNftTransaction({ hash });
      commit('setNftTransaction', { key: hash, value: result });
    },
  },
};
