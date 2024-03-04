import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/system-management',
  name: '基础数据',
  routes: [
    {
      path: '/system-management/operationLog',
      name: '操作日志',
      routes: [
        {
          path: '/system-management/operationLog',
          name: '操作日志',
          component: '@/pages/system-management/operationLog',
        },
      ],
    },
    {
      path: '/system-management/menu-manage',
      name: '菜单管理',
      routes: [
        {
          path: '/system-management/menu-manage',
          name: '菜单管理',
          component: '@/pages/system-management/menu-manage',
        },
      ],
    },
  ],
};
export default routers;
