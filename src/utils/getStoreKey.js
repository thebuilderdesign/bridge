import _ from 'lodash';
import queryString from 'query-string';

export default function getStoreKey(params = {}) {
  return queryString.stringify(params.vary ? _.pick(params, params.vary) : params);
}
