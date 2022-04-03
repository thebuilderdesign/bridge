import WalletLink from 'walletlink';
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
import {
  WalletName,
  ChainId,
  SingleTransactionStatus,
  NetworkChainIdMaps,
  EthNetworkChainIdMaps,
} from '@/utils/enums';
import { WalletError } from '@/utils/errors';
import { TARGET_MAINNET } from '@/utils/env';
import { tryToConvertAddressToHex } from '.';

const APP_NAME = 'Gorgon Bridge';
const APP_LOGO_URL = src = "@/assets/png/logo_white.png";
const DEFAULT_ETH_JSONRPC_URL = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
const DEFAULT_CHAIN_ID = 1;
// Initialize WalletLink
export const walletLink = new WalletLink({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
  darkMode: false,
});
// Initialize a Web3 Provider object
export const ethereum = walletLink.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);

// Initialize a Web3 object
// export const web3 = new Web3(ethereum)

const COINBASE_CONNECTED_KEY = 'COINBASE_CONNECTED';
const NFT_FEE_TOKEN_HASH = '0x0000000000000000000000000000000000000000';
const PLT_NFT_FEE_TOKEN_HASH = '0x0000000000000000000000000000000000000103';

const NETWORK_CHAIN_ID_MAPS = NetworkChainIdMaps;

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
  if (error.toString().indexOf('32005') > -1) {
    return null;
  }
  if (error.toString().indexOf('32000') > -1) {
    return null;
  }
  return new WalletError(error.message, { code, cause: error });
}

async function queryState() {
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  console.log('get accounts from wallet', accounts);
  const address = accounts[0] || null;
  const addressHex = await tryToConvertAddressToHex(WalletName.CoinBase, address);
  const checksumAddress = address && web3.utils.toChecksumAddress(address);
  const network = await ethereum.request({ method: 'eth_chainId' });
  store.dispatch('updateWallet', {
    name: WalletName.CoinBase,
    address: checksumAddress,
    addressHex,
    connected: !!checksumAddress,
    chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
  });
}

async function init() {
  try {
    if (!ethereum) {
      return;
    }
    web3 = new Web3(ethereum);
    store.dispatch('updateWallet', { name: WalletName.CoinBase, installed: true });

    if (sessionStorage.getItem(COINBASE_CONNECTED_KEY) === 'true') {
      await queryState();
    }

    ethereum.on('accountsChanged', async accounts => {
      const address = accounts[0] || null;
      const addressHex = await tryToConvertAddressToHex(WalletName.CoinBase, address);
      const checksumAddress = address && web3.utils.toChecksumAddress(address);
      store.dispatch('updateWallet', {
        name: WalletName.CoinBase,
        address: checksumAddress,
        addressHex,
        connected: !!checksumAddress,
      });
    });

    ethereum.on('chainChanged', network => {
      store.dispatch('updateWallet', {
        name: WalletName.CoinBase,
        chainId: NETWORK_CHAIN_ID_MAPS[Number(network)],
      });
    });
  } finally {
    store.getters.getWallet(WalletName.CoinBase).deferred.resolve();
  }
}

async function connect() {
  try {
    console.log('get connect to wallet', ethereum);
    console.log('get connect to wallet', web3);
    // await ethereum.request({ method: 'eth_requestAccounts' });
    await ethereum.enable();
    await queryState();
    sessionStorage.setItem(COINBASE_CONNECTED_KEY, 'true');
  } catch (error) {
    throw convertWalletError(error);
  }
}

async function changeChain(waitChainId) {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: waitChainId }],
    });
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

