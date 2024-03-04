import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/device-center',
  name: '设备中心',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/device-center/device-list',
      name: '设备列表',
      component: '@/pages/device-center/device-list',
      routers: [],
    },
    {
      path: '/device-center/details/:id',
      name: '设备详情',
      component: '@/pages/device-center/device-list/details',
      hideInMenu: true,
      routers: [],
    },
    {
      path: '/device-center/device-type',
      name: '设备类型管理',
      component: '@/pages/device-center/device-type',
      routers: [],
    },
    {
      path: '/device-center/device-warning',
      name: '设备告警管理',
      component: '@/pages/device-center/device-warning',
      routers: [],
    },
    {
      path: '/device-center/device-warning/edit/:id',
      name: '设备告警编辑',
      component: '@/pages/device-center/device-warning/edit',
      routers: [],
    },
    {
      path: '/device-center/device-warning/device-warning-log',
      name: '设备告警日志',
      component: '@/pages/device-center/device-warning/warning-log',
      routers: [],
    },
    {
      path: '/device-center/device-event-log',
      name: '事件日志',
      component: '@/pages/device-center/device-event-log',
      routers: [],
    },
    {
      path: '/device-center/device-edge-list/details/:id',
      name: '实例详情',
      component: '@/pages/device-center/device-edge-list/details',
      hideInMenu: true,
      routers: [],
    },
    {
      path: '/device-center/device-edge-list',
      name: '边缘端管理',
      component: '@/pages/device-center/device-edge-list',
      routers: [],
    },
    {
      path: '/device-center/IP-plan',
      name: 'IP位置规划',
      component: '@/pages/device-center/IP-plan',
      routers: [],
    },
    {
      path: '/device-center/IP-plan/batch-import',
      name: '批量导入',
      component: '@/pages/device-center/IP-plan/batch-import',
      hideInMenu: true,
    },
    {
      path: '/device-center/device-map',
      name: '设备地图',
      component: '@/pages/device-center/map',
    },
  ],
};
export default routers;
