// JSON parse
export const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str.toString();
  }
};

export const insertCSS = () => {
  const id = 'widget_css';
  if (document.getElementById(id)) return;
  const styleEle = document.createElement('link');
  styleEle.id = id;
  styleEle.setAttribute('rel', 'stylesheet');
  styleEle.setAttribute('href', '/widget_sdk/widget.css');
  // WebKit hack
  styleEle.appendChild(document.createTextNode(''));
  document.head.appendChild(styleEle);
};
