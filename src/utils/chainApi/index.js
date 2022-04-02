import { ChainError } from '@/utils/errors';
import { ChainId } from '@/utils/enums';

const APIS = {
  [ChainId.Eth]: () => import('./eth'),
  [ChainId.Neo]: () => import('./neo'),
  [ChainId.N3]: () => import('./n3'),
  [ChainId.Bsc]: () => import('./eth'),
  [ChainId.Heco]: () => import('./eth'),
  [ChainId.Ont]: () => import('./ont'),
  [ChainId.Ok]: () => import('./eth'),
  [ChainId.Palette]: () => import('./eth'),
  [ChainId.Polygon]: () => import('./eth'),
  [ChainId.Arbitrum]: () => import('./eth'),
  [ChainId.xDai]: () => import('./eth'),
  [ChainId.Optimistic]: () => import('./eth'),
  [ChainId.Boba]: () => import('./eth'),
  [ChainId.Fantom]: () => import('./eth'),
  [ChainId.Avalanche]: () => import('./eth'),
  [ChainId.Metis]: () => import('./eth'),
  [ChainId.Pixie]: () => import('./eth'),
  [ChainId.Rinkeby]: () => import('./eth'),
  [ChainId.Boba]: () => import('./eth'),
  [ChainId.Stc]: () => import('./stc'),
  [ChainId.Oasis]: () => import('./eth'),
};

export async function getChainApi(chainId) {
  if (!APIS[chainId]) {
    throw new ChainError('Chain is not supported', {
      code: ChainError.CODES.NOT_SUPPORTED,
    });
  }
  return (await APIS[chainId]()).default;
}
