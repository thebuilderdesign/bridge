/* eslint-disable */
import { client } from '@ont-dev/ontology-dapi';
import delay from 'delay';
import _ from 'lodash';
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import { decimalToInteger, toStandardHex } from '@/utils/convertors';
import { WalletName, ChainId, SingleTransactionStatus } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';
import BigNumber from 'bignumber.js';
import { utils } from 'ontology-ts-sdk';
import axios from 'axios';

client.registerClient({})

const CYANO_CONNECTED_KEY = 'CYANO_CONNECTED';

const NETWORK_CHAIN_ID_MAPS = {
  [TARGET_MAINNET ? 'MAIN' : 'TEST']: ChainId.Ont,
};

function convertWalletError (error) {  
  if (error instanceof WalletError) {
    return error;
  }
  let code = '';
  const type = error.type ? error.type : error
  switch (type) {
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

async function queryState () {
  const address = await client.api.asset.getAccount()
  const network = await client.api.network.getNetwork();
  const addressHex = await tryToConvertAddressToHex(WalletName.Cyano, address);
  store.dispatch('updateWallet', {
    name: WalletName.Cyano,
    address,
    addressHex,
    connected: !!address,
    chainId: NETWORK_CHAIN_ID_MAPS[network.type],
  });
}

async function init () {
  let cyanoProvider;
  async function onReady () {
    try {
      store.dispatch('updateWallet', { name: WalletName.Cyano, installed: true });
      if (sessionStorage.getItem(CYANO_CONNECTED_KEY) === 'true') {
        await queryState();
      }
    } finally {
      store.getters.getWallet(WalletName.Cyano).deferred.resolve();
    }
  }

  try{
    await client.api.provider.getProvider();
    onReady();
  } catch(e){
    try{
      await delay(2000);
      await client.api.provider.getProvider();
      onReady();
    } catch(e){}
  }
}

async function connect () {
  try {
    await queryState();
    sessionStorage.setItem(CYANO_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getBalance ({ chainId, address, tokenHash }) {
  try {
    const token = store.getters.getToken({ chainId, hash: tokenHash });
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    let result = ''
    if (token.name == 'ONG') {
      result = await getNativeBalance(address)
    } else {
      result = await smartContractBalance(token.hash, tokenBasic.decimals, chainId)
    }
    const balance = result
    return balance == null ? '0' : balance;
  } catch (error) {
    throw convertWalletError(error);
  }
}
async function getNativeBalance ($address) {
  let url = TARGET_MAINNET ? 'https://dappnode1.ont.io:10334/' : 'https://polaris1.ont.io:10334/'
  url = url + 'api/v1/balance/' + $address
  let res = await axios({ method: 'get', url: url })
  let obj = res.data.Result
  let balance = obj.ong
  balance = removeDecimals(balance, 9)
  return balance
}

async function smartContractBalance ($hash, $decimals, $chainId) {
  const wallet = store.getters.getChainConnectedWallet($chainId);
  let values = {}
  values.contract = $hash
  values.method = 'balanceOf'
  values.gasPrice = 2500
  values.gasLimit = 100000
  values.requireIdentity = false
  values.parameters = [
    { type: 'ByteArray', value: wallet.addressHex },
  ]
  const scriptHash = values.contract;
  const operation = values.method;
  const gasPrice = Number(values.gasPrice);
  const gasLimit = Number(values.gasLimit);
  const requireIdentity = false
  const parametersRaw = values.parameters;
  const args = parametersRaw.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
  try {
    const result = await client.api.smartContract.invokeRead({
      scriptHash,
      operation,
      args,
      gasPrice,
      gasLimit,
      requireIdentity
    });
    // tslint:disable-next-line:no-console
    let balance = hexNumber2Number(result, $decimals)
    return balance
    // return JSON.stringify(result)

  } catch (error) {
    throw convertWalletError(error);
  }
}

const convertValue = (value, type) => {
  switch (type) {
    case 'Boolean':
      return Boolean(value);
    case 'Integer':
      return Number(value);
    case 'Long':
      return Number(value);
    case 'ByteArray':
      return value;
    case 'String':
      return value;
  }
}

export const hexNumber2Number = (hexNumber, decimals) => {
  const str = utils.reverseHex(hexNumber);
  const num = new BigNumber(str, 16).toFixed()
  /* const numStr = str ? Long.fromString(str, true, 16).toString() : '0';
  const num = Number(numStr); */
  if (num === 0) {
    return 0;
  }
  return removeDecimals(num, decimals)
}

/* 去除精度 */
const removeDecimals = ($amount, $decimals) => {
  const num = new BigNumber(1).shiftedBy(Number($decimals)).toString();
  let x = new BigNumber($amount)
  let y = new BigNumber(num)
  let z = x.dividedBy(y).toString()
  return z
}

async function getAllowance () {
  return null;
}

async function getTransactionStatus ({ transactionHash }) {
  try {
    let url = TARGET_MAINNET ? 'https://dappnode1.ont.io:10334/' : 'https://polaris1.ont.io:10334/'
    url = url + 'api/v1/transaction/' + transactionHash + '?raw=0'
    let res = await axios({ method: 'get', url: url })
    return SingleTransactionStatus.Done
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function approve () {
  throw new Error('Method not implemented');
}

async function lock ({
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

    const scriptHash = chain.lockContractHash;
    const operation = 'lock';
    const gasPrice = Number(2500);
    const gasLimit = Number(100000);
    const requireIdentity = false
    const fromTokenHashReversed = utils.reverseHex(fromTokenHash)
    const toChainApi = await getChainApi(toChainId);
    const fromChainApi = await getChainApi(fromChainId);
    const fromAddressHex = fromChainApi.addressToHex(fromAddress);
    const toAddressHex = await toChainApi.addressToHex(toAddress);
    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const feeInt = decimalToInteger(fee, tokenBasic.decimals);
    const hexChainid = utils.num2VarInt(toChainId)
    let parameters = [
      { type: 'ByteArray', value: fromAddressHex },
      { type: 'ByteArray', value: fromTokenHashReversed },
      { type: 'ByteArray', value: hexChainid },
      { type: 'ByteArray', value: toAddressHex },
      { type: 'Long', value: amountInt },
      { type: 'Long', value: feeInt },
      { type: 'Integer', value: 0 },
    ]
    const parametersRaw = parameters;
    const args = parametersRaw.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    const params = {
      scriptHash,
      operation,
      args,
      gasPrice,
      gasLimit,
      requireIdentity
    };
    const result = await client.api.smartContract.invoke(params);
    return result.transaction;
  } catch (error) {
    throw convertWalletError(error);
  }
}

export default {
  install: init,
  connect,
  getBalance,
  getAllowance,
  getNativeBalance,
  getTransactionStatus,
  approve,
  lock,
};
