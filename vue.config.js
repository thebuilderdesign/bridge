const WebpackCdnPlugin = require('webpack-cdn-plugin');

const IN_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  devServer: { https: false },
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  chainWebpack: config => {
    config.devtool(!IN_PRODUCTION ? 'source-map' : false);

    /* if (IN_PRODUCTION) {
      config.plugin('cdn').use(WebpackCdnPlugin, [
        {
          modules: [
            { name: 'vue', var: 'Vue', path: 'dist/vue.runtime.min.js' },
            { name: 'vue-router', var: 'VueRouter', path: 'dist/vue-router.min.js' },
            { name: 'vuex', var: 'Vuex', path: 'dist/vuex.min.js' },
            { name: 'element-ui', var: 'ELEMENT', path: 'lib/index.js' },
          ],
          prodUrl: '//cdn.jsdelivr.net/npm/:name@:version/:path',
          publicPath: process.env.VUE_APP_PUBLIC_PATH,
        },
      ]);
    } */
  },
  pluginOptions: {
    i18n: {
      locale: 'zh-CN',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import '@/styles/variables/index.scss';
          @import '@/styles/mixins/index.scss';
        `,
      },
    },
  },
  transpileDependencies: ['vue-echarts', 'resize-detector'],
};
