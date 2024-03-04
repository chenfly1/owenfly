import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '智慧人行',
  icon: 'icon-a-01zuhuguanli',
  path: '/pass-center',

  routes: [
    {
      path: '/pass-center/dashboard',
      name: '经营概况',
      routes: [
        {
          path: '/pass-center/dashboard/singleProject',
          component: '@/pages/pass-center/dashboard/singleProject',
          name: '经营概况',
          routes: [],
        },
        {
          path: '/pass-center/dashboard/multiplProject',
          component: '@/pages/pass-center/dashboard/multiplProject',
          hideInMenu: true,
          name: '经营概况',
          routes: [],
        },
      ],
    },
    {
      path: '/pass-center/authorization-manage',
      name: '门禁梯控授权',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/authorization-manage/setting-periodic',
          component: './pass-center/authorization-manage/setting-periodic',
          name: '周期配置',
          routes: [],
        },
        {
          path: '/pass-center/authorization-manage/personnel-list',
          name: '按人员授权',
          routes: [
            {
              path: '/pass-center/authorization-manage/personnel-list',
              name: '按人员授权',
              component: '@/pages/pass-center/authorization-manage/personnel-list',
              hideInMenu: true,
              routes: [],
            },
          ],
        },
        {
          path: '/pass-center/authorization-manage/department-list',
          name: '按部门授权',
          component: '@/pages/pass-center/authorization-manage/department-list',
          routes: [],
        },
        {
          path: '/pass-center/authorization-manage/property-list',
          name: '按产权授权',
          component: '@/pages/pass-center/authorization-manage/property-list',
          routes: [],
        },
      ],
    },
    {
      path: '/pass-center/visit-manage',
      name: '访客管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/visit-manage/visit-apply-list',
          name: '访客邀约',
          component: '@/pages/pass-center/visit-manage/visit-apply-list',
          routes: [],
        },
      ],
    },
    {
      path: '/pass-center/access-area-manage',
      name: '通行区域管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/access-area-manage/personnel-access-area',
          name: '人员通行区域',
          component: '@/pages/pass-center/access-area-manage/personnel-access-area',
        },
        {
          path: '/pass-center/access-area-manage/visitor-access-area',
          name: '访客通行区域',
          component: '@/pages/pass-center/access-area-manage/visitor-access-area',
        },
      ],
    },
    {
      path: '/pass-center/reord-manage',
      name: '记录查询',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/reord-manage/personnel-record',
          name: '人员通行记录',
          component: '@/pages/pass-center/reord-manage/personnel-record',
        },
        {
          path: '/pass-center/reord-manage/visitor-record',
          name: '访客通行记录',
          component: '@/pages/pass-center/reord-manage/visitor-record',
        },
        {
          path: '/pass-center/reord-manage/warning-record',
          name: '报警记录',
          component: '@/pages/pass-center/reord-manage/warning-record',
        },
        {
          path: '/pass-center/reord-manage/talkback-record',
          name: '对讲记录',
          component: '@/pages/pass-center/reord-manage/talkback-record',
        },
      ],
    },
    {
      path: '/pass-center/voucher-manage',
      name: '凭证管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/voucher-manage/voucher-list',
          name: '凭证下发中心',
          hideInMenu: true,
          // component: '@/pages/pass-center/voucher-manage/voucher-list',
          routes: [
            {
              path: '/pass-center/voucher-manage/voucher-list/history-opteration',
              name: '历史操作记录',
              component: '@/pages/pass-center/voucher-manage/voucher-list/history-opteration',
            },
            {
              path: '/pass-center/voucher-manage/voucher-list',
              name: '凭证下发中心',
              component: '@/pages/pass-center/voucher-manage/voucher-list',
            },
          ],
        },
        {
          path: '/pass-center/voucher-manage/IC-manage',
          name: 'IC卡管理',
          component: '@/pages/pass-center/voucher-manage/IC-manage',
        },
      ],
    },
    {
      path: '/pass-center/notice-center',
      name: '公告管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/notice-center/property-notice',
          name: '图文公告',
          component: '@/pages/pass-center/notice-center/property-notice',
        },
      ],
    },
    {
      path: '/pass-center/devices-manage',
      name: '设备管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/pass-center/devices-manage/door-control-list',
          name: '门禁梯控设备',
          component: '@/pages/pass-center/devices-manage/door-control-list',
        },
        {
          path: '/pass-center/devices-manage/visual-intercom-list',
          name: '可视对讲设备',
          component: '@/pages/pass-center/devices-manage/visual-intercom-list',
        },
      ],
    },
  ],
};
export default routers;
