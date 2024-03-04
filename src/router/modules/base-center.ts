import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/base-center',
  name: '基础数据',
  routes: [
    {
      path: '/base-center/parking-space',
      name: '产权管理',
      routes: [
        {
          path: '/base-center/parking-space',
          name: '产权管理',
          component: '@/pages/base-center/parking-space/',
          hideInMenu: true,
        },
        {
          name: '新建房产',
          path: '/base-center/parking-space/house/add',
          component: '@/pages/base-center/parking-space/house/add',
          hideInMenu: true,
        },
        {
          name: '编辑房产',
          path: '/base-center/parking-space/house/edit',
          component: '@/pages/base-center/parking-space/house/edit',
          hideInMenu: true,
        },
        {
          name: '查看房产',
          path: '/base-center/parking-space/house/details',
          component: '@/pages/base-center/parking-space/house/details',
          hideInMenu: true,
        },
        {
          name: '拆分房产',
          path: '/base-center/parking-space/house/split',
          component: '@/pages/base-center/parking-space/house/split',
          hideInMenu: true,
        },
        {
          name: '新建车位',
          path: '/base-center/parking-space/stall/add',
          component: '@/pages/base-center/parking-space/stall/add',
          hideInMenu: true,
        },
        {
          name: '编辑车位',
          path: '/base-center/parking-space/stall/edit',
          component: '@/pages/base-center/parking-space/stall/edit',
          hideInMenu: true,
        },
        {
          name: '查看车位',
          path: '/base-center/parking-space/stall/details',
          component: '@/pages/base-center/parking-space/stall/details',
          hideInMenu: true,
        },
        {
          path: '/base-center/parking-space/batch-import',
          name: '批量导入',
          component: '@/pages/base-center/batch-import',
          hideInMenu: true,
        },
      ],
    },

    {
      path: '/base-center/customer-management',
      name: '客户管理',
      routes: [
        {
          path: '/base-center/customer-management',
          name: '客户管理',
          component: '@/pages/base-center/customer-management',
          hideInMenu: true,
        },
        {
          name: '新建个人客户',
          path: '/base-center/customer-management/personage/add',
          component: '@/pages/base-center/customer-management/personage/add',
          hideInMenu: true,
        },
        {
          name: '编辑个人客户',
          path: '/base-center/customer-management/personage/edit',
          component: '@/pages/base-center/customer-management/personage/add',
          hideInMenu: true,
        },
        {
          name: '新建企业客户',
          path: '/base-center/customer-management/enterprise/add',
          component: '@/pages/base-center/customer-management/enterprise/add',
          hideInMenu: true,
        },
        {
          name: '编辑企业客户',
          path: '/base-center/customer-management/enterprise/edit',
          component: '@/pages/base-center/customer-management/enterprise/add',
          hideInMenu: true,
        },
        {
          path: '/base-center/customer-management/batch-import',
          name: '批量导入',
          component: '@/pages/base-center/batch-import',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/base-center/project-center',
      name: '项目',
      routes: [
        {
          path: '/base-center/project-center/edit',
          name: '项目编辑',
          hideInMenu: true,
          component: '@/pages/base-center/project-center/edit',
        },
        {
          path: '/base-center/project-center/add',
          name: '项目新建',
          hideInMenu: true,
          component: '@/pages/base-center/project-center/add',
        },
        {
          path: '/base-center/project-center',
          name: '项目列表',
          component: '@/pages/base-center/project-center',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/base-center/space-center',
      name: '空间',
      routes: [
        {
          path: '/base-center/space-center',
          name: '空间树',
          component: '@/pages/base-center/space-center',
        },
      ],
    },
    {
      path: '/base-center/space-estate',
      name: '空间-产权绑定',
      component: '@/pages/base-center/space-estate',
    },
    {
      path: '/base-center/staff-list',
      name: '员工',
      routes: [
        {
          path: '/base-center/staff-list',
          name: '员工',
          component: '@/pages/base-center/staff-list',
        },
      ],
    },
  ],
};
export default routers;
