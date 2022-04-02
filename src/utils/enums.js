import { TARGET_MAINNET } from '@/utils/env';

export const WalletName = {
  MetaMask: 'MetaMask',
  CoinBase: 'CoinBase',
  Math: 'Math Wallet',
  NeoLine: 'NeoLine',
  NeoLineN3: 'NeoLineN3',
  O3: 'O3',
  Binance: 'Binance',
  Cyano: 'Cyano',
  WalletConnect: 'WalletConnnect',
  StarMask: 'StarMask',
};

export const ChainId = {
  Poly: 0,
  Eth: 2,
  Ont: 3,
  Neo: TARGET_MAINNET ? 4 : 5,
  N3: TARGET_MAINNET ? 14 : 88,
  xDai: TARGET_MAINNET ? 20 : 206,
  Bsc: TARGET_MAINNET ? 6 : 79,
  Heco: 7,
  Ok: TARGET_MAINNET ? 12 : 200,
  Palette: TARGET_MAINNET ? 8 : 107,
  Polygon: TARGET_MAINNET ? 17 : 202,
  Arbitrum: TARGET_MAINNET ? 19 : 205,
  Optimistic: TARGET_MAINNET ? 23 : 210,
  Boba: TARGET_MAINNET ? 25 : 400,
  Oasis: TARGET_MAINNET ? 26 : 500,
  Fantom: TARGET_MAINNET ? 22 : 208,
  Avalanche: TARGET_MAINNET ? 21 : 209,
  Metis: TARGET_MAINNET ? 24 : 300,
  Pixie: TARGET_MAINNET ? 316 : 316,
  Rinkeby: TARGET_MAINNET ? 402 : 402,
  Stc: TARGET_MAINNET ? 1 : 318,
};

export const NetworkChainIdMaps = {
  [TARGET_MAINNET ? 1 : 3]: ChainId.Eth,
  [TARGET_MAINNET ? 56 : 97]: ChainId.Bsc,
  [TARGET_MAINNET ? 128 : 256]: ChainId.Heco,
  [TARGET_MAINNET ? 66 : 65]: ChainId.Ok,
  [TARGET_MAINNET ? 100 : 77]: ChainId.xDai,
  [TARGET_MAINNET ? 137 : 80001]: ChainId.Polygon,
  [TARGET_MAINNET ? 1718 : 101]: ChainId.Palette,
  [TARGET_MAINNET ? 42161 : 421611]: ChainId.Arbitrum,
  [TARGET_MAINNET ? 10 : 69]: ChainId.Optimistic,
  [TARGET_MAINNET ? 250 : 4002]: ChainId.Fantom,
  [TARGET_MAINNET ? 43114 : 43113]: ChainId.Avalanche,
  [TARGET_MAINNET ? 1088 : 588]: ChainId.Metis,
  [TARGET_MAINNET ? 6626 : 666]: ChainId.Pixie,
  [TARGET_MAINNET ? 4 : 4]: ChainId.Rinkeby,
  [TARGET_MAINNET ? 288 : 28]: ChainId.Boba,
  [TARGET_MAINNET ? 42262 : 42261]: ChainId.Oasis,
};

export const EthNetworkChainIdMaps = {
  [ChainId.Eth]: TARGET_MAINNET ? 1 : 3,
  [ChainId.Bsc]: TARGET_MAINNET ? 56 : 97,
  [ChainId.Heco]: TARGET_MAINNET ? 128 : 256,
  [ChainId.Ok]: TARGET_MAINNET ? 66 : 65,
  [ChainId.xDai]: TARGET_MAINNET ? 100 : 77,
  [ChainId.Polygon]: TARGET_MAINNET ? 137 : 80001,
  [ChainId.Palette]: TARGET_MAINNET ? 1718 : 101,
  [ChainId.Arbitrum]: TARGET_MAINNET ? 42161 : 421611,
  [ChainId.Optimistic]: TARGET_MAINNET ? 10 : 69,
  [ChainId.Fantom]: TARGET_MAINNET ? 250 : 4002,
  [ChainId.Avalanche]: TARGET_MAINNET ? 43114 : 43113,
  [ChainId.Metis]: TARGET_MAINNET ? 1088 : 588,
  [ChainId.Pixie]: TARGET_MAINNET ? 6626 : 666,
  [ChainId.Rinkeby]: TARGET_MAINNET ? 4 : 4,
  [ChainId.Boba]: TARGET_MAINNET ? 288 : 28,
  [ChainId.Oasis]: TARGET_MAINNET ? 42262 : 42261,
};

export const SingleTransactionStatus = {
  Failed: -1,
  Pending: 1,
  Done: 2,
};

export const TransactionStatus = {
  Failed: -1,
  Finished: 0,
  Pending: 1,
  SourceDone: 2,
  SourceConfirmed: 3,
  PolyConfirmed: 4,
};
