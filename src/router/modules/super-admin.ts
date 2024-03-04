import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '租户管理',
  path: '/super-admin',
  flatMenu: true,
  routes: [
    {
      name: '租户管理',
      path: '/super-admin/tenant',
      icon: 'icon-lingdongnavicon-zhgl',
      authorize: 'sadmin',
      routes: [
        {
          name: '租户管理',
          path: '/super-admin/tenant',
          component: '@/pages/super-admin/tenant',
          hideInMenu: true,
        },
        {
          name: '添加租户',
          path: '/super-admin/tenant/add',
          component: '@/pages/super-admin/tenant/add',
          hideInMenu: true,
        },
        {
          name: '编辑租户',
          path: '/super-admin/tenant/edit',
          component: '@/pages/super-admin/tenant/edit',
          hideInMenu: true,
        },
        {
          name: '应用授权',
          path: '/super-admin/tenant/auth-list/:id/:bid',
          component: '@/pages/super-admin/tenant/auth-list',
          hideInMenu: true,
        },
        {
          name: '开通应用',
          path: '/super-admin/tenant/auth-list/auth-details',
          component: '@/pages/super-admin/tenant/auth-list/auth-details',
          hideInMenu: true,
        },
      ],
    },

    {
      name: '应用管理',
      path: '/super-admin/application',
      icon: 'icon-lingdongyingyongguanli',
      authorize: 'sadmin',
      routes: [
        {
          path: '/super-admin/application',
          name: '应用管理',
          component: '@/pages/super-admin/application/',
          hideInMenu: true,
        },
        {
          name: '编辑应用',
          path: '/super-admin/application/edit',
          component: '@/pages/super-admin/application/edit',
          hideInMenu: true,
        },
        {
          name: '模块列表',
          path: '/super-admin/application/modular-list',
          component: '@/pages/super-admin/application/modular-list',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/super-admin/resource-manage',
      name: '全局菜单',
      icon: 'icon-lingdongcaidan',
      component: '@/pages/super-admin/resource-manage',
    },
    {
      path: '/super-admin/material-center',
      name: '素材库',
      icon: 'icon-lingdong-_sucaiku',
      component: '@/pages/super-admin/material-center',
    },
    {
      path: '/super-admin/vehicle-certification',
      name: '车辆认证',
      icon: 'icon-lingdongcheliangrenzheng',
      component: '@/pages/super-admin/vehicle-certification',
    },
    {
      path: '/super-admin',
      redirect: '/super-admin/tenant',
    },
    {
      path: '/super-admin/feedback',
      name: '意见反馈',
      icon: 'icon-lingdongcaidan',
      component: '@/pages/super-admin/feedback',
    },
    // {
    //   name: '消息中心',
    //   path: '/super-admin/notice-center',
    //   icon: 'icon-lingdongyingyongguanli',
    //   authorize: 'sadmin',
    //   routes: [
    //     {
    //       path: '/super-admin/notice-center/notice-channel',
    //       name: '消息渠道管理',
    //       component: '@/pages/super-admin/notice-center/notice-channel',
    //     },
    //     {
    //       path: '/super-admin/notice-center/notice-send-record',
    //       name: '消息发送统计',
    //       component: '@/pages/super-admin/notice-center/notice-send-record',
    //     },
    //   ],
    // },
    // {
    //   name: '设备中心',
    //   path: '/super-admin/device-center',
    //   icon: 'icon-lingdongcaidan',
    //   authorize: 'sadmin',
    //   routes: [
    //     {
    //       path: '/super-admin/device-center/device-upgrade',
    //       name: '设备升级',
    //       routes: [
    //         {
    //           path: '/super-admin/device-center/device-upgrade',
    //           name: '设备升级',
    //           component: '@/pages/device-center/upgrade',
    //           hideInMenu: true,
    //         },
    //         {
    //           path: '/super-admin/device-center/device-upgrade/detail/:id',
    //           name: '任务详情',
    //           component: '@/pages/device-center/upgrade/detail',
    //           hideInMenu: true,
    //         },
    //         {
    //           path: '/super-admin/device-center/device-upgrade/create',
    //           name: '创建任务',
    //           component: '@/pages/device-center/upgrade/create/index',
    //           hideInMenu: true,
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      name: '流程中心',
      path: '/super-admin/flow-center',
      icon: 'icon-lingdongcaidan',
      routes: [
        {
          name: '表单管理',
          path: '/super-admin/flow-center/form',
          component: '@/pages/flow-center/form',
        },
        {
          name: '流程管理',
          path: '/super-admin/flow-center/flow',
          component: '@/pages/flow-center/flow',
        },
        {
          name: '接口配置',
          path: '/super-admin/flow-center/setting',
          component: '@/pages/flow-center/setting',
        },
      ],
    },
  ],
};

export default routers;
