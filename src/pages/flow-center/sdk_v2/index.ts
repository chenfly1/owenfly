import { insertCSS } from './help';
import Widget from './widget';

declare let define: any;

((fn) => {
  // 插入 css
  insertCSS();
  try {
    if (typeof module === 'object' && module.exports) {
      module.exports = fn;
      module.exports.default = module.exports;
    }
    //  else if (define && typeof define === 'function' && define.amd) {
    //   define([], () => fn);
    // }
    else {
      let g: any = null;
      if (typeof window !== 'undefined') {
        g = window;
      } else if (typeof global !== 'undefined') {
        g = global;
      } else if (typeof self !== 'undefined') {
        g = self;
      } else {
        g = this as any;
      }
      g.WidgetForm = fn;
    }
  } catch (err) {
    console.log('widget_error', err);
  }
})(Widget);
