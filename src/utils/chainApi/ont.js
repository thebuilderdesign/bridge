/* eslint-disable */
import { reverseHex } from '@/utils/convertors';
const Ont = require('ontology-ts-sdk')

function addressToHash (address) {
  return new Ont.Crypto.Address(address).serialize()
}

function addressToHex (address) {
  return addressToHash(address)
}

function isValidAddress (address) {
  if (address.substr(0, 1) !== "A") {
    return false
  }
  if (address.length !== 34) {
    return false
  }
  return true;
}

export default {
  install () { },
  addressToHash,
  addressToHex,
  isValidAddress
};