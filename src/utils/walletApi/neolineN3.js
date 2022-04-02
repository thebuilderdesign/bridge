import delay from 'delay';
import _ from 'lodash';
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import { decimalToInteger, toStandardHex } from '@/utils/convertors';
import { WalletName, ChainId, SingleTransactionStatus } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';

const NEOLINEN3_CONNECTED_KEY = 'NEOLINEN3_CONNECTED';
const NEW_GAS = TARGET_MAINNET
  ? '0xd2a4cff31913016155e38e474a2c06d08be276cf'
  : '0xd2a4cff31913016155e38e474a2c06d08be276cf';

const NETWORK_CHAIN_ID_MAPS = {
  [TARGET_MAINNET ? 'N3MainNet' : 'N3TestNet']: ChainId.N3,
};

let neoDapi;
let n3Dapi;

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
  const addressHex = await tryToConvertAddressToHex(WalletName.NeoLineN3, address);
  store.dispatch('updateWallet', {
    name: WalletName.NeoLineN3,
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

      store.dispatch('updateWallet', { name: WalletName.NeoLineN3, installed: true });
      neoDapi = new window.NEOLine.Init();
      n3Dapi = new window.NEOLineN3.Init();

      if (sessionStorage.getItem(NEOLINEN3_CONNECTED_KEY) === 'true') {
        await queryState();
      }

      neoDapi.addEventListener(neoDapi.EVENT.ACCOUNT_CHANGED, async data => {
        const address = data.address || null;
        const addressHex = await tryToConvertAddressToHex(WalletName.NeoLineN3, address);
        store.dispatch('updateWallet', {
          name: WalletName.NeoLineN3,
          address,
          addressHex,
          connected: !!address,
        });
      });

      neoDapi.addEventListener(neoDapi.EVENT.NETWORK_CHANGED, ({ defaultNetwork: network }) => {
        store.dispatch('updateWallet', {
          name: WalletName.NeoLineN3,
          chainId: NETWORK_CHAIN_ID_MAPS[network],
        });
      });
    } finally {
      store.getters.getWallet(WalletName.NeoLineN3).deferred.resolve();
    }
  }

  if (window.NEOLine) {
    await onReady();
  } else {
    window.addEventListener('NEOLine.NEO.EVENT.READY', onReady);
    await delay(2000);
    store.getters.getWallet(WalletName.NeoLineN3).deferred.resolve();
  }
}

async function connect() {
  try {
    await queryState();
    sessionStorage.setItem(NEOLINEN3_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getBalance({ chainId, address, tokenHash }) {
  try {
    const token = store.getters.getToken({ chainId, hash: tokenHash });
    const result = await n3Dapi.getBalance();
    console.log(result);
    const balance = (
      (result[address] || []).find(item => toStandardHex(item.contract) === token.hash) || {}
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
      applicationLog = await n3Dapi.getApplicationLog({ txid: transactionHash });
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
      return vmstate === 'HALT' && result
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

function hex2base64(hex) {
  return Buffer.from(hex, 'hex').toString('base64');
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
    const fromChainApi = await getChainApi(fromChainId);
    const fromAddressHash = await fromChainApi.addressToHash(fromAddress);
    const toAddressHex = toChainApi.addressToHex(toAddress);
    const toAddressBase64 = hex2base64(toAddressHex);
    const fromToken = tokenBasic.tokens.find((item, index) => {
      return item.chainId === fromChainId;
    });
    const amountInt = decimalToInteger(amount, fromToken.decimals);
    const feeInt = decimalToInteger(fee, 8);
    const params = {
      scriptHash: chain.lockContractHash,
      operation: 'lock',
      args: [
        { type: 'Hash160', value: fromTokenHash },
        { type: 'Address', value: fromAddress },
        { type: 'Integer', value: toChainId },
        { type: 'ByteArray', value: toAddressBase64 },
        { type: 'Integer', value: amountInt },
        { type: 'Integer', value: feeInt },
        { type: 'Integer', value: 0 },
      ],
      broadcastOverride: false,
      signers: [
        {
          account: fromAddressHash,
          scopes: 17,
          allowedContracts: [`0x${fromTokenHash}`, NEW_GAS],
        },
      ],
    };
    console.log(params);
    const result = await n3Dapi.invoke(params);
    return result.txid.substr(2, 64);
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
