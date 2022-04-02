import { ValidationObserver, ValidationProvider, extend, localize } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import BigNumber from 'bignumber.js';
import i18n from '@/i18n';

extend('required', {
  ...required,
  message: () => i18n.t('validations.required'),
});

extend('number', {
  validate(value) {
    if (!new BigNumber(value).isNaN()) return true;
    return false;
  },
  message: () => i18n.t('validations.number'),
});

extend('positive', {
  validate(value) {
    if (new BigNumber(value).gt(0)) return true;
    return false;
  },
  message: () => i18n.t('validations.positive'),
});

extend('maxDecimals', {
  validate(value, { max, excluded }) {
    if (max == null) {
      return true;
    }
    if (excluded && new BigNumber(value).dp() < max) return true;
    if (!excluded && new BigNumber(value).dp() <= max) return true;
    return false;
  },
  params: ['max', 'excluded'],
  message: () => i18n.t('validations.maxDecimals'),
});

extend('maxValue', {
  validate(value, { max, excluded }) {
    if (max == null) {
      return true;
    }
    if (excluded && new BigNumber(value).lt(max)) return true;
    if (!excluded && new BigNumber(value).lte(max)) return true;
    return false;
  },
  params: ['max', 'excluded'],
  message: () => i18n.t('validations.maxValue'),
});

extend('minValue', {
  validate(value, { min, excluded }) {
    if (min == null) {
      return true;
    }
    if (excluded && new BigNumber(value).gt(min)) return true;
    if (!excluded && new BigNumber(value).gte(min)) return true;
    return false;
  },
  params: ['min', 'excluded'],
  message: () => i18n.t('validations.minValue'),
});

export default {
  install(Vue) {
    Vue.component('ValidationObserver', ValidationObserver);
    Vue.component('ValidationProvider', ValidationProvider);

    i18n.vm.$watch('locale', value => localize(value));
  },
};
