import delay from 'delay';
import _ from 'lodash';
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import { decimalToInteger, toStandardHex } from '@/utils/convertors';
import { WalletName, ChainId, SingleTransactionStatus } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';

const NEOLINE_CONNECTED_KEY = 'NEOLINE_CONNECTED';

const NETWORK_CHAIN_ID_MAPS = {
  [TARGET_MAINNET ? 'MainNet' : 'TestNet']: ChainId.Neo,
};

let neoDapi;

function convertWalletError(error) {
  if (error instanceof WalletError) {
    return error;
  }
  let code = '';
  switch (error.type) {
    case 'NO_PROVIDER':
      code = WalletError.CODES.NOT_INSTALLED;
      break;
    case 'CONNECTION_DENIED':
      code = WalletError.CODES.USER_REJECTED;
      break;
    case 'CONNECTION_REFUSED':
      code = WalletError.CODES.COMMUNICATE_FAILED;
      break;
    case 'RPC_ERROR':
      code = WalletError.CODES.COMMUNICATE_FAILED;
      break;
    case 'MALFORMED_INPUT':
      code = WalletError.CODES.MALFORMED_INPUT;
      break;
    case 'CANCELED':
      code = WalletError.CODES.USER_REJECTED;
      break;
    case 'INSUFFICIENT_FUNDS':
      code = WalletError.CODES.INSUFFICIENT_FUNDS;
      break;
    default:
      code = WalletError.CODES.UNKNOWN_ERROR;
  }
  return new WalletError(error.message || error.description, { code, cause: error });
}

async function queryState() {
  const address = (await neoDapi.getAccount()).address || null;
  const network = (await neoDapi.getNetworks()).defaultNetwork;
  const addressHex = await tryToConvertAddressToHex(WalletName.NeoLine, address);
  store.dispatch('updateWallet', {
    name: WalletName.NeoLine,
    address,
    addressHex,
    connected: !!address,
    chainId: NETWORK_CHAIN_ID_MAPS[network],
  });
}

async function init() {
  async function onReady() {
    try {
      window.removeEventListener('NEOLine.NEO.EVENT.READY', init);

      store.dispatch('updateWallet', { name: WalletName.NeoLine, installed: true });
      neoDapi = new window.NEOLine.Init();

      if (sessionStorage.getItem(NEOLINE_CONNECTED_KEY) === 'true') {
        await queryState();
      }

      neoDapi.addEventListener(neoDapi.EVENT.ACCOUNT_CHANGED, async data => {
        const address = data.address || null;
        const addressHex = await tryToConvertAddressToHex(WalletName.NeoLine, address);
        store.dispatch('updateWallet', {
          name: WalletName.NeoLine,
          address,
          addressHex,
          connected: !!address,
        });
      });

      neoDapi.addEventListener(neoDapi.EVENT.NETWORK_CHANGED, ({ defaultNetwork: network }) => {
        store.dispatch('updateWallet', {
          name: WalletName.NeoLine,
          chainId: NETWORK_CHAIN_ID_MAPS[network],
        });
      });
    } finally {
      store.getters.getWallet(WalletName.NeoLine).deferred.resolve();
    }
  }

  if (window.NEOLine) {
    await onReady();
  } else {
    window.addEventListener('NEOLine.NEO.EVENT.READY', onReady);
    await delay(2000);
    store.getters.getWallet(WalletName.NeoLine).deferred.resolve();
  }
}

async function connect() {
  try {
    await queryState();
    sessionStorage.setItem(NEOLINE_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getBalance({ chainId, address, tokenHash }) {
  try {
    const token = store.getters.getToken({ chainId, hash: tokenHash });

    const result = await neoDapi.getBalance({
      params: [
        {
          address,
          assets: ['NEO', 'GAS', token.hash],
        },
      ],
    });
    const balance = (
      (result[address] || []).find(item => toStandardHex(item.assetID) === token.hash) || {}
    ).amount;
    return balance == null ? '0' : balance;
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getAllowance() {
  return null;
}

async function getTransactionStatus({ transactionHash }) {
  try {
    let applicationLog = null;
    try {
      applicationLog = await neoDapi.getApplicationLog({ txid: transactionHash });
      // fix network error
      if (!applicationLog) {
        throw new WalletError('Communicate failed with wallet.', {
          code: WalletError.CODES.COMMUNICATE_FAILED,
        });
      }
    } catch (error) {
      // ignore rpc error
      if (error.type !== 'RPC_ERROR') {
        throw error;
      }
    }
    if (applicationLog) {
      const vmstate = _.get(applicationLog, 'executions[0].vmstate');
      const result = _.get(applicationLog, 'executions[0].stack[0].value');
      return vmstate === 'HALT' && result === '1'
        ? SingleTransactionStatus.Done
        : SingleTransactionStatus.Failed;
    }
    return SingleTransactionStatus.Pending;
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function approve() {
  throw new Error('Method not implemented');
}

async function lock({
  fromChainId,
  fromAddress,
  fromTokenHash,
  toChainId,
  toAddress,
  amount,
  fee,
}) {
  try {
    const chain = store.getters.getChain(fromChainId);
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({
      chainId: fromChainId,
      tokenHash: fromTokenHash,
    });

    const toChainApi = await getChainApi(toChainId);
    const toAddressHex = toChainApi.addressToHex(toAddress);
    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const feeInt = decimalToInteger(fee, tokenBasic.decimals);

    const params = {
      scriptHash: chain.lockContractHash,
      operation: 'lock',
      args: [
        { type: 'Hash160', value: fromTokenHash },
        { type: 'Address', value: fromAddress },
        { type: 'Integer', value: toChainId },
        { type: 'ByteArray', value: toAddressHex },
        { type: 'Integer', value: amountInt },
        { type: 'Integer', value: feeInt },
        { type: 'Integer', value: 0 },
      ],
    };
    const result = await neoDapi.invoke(params);
    return result.txid;
  } catch (error) {
    throw convertWalletError(error);
  }
}

export default {
  install: init,
  connect,
  getBalance,
  getAllowance,
  getTransactionStatus,
  approve,
  lock,
};
