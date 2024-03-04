import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/ioc',
  name: '社区IOC大屏',
  icon: 'icon-a-01zuhuguanli',
  layout: false,
  routes: [
    {
      path: '/ioc/dashboard',
      name: '首页',
      routes: [
        {
          path: '/ioc/dashboard',
          name: '首页',
          component: '@/pages/ioc/dashboard/index',
          layout: false,
        },
      ],
    },
  ],
};
export default routers;
