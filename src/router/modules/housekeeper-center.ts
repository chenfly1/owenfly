import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '管家管理',

  path: '/housekeeper-center',
  // icon: 'icon-lingdongziyuan',
  flatMenu: true,
  routes: [
    {
      name: '管家管理',
      path: '/housekeeper-center',
      // icon: 'icon-geren',
      routes: [
        {
          path: '/housekeeper-center/project',
          name: '项目管家',
          component: '@/pages/housekeeper-center/project',
        },
        //房产管家
        {
          path: '/housekeeper-center/realEstate',
          name: '房产管家',
          component: '@/pages/housekeeper-center/realEstate',
          // hideInMenu: true,
          routers: [],
        },
        //房产管家批量导入
        {
          path: '/housekeeper-center/realEstate/batchImport',
          name: '批量导入',
          component: '@/pages/housekeeper-center/realEstate/batchImport',
          hideInMenu: true,
        },
        //房产管家批量导入
        {
          path: '/housekeeper-center/project/batchImport',
          name: '批量导入',
          component: '@/pages/housekeeper-center/project/batchImport',
          hideInMenu: true,
        },
      ],
    },
  ],
};

export default routers;
