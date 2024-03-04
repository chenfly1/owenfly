import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '工单管理',
  path: '/workorder-center',
  // icon: 'icon-lingdongziyuan',
  flatMenu: true,
  routes: [
    {
      name: '工单管理',
      path: '/workorder-center',
      // icon: 'icon-geren',
      routes: [
        {
          path: '/workorder-center/list',
          name: '工单列表',
          component: '@/pages/workorder-center/list',
        },
        // 工单详情
        {
          path: '/workorder-center/list/details-acceptance/:id',
          name: '工单详情',
          component: '@/pages/workorder-center/details-acceptance',
          hideInMenu: true,
        },
        //管理配置
        {
          path: '/workorder-center/details-configuration',
          name: '工单管理配置',
          component: '@/pages/workorder-center/details-configuration',
          // hideInMenu: true,
          routers: [],
        },
      ],
    },
  ],
};

export default routers;
