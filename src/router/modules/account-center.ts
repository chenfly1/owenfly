import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/account-center',
  name: '账号中心',
  routes: [
    {
      path: '/account-center/account-mamage',
      name: '账号管理',
      component: '@/pages/account-center/account-mamage',
    },
    {
      path: '/account-center/role-mamage',
      name: '角色管理',
      component: '@/pages/account-center/role-mamage',
    },
    {
      path: '/account-center/organization-mamage',
      name: '组织管理',
      component: '@/pages/account-center/organization-mamage',
    },
    {
      path: '/account-center/menu-manage',
      name: '菜单管理',
      component: '@/pages/account-center/menu-manage',
    },
    {
      path: '/account-center',
      redirect: '/account-center/account-mamage',
    },
  ],
};
export default routers;
