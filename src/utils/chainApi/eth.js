import { toStandardHex } from '@/utils/convertors';
import Web3 from 'web3';

const web3 = new Web3();

function addressToHash(address) {
  return toStandardHex(address);
}

function addressToHex(address) {
  return addressToHash(address);
}

function isValidAddress(address) {
  return web3.utils.isAddress(address);
}

export default {
  install() {},
  addressToHash,
  addressToHex,
  isValidAddress,
};
