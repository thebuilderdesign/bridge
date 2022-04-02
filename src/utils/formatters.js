import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import format from 'string-template';
import i18n from '@/i18n';

dayjs.extend(advancedFormat);
dayjs.extend(utc);

export function formatEnum(value, { type, ingoreMissing = false } = {}) {
  if (!value && value !== 0) {
    return '';
  }
  if (i18n.te(`enums.${type}.${value}`)) {
    return i18n.t(`enums.${type}.${value}`);
  }
  if (!ingoreMissing) {
    console.warn(`Enum path not found: ${`enums.${type}.${value}`}`);
  }
  return value;
}

export function formatNumber(value, { decimals = null, symbol = null, toExp = false } = {}) {
  const bn = new BigNumber(value);
  if (bn.isNaN()) return '-';

  const options = {
    prefix: symbol != null ? `${symbol} ` : '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
  };

  let ret = null;
  if (toExp && !bn.eq(0)) {
    ret = bn.toExponential(decimals);
  } else if (decimals != null) {
    ret = bn.dp(decimals).toFormat(options);
  } else {
    ret = bn.toFormat(options);
  }
  return ret;
}

export function formatPercentage(value, { decimals = null, displaySign = false } = {}) {
  const bn = new BigNumber(value);
  if (bn.isNaN()) return '- %';

  const options = {
    suffix: ' %',
    decimalSeparator: '.',
  };
  let ret = null;
  if (decimals != null) {
    ret = bn
      .shiftedBy(2)
      .dp(decimals)
      .toFormat(options);
  } else {
    ret = bn.shiftedBy(2).toFormat(options);
  }

  if (displaySign && bn.isPositive()) {
    ret = `+${ret}`;
  }
  return ret;
}

export function formatTime(value) {
  if (!value) {
    return '';
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}

export function formatLongText(value, { headTailLength = 8 } = {}) {
  if (!value) {
    return '';
  }
  if (value.length <= headTailLength * 2 + 3) {
    return value;
  }
  return `${value.slice(0, headTailLength)}...${value.slice(-headTailLength)}`;
}

export default {
  install(Vue) {
    const prototype = {
      $format: format,
      $formatEnum: formatEnum,
      $formatNumber: formatNumber,
      $formatPercentage: formatPercentage,
      $formatTime: formatTime,
      $formatLongText: formatLongText,
    };
    Object.assign(Vue.prototype, prototype);
  },
};
