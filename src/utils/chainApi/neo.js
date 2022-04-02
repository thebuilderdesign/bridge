import Neon, { wallet as NeonWallet } from '@cityofzion/neon-js';
import { reverseHex } from '@/utils/convertors';

function addressToHash(address) {
  return NeonWallet.getScriptHashFromAddress(address);
}

function addressToHex(address) {
  return reverseHex(addressToHash(address));
}

function isValidAddress(address) {
  return Neon.is.address(address);
}

export default {
  install() {},
  addressToHash,
  addressToHex,
  isValidAddress,
};
