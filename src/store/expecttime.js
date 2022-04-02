import Vue from 'vue';
import getStoreKey from '@/utils/getStoreKey';
import httpApi from '@/utils/httpApi';

export default {
  state: {
    expectTimeMap: {},
  },
  getters: {
    getExpectTime: state => ({ fromChainId, toChainId }) =>
      state.expectTimeMap[getStoreKey({ fromChainId, toChainId })],
  },
  mutations: {
    setExpectTime(state, { params, value }) {
      Vue.set(state.expectTimeMap, getStoreKey(params), value);
    },
  },
  actions: {
    async getExpectTime({ commit }, { fromChainId, toChainId }) {
      const time = await httpApi.getExpectTime({ fromChainId, toChainId });
      commit('setExpectTime', { params: { fromChainId, toChainId }, value: time });
    },
  },
};
