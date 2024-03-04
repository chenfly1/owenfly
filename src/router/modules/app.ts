import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem[] = [
  {
    path: '/user',
    layout: false,
    name: '用户中心',
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: '零洞智慧社区-登录',
        component: '@/pages/user/Login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: '注册结果',
        icon: 'smile',
        path: '/user/register-result',
        component: '@/pages/user/register-result',
      },
      {
        name: '注册',
        icon: 'smile',
        path: '/user/register',
        component: '@/pages/user/register',
      },
      {
        name: '忘记密码',
        icon: 'smile',
        path: '/user/forget-password',
        component: '@/pages/user/forget-password',
      },
      {
        name: '个人设置',
        icon: 'smile',
        path: '/user/person-settings',
        layout: true,
        component: '@/pages/user/person-settings',
      },
      {
        component: '404',
      },
    ],
  },
  {
    path: '/H5',
    layout: false,
    name: '零洞智慧社区',
    routes: [
      {
        path: '/h5/video-playback',
        layout: false,
        component: '@/pages/h5/video-playback',
      },
    ],
  },
  {
    path: '/home',
    name: '应用首页',
    component: '@/pages/home',
    icon: 'icon-lingdongziyuan',
  },
  {
    name: '流程中心',
    path: '/flow-center',
    routes: [
      {
        name: '流程挂件',
        path: '/flow-center/widget',
        component: '@/pages/flow-center/widget',
        layout: false,
      },
      {
        name: '流程挂件配套页面',
        path: '/flow-center/support',
        component: '@/pages/flow-center/widget/support',
        layout: false,
      },
      {
        name: '流程案例',
        path: '/flow-center/demo',
        layout: false,
        routes: [
          {
            name: '流程案例',
            path: '/flow-center/demo',
            component: '@/pages/flow-center/demo/index',
            layout: false,
          },
          {
            name: '流程案例',
            path: '/flow-center/demo/content',
            component: '@/pages/flow-center/demo/content',
            layout: false,
          },
        ],
      },
    ],
  },
];

export default routers;
