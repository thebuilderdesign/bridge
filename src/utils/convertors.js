import { Base64 } from 'js-base64';
import BigNumber from 'bignumber.js';
import Bn from 'bn.js';
import numberToBN from 'number-to-bn';

export function isValidHex(hex) {
  return typeof hex === 'string' && /^(0[xX])?([0-9A-Fa-f]{2})*((::[_0-9A-Za-z]+){2})?$/.test(hex);
}

export function toStandardHex(hex) {
  if (!isValidHex(hex)) {
    throw new Error('input param is not a valid hex string');
  }
  // Starcoin hex should not be changed
  return /^(0[xX])?([0-9A-Fa-f]{2})*((::[_0-9A-Za-z]+){2})$/.test(hex)
    ? hex
    : hex.replace(/0[xX]/, '').toLowerCase();
}

export function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex) {
  return Buffer.from(hex, 'hex');
}

export function reverseHex(hex) {
  return bytesToHex(hexToBytes(hex).reverse());
}

export function integerToHex(integer) {
  const bn = numberToBN(new BigNumber(integer));
  if (bn.isZero()) {
    return '';
  }
  const bytes = bn.toTwos(bn.byteLength() * 8).toArray();
  if (bn.isNeg()) {
    if (bytes[0] < 128) {
      bytes.unshift(255);
    }
  } else if (bytes[0] >= 128) {
    bytes.unshift(0);
  }
  return bytesToHex(bytes.reverse());
}

export function hexToInteger(hex) {
  const bytes = hexToBytes(hex).reverse();
  if (bytes.length === 0) {
    return '0';
  }
  const bn = new Bn(bytes).fromTwos(bytes.length * 8);
  return bn.toString();
}

export function stringToHex(string) {
  return Buffer.from(string).toString('hex');
}

export function hexToString(hex) {
  return Buffer.from(hex, 'hex').toString();
}

export function integerToDecimal(integer, unit) {
  if (new BigNumber(integer).isNaN()) {
    return null;
  }
  return new BigNumber(integer).shiftedBy(-unit).toFixed();
}

export function decimalToInteger(decimal, unit) {
  if (new BigNumber(decimal).isNaN()) {
    return null;
  }
  return new BigNumber(decimal)
    .shiftedBy(unit)
    .dp(0)
    .toFixed();
}

export function objectToBase64(object) {
  return Base64.encodeURI(JSON.stringify(object));
}

export function base64ToObject(base64, defaultValue) {
  try {
    return JSON.parse(Base64.decode(base64));
  } catch (error) {
    if (defaultValue === undefined) {
      throw error;
    }
    return defaultValue;
  }
}
