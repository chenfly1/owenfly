export const createIframe = (options: {
  id: string;
  url: string;
  element: HTMLElement;
  timeout?: number;
  loadedCallback?: () => void;
  timeoutCallback?: () => void;
  style?: Record<string, any>;
}) => {
  const timeOutVar = setTimeout(() => {
    clearTimeout(timeOutVar);
    options?.timeoutCallback?.();
    return;
  }, options.timeout);
  const iframe: any = document.createElement('iframe');
  iframe.id = options.id;
  iframe.src = options.url;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.style.border = 'none';
  Object.keys(options.style || {}).forEach((key) => {
    iframe.style[key] = options.style?.[key];
  });
  if (iframe.attachEvent) {
    iframe.attachEvent('onload', () => {
      clearTimeout(timeOutVar);
      options?.loadedCallback?.();
    });
  } else {
    iframe.onload = () => {
      clearTimeout(timeOutVar);
      options?.loadedCallback?.();
    };
  }
  const ele = document.getElementById(options.id);
  if (ele) {
    options.element.removeChild(ele);
  }
  options.element.appendChild(iframe);
  return iframe;
};

export const getFormUrl = ({
  id,
  flowId,
  action,
  taskId,
  nodeName,
}: {
  id: string;
  flowId?: string;
  action?: string;
  taskId?: string;
  nodeName?: string;
}) => {
  return `/flow-center/widget?id=${id}&flowId=${flowId ?? ''}&action=${action ?? ''}&taskId=${
    taskId ?? ''
  }&nodeName=${nodeName ?? ''}`;
};

export const getSupportUrl = (params: Record<string, string>) => {
  return `/flow-center/support?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;
};

// JSON parse
export const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str.toString();
  }
};
