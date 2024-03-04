import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '流程中心',
  path: '/flow-center',
  routes: [
    {
      name: '表单管理',
      path: '/flow-center/form',
      component: '@/pages/flow-center/form',
    },
    {
      name: '流程管理',
      path: '/flow-center/flow',
      component: '@/pages/flow-center/flow',
    },
  ],
};

export default routers;
