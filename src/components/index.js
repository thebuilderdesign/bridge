export default {
  install(Vue) {
    const requireComponent = require.context('.', true, /^(?!.*\/_).*\.vue$/);
    requireComponent.keys().forEach(fileName => {
      const componentName = fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '');
      const componentConfig = requireComponent(fileName);
      Vue.component(componentName, componentConfig.default || componentConfig);
    });
  },
};
