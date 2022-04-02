/* eslint-disable */
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import { WalletError } from '@/utils/errors';
import { WalletName } from '@/utils/enums';
import { formatEnum } from '@/utils/formatters';

const APIS = {
  [WalletName.MetaMask]: () => import('./metaMask'),
  [WalletName.CoinBase]: () => import('./coinBase'),
  [WalletName.Math]: () => import('./math'),
  [WalletName.NeoLine]: () => import('./neoline'),
  [WalletName.NeoLineN3]: () => import('./neolineN3'),
  [WalletName.O3]: () => import('./o3'),
  [WalletName.Binance]: () => import('./binance'),
  [WalletName.Cyano]: () => import('./cyano'),
  [WalletName.WalletConnect]: () => import('./walletConnect'),
  [WalletName.StarMask]: () => import('./starMask'),
};

export async function getWalletApi (walletName) {
  if (!APIS[walletName]) {
    throw new WalletError('Wallet is not supported', {
      code: WalletError.CODES.NOT_SUPPORTED,
    });
  }
  return (await APIS[walletName]()).default;
}

export async function tryToConvertAddressToHex (walletName, address) {
  if (!address) {
    return null;
  }
  const wallet = store.getters.getWallet(walletName);
  for (let i = 0; i < wallet.supportedChainIds.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const chainApi = await getChainApi(wallet.supportedChainIds[i]);
    if (chainApi.isValidAddress(address)) {
      return chainApi.addressToHex(address);
    }
  }
  throw new WalletError('Wallet network in not supported.', {
    code: WalletError.CODES.NOT_SUPPORTED_NETWORK,
    detail: {
      walletName: formatEnum(walletName, { type: 'walletName' }),
    },
  });
}
