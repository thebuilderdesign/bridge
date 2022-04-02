import 'normalize.css'; // import before all other css
import ElementUi from 'element-ui';
import Vue from 'vue';
import VueBemCn from 'vue-bem-cn';
import VueMQ from 'vue-mq';

import './styles/rules/index.scss'; // import before custom components
import App from './App';
import components from './components';
import i18n from './i18n';
import router from './router';
import store from './store';
import utils from './utils';

// integrate third party and custom plugins
Vue.use(ElementUi, {
  size: 'medium',
  i18n: (key, value) => i18n.t(key, value),
});

Vue.use(VueMQ, {
  breakpoints: {
    mobile: 992,
    pc: Infinity,
  },
  defaultBreakpoint: 'mobile',
});

Vue.use(VueBemCn, { hyphenate: true });

Vue.use(components);

Vue.use(utils);

// create app vue instance
new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
