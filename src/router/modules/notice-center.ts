import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '通知中心',
  path: '/notice-center',
  routes: [
    {
      name: '通知中心',
      path: '/notice-center',
      routes: [
        {
          path: '/notice-center/notice-list',
          name: '我的消息',
          component: '@/pages/notice-center/notice-list',
        },
        {
          path: '/notice-center/notice-template/add',
          name: '新建模板',
          hideInMenu: true,
          component: '@/pages/notice-center/notice-template/add',
          routes: [],
        },
        {
          path: '/notice-center/notice-template',
          name: '消息模板',
          component: '@/pages/notice-center/notice-template',
        },
        {
          path: '/notice-center/notice-task',
          name: '消息发送',
          routes: [
            {
              path: '/notice-center/notice-task',
              name: '消息发送',
              component: '@/pages/notice-center/notice-task',
              hideInMenu: true,
            },
            {
              path: '/notice-center/notice-task/add',
              name: '新建消息发送',
              component: '@/pages/notice-center/notice-task/add',
              hideInMenu: true,
            },
          ],
        },
        {
          path: '/notice-center/notice-log',
          name: '消息日志',
          component: '@/pages/notice-center/notice-log',
        },
      ],
    },
  ],
};

export default routers;
