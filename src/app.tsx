import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { Link } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import HeaderLogo from '@/components/HeaderLogo';
import { storageSy } from '@/utils/Setting';
import { requestInterceptors, responseInterceptors, errorHandler } from '@/utils/Request';
import defaultSettings from '../config/defaultSettings';
import 'moment/locale/zh-cn';
import { config } from '@/utils/config';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout';
import { getUserInfo } from '@/services/app';
import { getMenu, getSaMenu, getVerticalsSystem } from '@/services/auth';
import { getProjectAllList } from '@/services/mda';
import superAdminRouter from '@/router/modules/super-admin';
import HeaderProject from '@/components/HeaderProject';
import '@/global.less';
import * as Sentry from '@sentry/react';
const loginPath = '/user/login';
const whiteList = [loginPath, '/h5/video-playback']; //路由白名单
const widgetList = ['/flow-center/widget', '/flow-center/support']; // 挂件页面(和业务数据无关)

Sentry.init({
  dsn: 'http://912335ee28fb70326d528c3438b272bb@sentry.aciga.com.cn/1',

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [new Sentry.Replay()],
});

//type UserType = 'sadmin' | 'user';
/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};
function initMenuInfo() {
  const { systemBid, type } = history.location.query || {};
  if (systemBid || type) {
    sessionStorage.setItem('menuInfo', JSON.stringify({ systemBid, type }));
  }
  const menuInfo = sessionStorage.getItem('menuInfo')
    ? JSON.parse(sessionStorage.getItem('menuInfo') || '')
    : { type: 'base', code: 'base' };
  sessionStorage.setItem('menuInfo', JSON.stringify(menuInfo));
  return menuInfo;
}
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: LayoutSettings & {
    pwa?: boolean;
    logo?: string;
  };
  currentUser?: UserInfo; // 用于存储用户信息 API.CurrentUser 是ts语法 声明的改对象类型
  fetchUserInfo?: () => Promise<UserInfo | undefined>; // 获取用户信息接口
  fetchUserMenu?: () => Promise<ResourceTreeItemType[] | undefined>; // 获取菜单接口
  fetchProjectList?: () => Promise<ProjectListType[] | undefined>; // 获取菜单接口
  projectList?: ProjectListType[];
  menuData?: ResourceTreeItemType[]; // 存储菜单
  loading?: boolean;
}> {
  const menuInfo = initMenuInfo();
  let currentUser: UserInfo | undefined;
  let menuData;
  let projectList: ProjectListType[] | undefined;
  const USER_TOKEN = localStorage.getItem(storageSy.token);
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo();
      localStorage.setItem('userInfo', JSON.stringify(res.data ? res.data : {}));
      return res.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchProjectList = async (): Promise<ProjectListType[]> => {
    try {
      const res = await getProjectAllList();
      return res.data.items;
    } catch (error) {
      history.push(loginPath);
    }
    return [];
  };
  const fetchUserMenu = async () => {
    // const { type, systemBid } = history.location.query || {};
    if (menuInfo.systemBid) {
      const resSys = await getVerticalsSystem();
      const targe = resSys.data.find((i: any) => i.bid === menuInfo.systemBid);
      localStorage.setItem('VSystem', JSON.stringify(resSys.data));
      sessionStorage.setItem('menuInfo', JSON.stringify({ ...targe, systemBid: targe?.bid }));
    }

    const menuApi = currentUser?.type === 'sadmin' ? getSaMenu : getMenu;

    try {
      const res = await menuApi({
        type: menuInfo?.type,
        systemBid: menuInfo?.systemBid,
      });
      return res.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  if (widgetList.includes(history.location.pathname)) {
    const localInfo = localStorage.getItem('userInfo');
    currentUser = localInfo ? JSON.parse(localInfo) : await fetchUserInfo();
    menuData = [];
    projectList = [];
  } else {
    // 当用户登录且点击浏览器刷新时触发
    if (USER_TOKEN) {
      currentUser = await fetchUserInfo();
      menuData = await fetchUserMenu();
      projectList = currentUser?.type === 'sadmin' ? [] : await fetchProjectList();
    }
    // 当用户登录且浏览器地址为登录页地址时触发  其中 loginPath 是我的登录页地址 请自行修改
    // 防止用户手动输入登录页地址
    if (!whiteList.includes(history.location.pathname)) {
      if (!USER_TOKEN) history.push(loginPath);
    }
  }
  return {
    fetchUserInfo,
    fetchUserMenu,
    currentUser,
    menuData,
    projectList,
    settings: defaultSettings,
    loading: false,
  };
}
/**
 * @module 请求模块
 */
export const request: RequestConfig = {
  prefix: config.host,
  errorHandler,
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors],
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    logo: () => <HeaderLogo />,
    // 自定义头内容的方法  我把 自定义侧边栏收缩按钮位置 方在这里
    headerContentRender: () => <HeaderProject />,
    menuHeaderRender: undefined,
    menuItemRender: (menuItemProps, defaultDom) => {
      if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
        return (
          <Link to={menuItemProps.path as any} title="">
            {defaultDom as any}
          </Link>
        );
      }
      return (
        <Link to={menuItemProps.path} title="">
          {defaultDom as any}
        </Link>
      );
    },
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      if (initialState?.loading) return <PageLoading />;
      return <>{children} </>;
    },
    // menu: {
    //   // 每当 initialState?.currentUser?.account 发生修改时重新执行 request
    //   params: {
    //     userId: initialState?.currentUser?.account,
    //   },
    //   request: async (): Promise<MenuDataItem[]> => {
    //     const generatorRouter: any = (routes: ResourceTreeItemType[]) => {
    //       return routes.map((item: ResourceTreeItemType) => {
    //         if (item.type === 'menu') {
    //           return {
    //             name: item.text,
    //             flatMenu: item.parentBid === '0',
    //             path: item.url || '/',
    //             icon: item.icon,
    //             routes:
    //               item.children && item.children?.length > 0 ? generatorRouter(item.children) : [],
    //           };
    //         } else {
    //           return false;
    //         }
    //       });
    //     };
    //     const routers = generatorRouter(initialState?.menuData || []);

    //     if (initialState?.currentUser?.type === 'sadmin') {
    //       return [superAdminRouter];
    //     }
    //     const menuInfo: MenuInfo = JSON.parse(sessionStorage.getItem('menuInfo') || '');
    //     if (menuInfo.type === 'base') {
    //       routers.unshift({
    //         path: '/home?type=base',
    //         name: '应用首页',
    //         icon: 'icon-lingdongshouye',
    //       });
    //     }

    //     return routers;
    //   },
    // },
    menuDataRender: () => {
      const generatorRouter: any = (routes: ResourceTreeItemType[]) => {
        return routes.map((item: ResourceTreeItemType) => {
          if (item.type === 'menu') {
            return {
              name: item.text,
              flatMenu: item.parentBid === '0',
              path: item.url || '/',
              icon: item.icon,
              routes:
                item.children && item.children?.length > 0 ? generatorRouter(item.children) : [],
            };
          } else {
            return false;
          }
        });
      };
      const routers = generatorRouter(initialState?.menuData || []);
      if (initialState?.currentUser?.type === 'sadmin') {
        return [superAdminRouter];
      }
      const menuInfo: MenuInfo = JSON.parse(sessionStorage.getItem('menuInfo') || '');
      if (menuInfo.type === 'base') {
        routers.unshift({
          path: '/home?type=base',
          name: '应用首页',
          icon: 'icon-lingdongshouye',
        });
      }
      return routers;
    },

    ...initialState?.settings,
  };
};
