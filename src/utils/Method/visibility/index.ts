/**
 * 页面可见性监听方法
 * - 可见性状态
 * - 添加可见性变化监听事件
 * - 移除可见性变化监听事件
 */
let hidden = '',
  visibilityChange = '',
  support = true;
if (typeof document.hidden !== 'undefined') {
  // Opera 12.10 and Firefox 18 and later support
  hidden = 'hidden';
  visibilityChange = 'visibilitychange';
} else if (typeof (document as any).msHidden !== 'undefined') {
  hidden = 'msHidden';
  visibilityChange = 'msvisibilitychange';
} else if (typeof (document as any).webkitHidden !== 'undefined') {
  hidden = 'webkitHidden';
  visibilityChange = 'webkitvisibilitychange';
}

if (typeof document.addEventListener === 'undefined' || typeof document[hidden] === 'undefined') {
  support = false;
  console.log('this browser does not support the Page Visibility API.');
}

export default {
  isHidden: () => (hidden ? document[hidden] : undefined),
  addEvent: (func: EventListenerOrEventListenerObject, useCapture = false) => {
    if (support) document.addEventListener(visibilityChange, func, useCapture);
  },
  removeEvent: (func: EventListenerOrEventListenerObject) => {
    if (support) document.removeEventListener(visibilityChange, func);
  },
};
