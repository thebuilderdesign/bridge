import { Message } from 'element-ui';

import { BaseError } from './errors';

export function dispatchGlobalError(error) {
  if (error) {
    const event = new ErrorEvent('error', {
      error,
      message: error.message || 'global error event',
    });
    window.dispatchEvent(event);
  }
}

let lastLocalMessage = null;
let lastTime = 0;

function handleGlobalError(error) {
  if (error instanceof BaseError) {
    if (error.expose) {
      const localMessage = error.getLocalMessage();
      if (localMessage) {
        if (localMessage !== lastLocalMessage || Date.now() - lastTime > 1000) {
          Message({ message: localMessage, type: 'error', duration: 5000 });
          lastLocalMessage = localMessage;
          lastTime = Date.now();
        }
      }
      error.printTraceStack();
    }
    return;
  }
  console.error(error);
}

export default {
  install(Vue) {
    Vue.config.errorHandler = error => handleGlobalError(error);

    window.addEventListener('error', event => {
      event.preventDefault();
      handleGlobalError(event.error);
    });

    window.addEventListener('unhandledrejection', event => {
      event.preventDefault();
      handleGlobalError(event.reason);
    });
  },
};
