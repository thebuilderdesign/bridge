import Web3 from 'web3';
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import { toChecksumAddress } from '@starcoin/stc-util';
import { providers, utils, bcs, encoding, version as starcoinVersion } from '@starcoin/starcoin';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { integerToDecimal, decimalToInteger, toStandardHex } from '@/utils/convertors';
import { WalletName, ChainId, SingleTransactionStatus } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';

const STAR_MASK_CONNECTED_KEY = 'STAR_MASK_CONNECTED';
const NFT_FEE_TOKEN_HASH = '0x0000000000000000000000000000000000000000';
const PLT_NFT_FEE_TOKEN_HASH = '0x0000000000000000000000000000000000000103';

const NETWORK_CHAIN_ID_MAPS = {
  [TARGET_MAINNET ? 1 : 318]: ChainId.Stc,
  251: 318,
};

let web3;

function confirmLater(promise) {
  return new Promise((resolve, reject) => {
    promise.on('transactionHash', resolve);
    promise.on('error', reject);

    function onConfirm(confNumber, receipt) {
      promise.off('confirmation', onConfirm);
    }
    promise.on('confirmation', onConfirm);
  });
}

function convertWalletError(error) {
  if (error instanceof WalletError) {
    return error;
  }
  let code = WalletError.CODES.UNKNOWN_ERROR;
  if (error.code === 4001) {
    code = WalletError.CODES.USER_REJECTED;
  }
  if (error.toString().indexOf('32005') > -1) {
    return null;
  }
  if (error.toString().indexOf('32000') > -1) {
    return null;
  }
  return new WalletError(error.message, { code, cause: error });
}

async function queryState() {
  const accounts = await window.starcoin.request({ method: 'stc_accounts' });
  const address = accounts[0] || null;
  const addressHex = await tryToConvertAddressToHex(WalletName.StarMask, address);
  const checksumAddress = address && toChecksumAddress(address);
  const networkInfo = await window.starcoin.request({ method: 'chain.id' });
  const network = networkInfo?.id;
  store.dispatch('updateWallet', {
    name: WalletName.StarMask,
    address: checksumAddress,
    addressHex,
    connected: !!checksumAddress,
    chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
  });
}

async function init() {
  try {
    if (!window.starcoin) {
      return;
    }
    web3 = new Web3(window.starcoin);
    store.dispatch('updateWallet', { name: WalletName.StarMask, installed: true });

    if (sessionStorage.getItem(STAR_MASK_CONNECTED_KEY) === 'true') {
      await queryState();
    }

    window.starcoin.on('accountsChanged', async accounts => {
      const address = accounts[0] || null;
      const addressHex = await tryToConvertAddressToHex(WalletName.StarMask, address);
      const checksumAddress = address && toChecksumAddress(address);
      store.dispatch('updateWallet', {
        name: WalletName.StarMask,
        address: checksumAddress,
        addressHex,
        connected: !!checksumAddress,
      });
    });

    window.starcoin.on('chainChanged', network => {
      store.dispatch('updateWallet', {
        name: WalletName.StarMask,
        chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
      });
    });
  } finally {
    store.getters.getWallet(WalletName.StarMask).deferred.resolve();
  }
}

async function connect() {
  try {
    await window.starcoin.request({ method: 'stc_requestAccounts' });
    await queryState();
    sessionStorage.setItem(STAR_MASK_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getBalance({ chainId, address, tokenHash }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    const response = await window.starcoin.request({
      method: 'contract.get_resource',
      params: [address, `0x1::Account::Balance<${tokenHash}>`],
    });
    const result = response?.value[0][1].Struct.value[0][1].U128;

    return integerToDecimal(result, tokenBasic.decimals);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getAllowance({ chainId, address, tokenHash, spender }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    const result = await window.starcoin.request({
      method: 'contract.call_v2',
      params: [
        {
          function_id: '0x1::Token::market_cap',
          type_args: [tokenHash],
          args: [],
        },
      ],
    });
    return integerToDecimal(result, tokenBasic.decimals);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getTransactionStatus({ transactionHash }) {
  try {
    const transactionReceipt = await window.starcoin.request({
      method: 'chain.get_transaction_info',
      params: [`0x${transactionHash}`],
    });
    if (transactionReceipt) {
      return transactionReceipt?.status === 'Executed'
        ? SingleTransactionStatus.Done
        : SingleTransactionStatus.Failed;
    }
    return SingleTransactionStatus.Pending;
  } catch (error) {
    throw convertWalletError(error);
  }
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

    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const feeDecimals = fromChainId === 318 ? 9 : tokenBasic.decimals;
    const feeInt = decimalToInteger(fee, feeDecimals);
    const id = 1;

    const functionId = '0x18351d311d32201149a4df2a9fc2db8a::CrossChainScript::lock_with_stc_fee';
    const tyArgs = [];

    const fromTokenHashHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeStr(fromTokenHash);
      return hexlify(se.getBytes());
    })();

    const toChainIdHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeU64(toChainId);
      return hexlify(se.getBytes());
    })();

    const toAddressHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeBytes(arrayify(toAddress));
      return hexlify(se.getBytes());
    })();

    const amountHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeU128(amountInt);
      return hexlify(se.getBytes());
    })();

    const feeHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeU128(feeInt);
      return hexlify(se.getBytes());
    })();

    const idHex = (function() {
      const se = new bcs.BcsSerializer();
      se.serializeU128(id);
      return hexlify(se.getBytes());
    })();
    const args = [
      arrayify(fromTokenHashHex),
      arrayify(toChainIdHex),
      arrayify(toAddressHex),
      arrayify(amountHex),
      arrayify(feeHex),
      arrayify(idHex),
    ];
    const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args);

    const payloadInHex = (function() {
      const se = new bcs.BcsSerializer();
      scriptFunction.serialize(se);
      return hexlify(se.getBytes());
    })();

    const txParams = {
      data: payloadInHex,
    };

    const starcoinProvider = new providers.Web3Provider(window.starcoin, 'any');
    const transactionHex = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams);
    return transactionHex.slice(2);
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
  lock,
};