async function getO3Balance({ chainId, address, tokenHash }) {
  try {
    const tokenBasic = store.getters.getTokenBasicByChainIdAndTokenHash({ chainId, tokenHash });
    if (tokenHash === '0000000000000000000000000000000000000000') {
      const result = await web3.eth.getBalance(address);
      return integerToDecimal(result, tokenBasic.decimals);
    }
    const tokenContract = new web3.eth.Contract(require('@/assets/json/o3.json'), tokenHash);
    const result = await tokenContract.methods.unlockedOf(address).call();
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
    console.log(integerToDecimal(result, tokenBasic.decimals));
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

async function getNFTApproved({ fromChainId, toChainId, tokenHash, id }) {
  try {
    const chain = store.getters.getChain(fromChainId);

    let nftContract = chain.nftLockContractHash;
    if (fromChainId === 2 && toChainId === 8) {
      nftContract = chain.pltNftLockContractHash;
    }
    const tokenID = decimalToInteger(id, 0);
    const tokenContract = new web3.eth.Contract(
      require('@/assets/json/eth-erc721.json'),
      tokenHash,
    );
    const result = await tokenContract.methods.getApproved(tokenID).call();
    return !(result === nftContract);
  } catch (error) {
    throw convertWalletError(error);
  }
}
async function sendSelfPayTx({ data, toAddress, toChainId }) {
  try {
    const txdata = data;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    const address = accounts[0] || null;
    const toEthChainID = ETH_NETWORK_CHAIN_ID_MAPS[toChainId];
    const transactionParameters = {
      nonce: '0x00', // ignored by CoinBase
      // gasPrice: `0x${reverseHex(integerToHex(1000000))}`, // customizable by user during CoinBase confirmation.
      // gas: `0x${reverseHex(integerToHex(400000))}`, // customizable by user during CoinBase confirmation.
      to: toAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: txdata, // Optional, but used for defining smart contract creation and interaction.
      chainId: `0x${reverseHex(integerToHex(toEthChainID))}`, // Used to prevent transaction reuse across blockchains. Auto-filled by CoinBase.
    };

    const txHash = await ethereum.request({
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
    const toChainApi = await getChainApi(toChainId);
    const toAddressHex = await toChainApi.addressToHex(toAddress);
    const amountInt = decimalToInteger(amount, tokenBasic.decimals);
    const feeInt = decimalToInteger(fee, chain.nftFeeName ? 18 : tokenBasic.decimals);
    const nativefeeInt =
      fromTokenHash === '0000000000000000000000000000000000000103'
        ? 0
        : decimalToInteger(fee, chain.nftFeeName ? 18 : tokenBasic.decimals);
    const result = await confirmLater(
      lockContract.methods
        .lock(`0x${fromTokenHash}`, toChainId, `0x${toAddressHex}`, amountInt, feeInt, 0)
        .send({
          from: fromAddress,
          value:
            fromTokenHash === '0000000000000000000000000000000000000000' ? amountInt : nativefeeInt,
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
    let nftContract = chain.nftLockContractHash;
    if (fromChainId === 2 && toChainId === 8) {
      nftContract = chain.pltNftLockContractHash;
    }
    const lockContract = new web3.eth.Contract(
      require('@/assets/json/eth-nft-lock.json'),
      nftContract,
    );
    const toChainApi = await getChainApi(toChainId);
    const toAddressHex = toChainApi.addressToHex(toAddress);
    const tokenID = decimalToInteger(id, 0);
    const feeInt = decimalToInteger(fee, 18);
    const feeTokenHash =
      fromChainId !== 107 && fromChainId !== 8 ? NFT_FEE_TOKEN_HASH : PLT_NFT_FEE_TOKEN_HASH;

    console.log(feeTokenHash);
    console.log(feeTokenHash === NFT_FEE_TOKEN_HASH ? feeInt : 0);
    const result = await confirmLater(
      lockContract.methods
        .lock(
          `0x${fromTokenHash}`,
          toChainId,
          `0x${toAddressHex}`,
          tokenID,
          feeTokenHash,
          feeInt,
          0,
        )
        .send({
          from: fromAddress,
          value: feeTokenHash === NFT_FEE_TOKEN_HASH ? feeInt : 0,
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
  getO3Balance,
  getAllowance,
  getTransactionStatus,
  approve,
  lock,
  nftLock,
  nftApprove,
  sendSelfPayTx,
  getTotalSupply,
  getNFTApproved,
  changeChain,
};
