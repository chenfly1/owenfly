import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/living-payment',
  name: '生活缴费',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/living-payment/bill',
      name: '账单管理',
      routes: [
        {
          path: '/living-payment/bill/receivable/batch-import',
          component: '@/pages/living-payment/bill/receivable/batch-import',
          name: '批量导入',
          hideInMenu: true,
          routes: [],
        },
        {
          path: '/living-payment/bill/receivable/collection',
          component: '@/pages/living-payment/bill/receivable/collection',
          name: '线下收款信息确认',
          hideInMenu: true,
          routes: [],
        },
        {
          path: '/living-payment/bill/receivable/detail',
          component: '@/pages/living-payment/bill/receivable/detail',
          name: '账单详情',
          hideInMenu: true,
          routes: [],
        },
        {
          path: '/living-payment/bill/receivable',
          component: '@/pages/living-payment/bill/receivable',
          name: '应收记录',
          routes: [],
        },
        {
          path: '/living-payment/bill/deal/detail',
          component: '@/pages/living-payment/bill/deal/detail',
          hideInMenu: true,
          name: '交易详情',
          routes: [],
        },
        {
          path: '/living-payment/bill/deal',
          component: '@/pages/living-payment/bill/deal',
          name: '交易记录',
          routes: [],
        },
      ],
    },
    {
      path: '/living-payment/payment',
      name: '支付管理',
      routes: [
        {
          path: '/living-payment/payment/merchant',
          component: '@/pages/living-payment/payment/merchant',
          name: '商户管理',
          routes: [],
        },
      ],
    },
    {
      path: '/living-payment/operations',
      name: '运营管理',
      routes: [
        {
          path: '/living-payment/operations/invoice',
          component: '@/pages/living-payment/operations/invoice',
          name: '发票信息管理',
          routes: [],
        },
      ],
    },
  ],
};
export default routers;
