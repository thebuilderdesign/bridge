import { list, model, alias } from '@/utils/serializr';

export const token = model({
  hash: alias('Hash'),
  chainId: alias('ChainId'),
  name: alias('Name'),
  tokenBasicName: alias('TokenBasicName'),
  tokenBasic: alias(
    'TokenBasic',
    model({
      name: alias('Name'),
      decimals: alias('Precision'),
    }),
  ),
});
export const txFeeToken = model({
  hash: alias('Hash'),
  chainId: alias('ChainId'),
  name: alias('Name'),
  tokenBasicName: alias('TokenBasicName'),
  tokenBasic: alias(
    'TokenBasic',
    model({
      name: alias('Name'),
      decimals: alias('Precision'),
    }),
  ),
});

export const tokenBasic = model({
  name: alias('Name'),
  decimals: alias('Precision'),
  meta: alias('Meta'),
  tokens: alias(
    'Tokens',
    list(
      model({
        hash: alias('Hash'),
        chainId: alias('ChainId'),
        name: alias('Name'),
        tokenBasicName: alias('TokenBasicName'),
        decimals: alias('Precision'),
      }),
    ),
  ),
});

export const tokenMap = model({
  fromToken: alias('SrcToken', token),
  toToken: alias('DstToken', token),
});

export const transactionStep = model({
  hash: alias('Hash'),
  chainId: alias('ChainId'),
  blocks: alias('Blocks'),
  needBlocks: alias('NeedBlocks'),
});

export const FeeToken = model({
  chainId: alias('ChainId'),
  name: alias('Name'),
});

export const transaction = model({
  hash: alias('Hash'),
  fromChainId: alias('SrcChainId'),
  toChainId: alias('DstChainId'),
  fromAddress: alias('User'),
  toAddress: alias('DstUser'),
  token: alias('Token', token),
  amount: alias('TransferAmount'),
  fee: alias('FeeAmount'),
  nftFee: alias('FeeToken', FeeToken),
  txfeeToken: alias('FeeToken', txFeeToken),
  time: alias('Time'),
  status: alias('State'),
  tokenId: alias('TokenId'),
  steps: alias('TransactionState', list(transactionStep)),
});
