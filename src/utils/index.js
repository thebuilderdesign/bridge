import errorHandlder from './errorHandler';
import formatters from './formatters';
import validations from './validations';

export default {
  install(Vue) {
    Vue.use(errorHandlder);
    Vue.use(formatters);
    Vue.use(validations);
  },
};
