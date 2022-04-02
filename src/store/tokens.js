import getStoreKey from '@/utils/getStoreKey';
import { toStandardHex } from '@/utils/convertors';

export default {
  state: {
    tokenMap: {},
  },
  getters: {
    tokens: state => Object.values(state.tokenMap),
    getToken: state => ({ chainId, hash }) => state.tokenMap[getStoreKey({ chainId, hash })],
    getTokensByTokenBasicName: (state, getters) => tokenBasicName => {
      return getters.tokens.filter(token => token.tokenBasicName === tokenBasicName);
    },
    getTokenByTokenBasicNameAndChainId: (state, getters) => ({ tokenBasicName, chainId }) => {
      return getters
        .getTokensByTokenBasicName(tokenBasicName)
        .find(token => token.chainId === chainId);
    },
  },
  mutations: {
    setTokens(state, tokens) {
      state.tokenMap = tokens.reduce((pre, cur) => {
        const hash = toStandardHex(cur.hash);
        return {
          ...pre,
          [getStoreKey({ chainId: cur.chainId, hash })]: { ...cur, hash },
        };
      }, {});
    },
  },
};
