import type { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  loginLogo?: string;
  loginBgImg?: string;
} = {
  title: '',
  iconfontUrl: '//at.alicdn.com/t/c/font_3901861_p5o971a943r.js',
  navTheme: 'light',
  primaryColor: '#0D74FF',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  pwa: false,
  // logo: '/images/logo.png',
  loginLogo: '/images/login-lingdong-logo.svg',
  loginBgImg: '/images/login-bg.png',
  headerHeight: 48,
  splitMenus: false,
};
export default Settings;
