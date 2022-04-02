import axios from 'axios';
import _ from 'lodash';
import { HttpError } from './errors';
import { mapTransactionToDo } from './mappers';
import { HTTP_BASE_URL, HTTP_NFT_BASE_URL } from './values';
import * as schemas from './schemas';
import { deserialize, list } from './serializr';

const request = axios.create({
  baseURL: HTTP_BASE_URL,
  headers: { 'content-type': 'application/json' },
});

const nftRequest = axios.create({
  baseURL: HTTP_NFT_BASE_URL,
  headers: { 'content-type': 'application/json' },
});

request.interceptors.response.use(
  response => {
    return response.data;
  },
  async error => {
    const { response } = error;
    let newError = error;
    if (response) {
      let code = HttpError.CODES.UNKNOWN_ERROR;
      if (response.status === 400) {
        code = HttpError.CODES.BAD_REQUEST;
      } else if (response.status === 500) {
        code = HttpError.CODES.INTERNAL_SERVICE_ERROR;
      }
      newError = new HttpError(response.data.message, { cause: error, code });
    } else {
      newError = new HttpError(error.message || 'Network Error', {
        cause: error,
        code: HttpError.CODES.NETWORK_ERROR,
      });
    }
    throw newError;
  },
);

export default {
  async getTokenBasics() {
    const result = await request({ method: 'post', url: '/tokenbasics', data: {} });
    const tokenBasics = deserialize(list(schemas.tokenBasic), result.TokenBasics || []);
    const tokens = _.flatMap(tokenBasics, tokenBasic => tokenBasic.tokens || []);
    return { tokenBasics, tokens };
  },
  async getTokenMaps({ fromChainId, fromTokenHash }) {
    const result = await request({
      method: 'post',
      url: '/tokenmap',
      data: {
        ChainId: fromChainId,
        Hash: fromTokenHash,
      },
    });
    const tokenMaps = deserialize(list(schemas.tokenMap), result.TokenMaps);
    return tokenMaps;
  },
  async getFee({ fromChainId, fromTokenHash, toTokenHash, toChainId }) {
    const result = await request({
      method: 'post',
      url: '/getfee',
      data: {
        SrcChainId: fromChainId,
        SwapTokenHash: toTokenHash,
        Hash: fromTokenHash,
        DstChainId: toChainId,
      },
    });
    return result;
  },
  async getManualTxData({ polyHash }) {
    const result = await request({
      method: 'post',
      url: '/getmanualtxdata',
      data: {
        polyhash: polyHash,
      },
    });
    return result;
  },
  async getExpectTime({ fromChainId, toChainId }) {
    const result = await request({
      method: 'post',
      url: '/expecttime',
      data: {
        SrcChainId: fromChainId,
        DstChainId: toChainId,
      },
    });
    return result;
  },
  async getTransactions({ addressHexs, page, pageSize }) {
    const result = await request({
      method: 'post',
      url: 'transactionsofaddress',
      data: {
        Addresses: addressHexs,
        PageNo: page - 1,
        PageSize: pageSize,
      },
    });
    const transactions = deserialize(list(schemas.transaction), result.Transactions || []);
    return {
      items: transactions.map(mapTransactionToDo),
      pageCount: result.TotalPage,
    };
  },
  async getTransaction({ hash }) {
    const result = await request({
      method: 'post',
      url: 'transactionofhash',
      data: {
        Hash: hash,
      },
    });
    const transaction = deserialize(schemas.transaction, result);
    return mapTransactionToDo(transaction);
  },
  async getAssets(id) {
    const result = await nftRequest({
      method: 'post',
      url: '/assets',
      data: {
        ChainId: id,
      },
    });
    return result;
  },
  async getAssetMap(params) {
    const result = await nftRequest({
      method: 'post',
      url: '/asset',
      data: {
        ChainId: params.ChainId,
        Hash: params.Hash,
      },
    });
    return result;
  },
  async getitems(params) {
    try {
      const result = await nftRequest({
        method: 'post',
        url: '/items',
        data: {
          ChainId: params.ChainId,
          Asset: params.Asset,
          Address: params.Address,
          TokenId: params.TokenId,
          PageNo: params.PageNo,
          PageSize: params.PageSize,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      const res = {
        data: {
          Items: [],
          PageNo: 0,
          PageSize: 6,
          TotalCount: 0,
          TotalPage: 0,
        },
      };
      return res;
    }
  },
  async getItemsShow(params) {
    const result = await nftRequest({
      method: 'post',
      url: '/assetshow',
      data: {
        ChainId: params.ChainId,
        PageSize: params.PageSize,
        PageNo: params.PageNo,
      },
    });
    return result;
  },
  async getNftFee(params) {
    const result = await nftRequest({
      method: 'post',
      url: '/getfee',
      data: {
        SrcChainId: params.SrcChainId,
        Hash: params.Hash,
        DstChainId: params.DstChainId,
      },
    });
    return result;
  },
  async getNftTransactions({ addressHexs, page, pageSize }) {
    const result = await nftRequest({
      method: 'post',
      url: 'transactionsofaddress',
      data: {
        Addresses: addressHexs,
        PageNo: page - 1,
        PageSize: pageSize,
        State: -1,
      },
    });
    const transactions = deserialize(list(schemas.transaction), result.data.Transactions || []);
    return {
      items: transactions.map(mapTransactionToDo),
      pageCount: result.data.TotalPage,
    };
  },
  async getNftTransaction({ hash }) {
    const result = await nftRequest({
      method: 'post',
      url: 'transactionofhash',
      data: {
        Hash: hash,
      },
    });
    const transaction = deserialize(schemas.transaction, result.data);
    return mapTransactionToDo(transaction);
  },
};
