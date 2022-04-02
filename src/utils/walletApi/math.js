import Web3 from 'web3';
import store from '@/store';
import { getChainApi } from '@/utils/chainApi';
import {
  integerToDecimal,
  decimalToInteger,
  toStandardHex,
  integerToHex,
  reverseHex,
} from '@/utils/convertors';
import { WalletName, ChainId, SingleTransactionStatus, EthNetworkChainIdMaps } from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';

const MATH_CONNECTED_KEY = 'MATH_CONNECTED';
const NFT_FEE_TOKEN_HASH = '0x0000000000000000000000000000000000000000';

const NETWORK_CHAIN_ID_MAPS = {
  [TARGET_MAINNET ? 1 : 3]: ChainId.Eth,
  [TARGET_MAINNET ? 56 : 97]: ChainId.Bsc,
  [TARGET_MAINNET ? 128 : 256]: ChainId.Heco,
  [TARGET_MAINNET ? 66 : 65]: ChainId.Ok,
};

const ETH_NETWORK_CHAIN_ID_MAPS = EthNetworkChainIdMaps;

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
  return new WalletError(error.message, { code, cause: error });
}

async function queryState() {
  console.log(web3.currentProvider);
  const accounts = await web3.currentProvider.request({ method: 'eth_accounts' });
  const address = accounts[0] || null;
  const addressHex = await tryToConvertAddressToHex(WalletName.Math, address);
  const checksumAddress = address && web3.utils.toChecksumAddress(address);
  const network = await web3.currentProvider.request({ method: 'eth_chainId' });
  store.dispatch('updateWallet', {
    name: WalletName.Math,
    address: checksumAddress,
    addressHex,
    connected: !!checksumAddress,
    chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
  });
}
const sleep = time =>
  new Promise(res => {
    setTimeout(() => {
      res(null);
    }, time);
  });
async function init() {
  await sleep(2000);
  try {
    web3 = new Web3(window.web3.currentProvider);
    store.dispatch('updateWallet', { name: WalletName.Math, installed: true });

    if (sessionStorage.getItem(MATH_CONNECTED_KEY) === 'true') {
      await queryState();
    }
    web3.currentProvider.on('accountsChanged', async accounts => {
      if (sessionStorage.getItem(MATH_CONNECTED_KEY) !== 'true') {
        return;
      }
      const address = accounts[0] || null;
      const addressHex = await tryToConvertAddressToHex(WalletName.Math, address);
      const checksumAddress = address && web3.utils.toChecksumAddress(address);
      store.dispatch('updateWallet', {
        name: WalletName.Math,
        address: checksumAddress,
        addressHex,
        connected: !!checksumAddress,
      });
    });

    web3.currentProvider.on('chainChanged', network => {
      store.dispatch('updateWallet', {
        name: WalletName.Math,
        chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
      });
    });
  } finally {
    store.getters.getWallet(WalletName.Math).deferred.resolve();
  }
}

