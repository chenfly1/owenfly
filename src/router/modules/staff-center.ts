import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/staff-center',
  name: '员工中心',
  routes: [
    {
      path: '/staff-center/staff-list',
      name: '员工管理',
      component: '@/pages/staff-center/staff-list',
    },
    {
      path: '/staff-center/staff-list-editable',
      name: '员工管理（可编辑）',
      component: '@/pages/staff-center/staff-list-editable',
    },
  ],
};
export default routers;
