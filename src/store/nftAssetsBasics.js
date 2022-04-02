import httpApi from '@/utils/httpApi';

export default {
  state: {
    assetsBasicMap: {},
    itemsShow: {},
    items: {},
    assetMap: {},
    nftFee: {},
  },
  getters: {
    getAssetsBasics: state => {
      return state.assetsBasicMap;
    },
    getItemsShow: state => {
      return state.itemsShow;
    },
    getItems: state => {
      return state.items;
    },
    getAssetMap: state => {
      return state.assetMap;
    },
    getNftFee: state => {
      return state.nftFee;
    },
  },
  mutations: {
    setAssetsBasics(state, value) {
      state.assetsBasicMap = value;
    },
    setItemsShow(state, value) {
      state.itemsShow = value;
    },
    setItems(state, value) {
      state.items = value;
    },
    setAssetMap(state, value) {
      state.assetMap = value;
    },
    setNftFee(state, value) {
      state.nftFee = value;
    },
  },
  actions: {
    async getAssetsBasics({ commit }, { id }) {
      const res = await httpApi.getAssets(id);
      commit('setAssetsBasics', res.data);
    },
    async getAssetMap({ commit }, params) {
      const res = await httpApi.getAssetMap(params);
      commit('setAssetMap', res.data);
    },
    async getItemsShow({ commit }, params) {
      const res = await httpApi.getItemsShow(params);
      commit('setItemsShow', res.data);
    },
    async getItems({ commit }, params) {
      const res = await httpApi.getitems(params);
      if (res.data.Items.length < 1) {
        res.data.TotalCount = 0;
      }
      commit('setItems', res.data);
    },
    async getNftFee({ commit }, params) {
      const res = await httpApi.getNftFee(params);
      commit('setNftFee', res.data);
    },
  },
};
