import httpApi from '@/utils/httpApi';
import { TOKEN_BASIC_ICONS, UNKNOWN_ICON } from '@/utils/values';

export default {
  state: {
    tokenBasicMap: {},
  },
  getters: {
    tokenBasics: (state, getters) => {
      return Object.keys(state.tokenBasicMap).map(key => getters.getTokenBasic(key));
    },
    getTokenBasic: state => name => {
      const tokenBasic = state.tokenBasicMap[name];
      if (!tokenBasic) {
        return null;
      }
      const icon = TOKEN_BASIC_ICONS[name] ? TOKEN_BASIC_ICONS[name] : UNKNOWN_ICON;
      return {
        ...tokenBasic,
        meta: tokenBasic.meta ? tokenBasic.meta : icon,
        //  icon: TOKEN_BASIC_ICONS[name] ? TOKEN_BASIC_ICONS[name] : UNKNOWN_ICON,
      };
    },
    getTokenBasicByChainIdAndTokenHash: (state, getters) => ({ chainId, tokenHash }) => {
      const token = getters.getToken({ chainId, hash: tokenHash });
      return token && getters.getTokenBasic(token.tokenBasicName);
    },
  },
  mutations: {
    setTokenBasics(state, tokenBasics) {
      state.tokenBasicMap = tokenBasics.reduce((pre, cur) => {
        return { ...pre, [cur.name]: cur };
      }, {});
    },
  },
  actions: {
    async getTokenBasics({ commit }) {
      const { tokenBasics, tokens } = await httpApi.getTokenBasics();
      commit('setTokenBasics', tokenBasics);
      commit('setTokens', tokens);
    },
  },
};
