import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/building',
  name: '智慧楼宇',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/building/equipment',
      name: '建筑设备',
      routes: [
        {
          path: '/building/equipment/airCond',
          name: '空调设备',
          component: '@/pages/building/equipment/airCond',
        },
        {
          path: '/building/equipment/exhaust',
          name: '排风系统',
          component: '@/pages/building/equipment/exhaust',
        },
      ],
    },
  ],
};
export default routers;
