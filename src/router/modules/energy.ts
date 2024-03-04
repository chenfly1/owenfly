import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/energy',
  name: '能耗中心',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/energy/dashboard',
      name: '首页',
      routes: [
        {
          path: '/energy/dashboard',
          name: '首页',
          component: '@/pages/energy/dashboard/index',
          hideInMenu: true,
        },
        {
          path: '/energy/dashboard/warning',
          name: '用量告警',
          component: '@/pages/energy/dashboard/warning',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/energy/meter',
      name: '仪表管理',
      routes: [
        {
          path: '/energy/meter/list',
          name: '仪表列表',
          component: '@/pages/energy/meter/list',
        },
        {
          path: '/energy/meter/measure',
          name: '计量位置管理',
          component: '@/pages/energy/meter/measure',
        },
        {
          path: '/energy/meter/category',
          name: '分项管理',
          component: '@/pages/energy/meter/category',
        },
        {
          path: '/energy/meter/slave',
          name: '主从表管理',
          component: '@/pages/energy/meter/slave',
        },
      ],
    },
    {
      path: '/energy/conservation',
      name: '节能管理',
      routes: [
        {
          path: '/energy/conservation/warning',
          name: '预警配置',
          routes: [
            {
              path: '/energy/conservation/warning',
              name: '预警配置',
              component: '@/pages/energy/conservation/warning',
              hideInMenu: true,
            },
            {
              path: '/energy/conservation/warning/monitor',
              name: '添加监测点',
              component: '@/pages/energy/conservation/warning/monitor',
              hideInMenu: true,
            },
          ],
        },
        {
          path: '/energy/conservation/carbon',
          name: '碳排放配置',
          component: '@/pages/energy/conservation/carbon',
        },
      ],
    },
    {
      path: '/energy/reading',
      name: '抄表管理',
      routes: [
        {
          path: '/energy/reading/electricity',
          name: '电表抄表',
          component: '@/pages/energy/reading/electricity',
        },
        {
          path: '/energy/reading/water',
          name: '水表抄表',
          component: '@/pages/energy/reading/water',
        },
      ],
    },
    {
      path: '/energy/analysis',
      name: '能耗分析',
      routes: [
        {
          path: '/energy/analysis/electric',
          name: '电能用能分析',
          component: '@/pages/energy/analysis/electric',
          routers: [],
        },
        {
          path: '/energy/analysis/electric/dateDetail',
          name: '用能详情-智能电表(按天)',
          component: '@/pages/energy/analysis/electric/dateDetail',
          routers: [],
          hideInMenu: true,
        },
        {
          path: '/energy/analysis/electric/timeDetail',
          name: '用能详情-智能电表(按时)',
          component: '@/pages/energy/analysis/electric/timeDetail',
          routers: [],
          hideInMenu: true,
        },
        {
          path: '/energy/analysis/hydroenergy',
          name: '水能用能分析',
          component: '@/pages/energy/analysis/hydroenergy',
          routers: [],
        },
        {
          path: '/energy/analysis/hydroenergy/dateDetail',
          name: '用能详情-智能水表(按天)',
          component: '@/pages/energy/analysis/hydroenergy/dateDetail',
          routers: [],
          hideInMenu: true,
        },
        {
          path: '/energy/analysis/hydroenergy/timeDetail',
          name: '用能详情-智能水表(按时)',
          component: '@/pages/energy/analysis/hydroenergy/timeDetail',
          routers: [],
          hideInMenu: true,
        },
        {
          path: '/energy/analysis/subentry',
          name: '分项分析',
          component: '@/pages/energy/analysis/subentry',
          routers: [],
        },
        {
          path: '/energy/analysis/master-slave',
          name: '主从分析',
          component: '@/pages/energy/analysis/master-slave',
          routers: [],
        },
        {
          path: '/energy/analysis/master-slave/detail',
          name: '主从分析详情',
          component: '@/pages/energy/analysis/master-slave/detail',
          routers: [],
          hideInMenu: true,
        },
        {
          path: '/energy/analysis/carbon',
          name: '碳排放分析',
          component: '@/pages/energy/analysis/carbon',
          routers: [],
        },
        {
          path: '/energy/analysis/carbon/detail',
          name: '折碳分析明细',
          component: '@/pages/energy/analysis/carbon/detail',
          hideInMenu: true,
          routers: [],
        },
      ],
    },
    {
      path: '/energy/reporting',
      name: '用能报表',
      routes: [
        {
          path: '/energy/reporting/electric',
          name: '电能报表',
          component: '@/pages/energy/reporting/electric',
          routers: [],
        },
        {
          path: '/energy/reporting/hydroenergy',
          name: '水能报表',
          component: '@/pages/energy/reporting/hydroenergy',
          routers: [],
        },
      ],
    },
  ],
};
export default routers;