async function connect() {
  try {
    await web3.currentProvider.request({ method: 'eth_requestAccounts' });
    await queryState();
    sessionStorage.setItem(MATH_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getBalance({ chainId, address, tokenHash }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    if (tokenHash === '0000000000000000000000000000000000000000') {
      const result = await web3.eth.getBalance(address);
      return integerToDecimal(result, tokenBasic.decimals);
    }
    const tokenContract = new web3.eth.Contract(require('@/assets/json/eth-erc20.json'), tokenHash);
    const result = await tokenContract.methods.balanceOf(address).call();
    return integerToDecimal(result, tokenBasic.decimals);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getAllowance({ chainId, address, tokenHash, spender }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    if (tokenHash === '0000000000000000000000000000000000000000') {
      return null;
    }
    const tokenContract = new web3.eth.Contract(require('@/assets/json/eth-erc20.json'), tokenHash);
    const result = await tokenContract.methods.allowance(address, `0x${spender}`).call();
    return integerToDecimal(result, tokenBasic.decimals);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getTotalSupply({ chainId, tokenHash }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    if (tokenHash === '0000000000000000000000000000000000000000') {
      return null;
    }
    const tokenContract = new web3.eth.Contract(require('@/assets/json/eth-erc20.json'), tokenHash);
    const result = await tokenContract.methods.totalSupply().call();
    return integerToDecimal(result, tokenBasic.decimals);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getTransactionStatus({ transactionHash }) {
  try {
    const transactionReceipt = await web3.eth.getTransactionReceipt(`0x${transactionHash}`);
    if (transactionReceipt) {
      return transactionReceipt.status
        ? SingleTransactionStatus.Done
        : SingleTransactionStatus.Failed;
    }
    return SingleTransactionStatus.Pending;
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function approve({ chainId, address, tokenHash, spender, amount }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const tokenContract = new web3.eth.Contract(require('@/assets/json/eth-erc20.json'), tokenHash);
    return await tokenContract.methods.approve(`0x${spender}`, amountInt).send({
      from: address,
    });
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function nftApprove({ address, tokenHash, spender, id }) {
  try {
    const tokenID = decimalToInteger(id, 0);
    const tokenContract = new web3.eth.Contract(
      require('@/assets/json/eth-erc721.json'),
      tokenHash,
    );
    return await tokenContract.methods.approve(spender, tokenID).send({
      from: address,
    });
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function getNFTApproved({ fromChainId, tokenHash, id }) {
  try {
    const chain = store.getters.getChain(fromChainId);
    const tokenID = decimalToInteger(id, 0);
    const tokenContract = new web3.eth.Contract(
      require('@/assets/json/eth-erc721.json'),
      tokenHash,
    );
    const result = await tokenContract.methods.getApproved(tokenID).call();
    return !(result === chain.nftLockContractHash);
  } catch (error) {
    throw convertWalletError(error);
  }
}
async function sendSelfPayTx({ data, toAddress, toChainId }) {
  try {
    const txdata = data;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const address = accounts[0] || null;
    const toEthChainID = ETH_NETWORK_CHAIN_ID_MAPS[toChainId];
    const transactionParameters = {
      nonce: '0x00', // ignored by MetaMask
      // gasPrice: `0x${reverseHex(integerToHex(1000000))}`, // customizable by user during MetaMask confirmation.
      // gas: `0x${reverseHex(integerToHex(400000))}`, // customizable by user during MetaMask confirmation.
      to: toAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: txdata, // Optional, but used for defining smart contract creation and interaction.
      chainId: `0x${reverseHex(integerToHex(toEthChainID))}`, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    return txHash;
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

    const lockContract = new web3.eth.Contract(
      require('@/assets/json/eth-lock.json'),
      chain.lockContractHash,
    );
    console.log(chain);
    const toChainApi = await getChainApi(toChainId);
    const toAddressHex = toChainApi.addressToHex(toAddress);
    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const feeInt = decimalToInteger(fee, chain.nftFeeName ? 18 : tokenBasic.decimals);
    console.log(toAddressHex);
    console.log(amountInt);
    console.log(feeInt);
    console.log(fromTokenHash);

    const result = await confirmLater(
      lockContract.methods
        .lock(`0x${fromTokenHash}`, toChainId, `0x${toAddressHex}`, amountInt, feeInt, 0)
        .send({
          from: fromAddress,
          value: fromTokenHash === '0000000000000000000000000000000000000000' ? amountInt : feeInt,
        }),
    );
    return toStandardHex(result);
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function nftLock({ fromChainId, fromAddress, fromTokenHash, toChainId, toAddress, id, fee }) {
  try {
    const chain = store.getters.getChain(fromChainId);

    const lockContract = new web3.eth.Contract(
      require('@/assets/json/eth-nft-lock.json'),
      chain.nftLockContractHash,
    );
    const toChainApi = await getChainApi(toChainId);
    const toAddressHex = toChainApi.addressToHex(toAddress);
    const tokenID = decimalToInteger(id, 0);
    const feeInt = decimalToInteger(fee, 18);

    const result = await confirmLater(
      lockContract.methods
        .lock(
          `0x${fromTokenHash}`,
          toChainId,
          `0x${toAddressHex}`,
          tokenID,
          NFT_FEE_TOKEN_HASH,
          feeInt,
          0,
        )
        .send({
          from: fromAddress,
          value: feeInt,
        }),
    );
    return toStandardHex(result);
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
  nftLock,
  nftApprove,
  getTotalSupply,
  getNFTApproved,
  sendSelfPayTx,
};
