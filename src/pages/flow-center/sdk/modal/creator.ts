const modalId = 'form_widget_support_modal';

export const createModal = (
  url: string,
  options: { width?: number; height?: number; top?: number } = {},
) => {
  const { width, height, top } = { width: 800, height: 600, top: 100, ...options };
  const maskStyle = {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: 'rgba(0,0,0,0.3)',
    'z-index': 9998,
  };
  const contentStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'fixed',
    left: `calc(50% - ${width / 2}px)`,
    top: `${top}px`,
    'z-index': 9999,
  };
  const innerHtml = `
    <div id="form_widget_support_mask" style="${Object.keys(maskStyle || {})
      .map((key) => `${key}:${maskStyle?.[key]}`)
      .join(';')}"></div>
    <div id="form_widget_support_content" style="${Object.keys(contentStyle || {})
      .map((key) => `${key}:${contentStyle?.[key]}`)
      .join(';')}">
        <iframe id="form_widget_support_iframe" src="${url}" width="100%" height="100%" style="border: none;"/>
    </div>
  `;
  let modal = document.getElementById(modalId);
  if (modal) document.body.removeChild(modal);
  modal = document.createElement('div');
  modal.id = modalId;
  modal.innerHTML = innerHtml;
  modal.style.display = 'none';
  document.body.appendChild(modal);
  return {
    modal,
    content: document.getElementById('form_widget_support_iframe') as HTMLIFrameElement,
  };
};

export const setContentStyle = (
  options: { width?: number; height?: number; top?: number } = {},
) => {
  const content = document.getElementById('form_widget_support_content');
  if (content) {
    const { width, height, top } = { width: 800, height: 600, top: 100, ...options };
    const contentStyle = {
      width: `${width}px`,
      height: `${height}px`,
      position: 'fixed',
      left: `calc(50% - ${width / 2}px)`,
      top: `${top}px`,
      'z-index': 9999,
    };
    content.style.cssText = `${Object.keys(contentStyle || {})
      .map((key) => `${key}:${contentStyle?.[key]}`)
      .join(';')}`;
  }
};

export const open = () => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
};

export const close = () => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
};
