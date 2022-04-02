import Vue from 'vue';
import getStoreKey from '@/utils/getStoreKey';
import httpApi from '@/utils/httpApi';

export default {
  state: {
    tokenMapsMap: {},
  },
  getters: {
    getTokenMaps: state => ({ fromChainId, fromTokenHash }) =>
      state.tokenMapsMap[getStoreKey({ fromChainId, fromTokenHash })],
  },
  mutations: {
    setTokenMaps(state, { params, value }) {
      Vue.set(state.tokenMapsMap, getStoreKey(params), value);
    },
  },
  actions: {
    async getTokenMaps({ commit }, { fromChainId, fromTokenHash }) {
      const tokenMaps = await httpApi.getTokenMaps({ fromChainId, fromTokenHash });
      commit('setTokenMaps', { params: { fromChainId, fromTokenHash }, value: tokenMaps });
    },
  },
};
