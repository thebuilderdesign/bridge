import Vue from 'vue';
import getStoreKey from '@/utils/getStoreKey';
import httpApi from '@/utils/httpApi';

export default {
  state: {
    feeMap: {},
    manualTxDataMap: {},
  },
  getters: {
    getFee: state => ({ fromChainId, fromTokenHash, toTokenHash, toChainId }) =>
      state.feeMap[getStoreKey({ fromChainId, fromTokenHash, toTokenHash, toChainId })],
    getManualTxData: state => ({ polyHash }) => state.manualTxDataMap[getStoreKey({ polyHash })],
  },
  mutations: {
    setFee(state, { params, value }) {
      Vue.set(state.feeMap, getStoreKey(params), value);
    },
    setManualTxData(state, { params, value }) {
      Vue.set(state.manualTxDataMap, getStoreKey(params), value);
    },
  },
  actions: {
    async getFee({ commit }, { fromChainId, fromTokenHash, toTokenHash, toChainId }) {
      const fee = await httpApi.getFee({ fromChainId, fromTokenHash, toTokenHash, toChainId });
      commit('setFee', {
        params: { fromChainId, fromTokenHash, toTokenHash, toChainId },
        value: fee,
      });
    },
    async getManualTxData({ commit }, polyHash) {
      const manualTxData = await httpApi.getManualTxData({ polyHash });
      commit('setManualTxData', { params: { polyHash }, value: manualTxData });
    },
  },
};
