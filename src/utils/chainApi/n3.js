import { reverseHex } from '@/utils/convertors';

let neolineN3;

async function addressToHash(inputaddress) {
  neolineN3 = new window.NEOLineN3.Init();
  const ob = {
    address: inputaddress,
  };
  const { scriptHash } = await neolineN3.AddressToScriptHash(ob);
  console.log(scriptHash);
  return scriptHash;
}

async function addressToHex(address) {
  const hex = reverseHex(await addressToHash(address));
  console.log(hex);
  return hex;
}

function isValidAddress(address) {
  return true;
}

export default {
  install() {},
  addressToHash,
  addressToHex,
  isValidAddress,
};
