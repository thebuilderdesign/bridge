import { isValidAddress as isValidSTCAddress } from '@starcoin/stc-util';
import { toStandardHex } from '@/utils/convertors';

function addressToHash(address) {
  return toStandardHex(address);
}

function addressToHex(address) {
  return addressToHash(address);
}

function isValidAddress(address) {
  return isValidSTCAddress(address);
}

export default {
  install() {},
  addressToHash,
  addressToHex,
  isValidAddress,
};
