import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/park-center',
  name: '智慧车行',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/park-center/dashboard',
      name: '经营概况',
      routes: [
        {
          path: '/park-center/dashboard/singleProject',
          component: '@/pages/park-center/dashboard/singleProject',
          name: '经营概况',
          routes: [],
        },
        {
          path: '/park-center/dashboard/multiplProject',
          component: '@/pages/park-center/dashboard/multiplProject',
          hideInMenu: true,
          name: '经营概况',
          routes: [],
        },
      ],
    },
    {
      path: '/park-center/baseInfo',
      name: '车场基础信息',
      routes: [
        {
          path: '/park-center/baseInfo/area-manager',
          name: '区域管理',
          component: '@/pages/park-center/baseInfo/area-manager',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/area-manager/detail',
          name: '区域详情',
          component: '@/pages/park-center/baseInfo/area-manager/detail',
          hideInMenu: true,
        },
        {
          path: '/park-center/baseInfo/park-info',
          name: '车位信息',
          component: '@/pages/park-center/baseInfo/park-info',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/yard-info',
          name: '车场信息',
          component: '@/pages/park-center/baseInfo/yard-info',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/yard-info/detail',
          name: '车场信息详情',
          component: '@/pages/park-center/baseInfo/yard-info/detail',
          hideInMenu: true,
          routers: [],
        },
        {
          path: '/park-center/baseInfo/channel-info',
          name: '通道信息',
          component: '@/pages/park-center/baseInfo/channel-info',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/channel-info/detail',
          name: '通道信息详情',
          hideInMenu: true,
          component: '@/pages/park-center/baseInfo/channel-info/detail',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/equipment-info',
          name: '设备信息',
          component: '@/pages/park-center/baseInfo/equipment-info',
          routers: [],
        },
        {
          path: '/park-center/baseInfo/equipment-info/detail',
          name: '设备信息详情',
          hideInMenu: true,
          component: '@/pages/park-center/baseInfo/equipment-info/detail',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/parkBusiness',
      name: '车场业务信息',
      routes: [
        {
          path: '/park-center/parkBusiness/project-config',
          name: '项目业务配置',
          component: '@/pages/park-center/parkBusiness/project-config',
          routers: [],
        },
        {
          path: '/park-center/parkBusiness/park-config',
          name: '车场业务配置',
          component: '@/pages/park-center/parkBusiness/park-config',
          routers: [],
        },
        {
          path: '/park-center/parkBusiness/service-list',
          name: '车辆套餐',
          component: '@/pages/park-center/parkBusiness/service-list',
          routers: [],
        },
        {
          path: '/park-center/parkBusiness/accounting-rule',
          name: '计费规则',
          component: '@/pages/park-center/parkBusiness/accounting-rule',
          routers: [],
        },
        {
          path: '/park-center/parkBusiness/service-list/add',
          name: '创建车辆套餐',
          hideInMenu: true,
          component: '@/pages/park-center/parkBusiness/service-list/add',
          routers: [],
        },
        {
          path: '/park-center/parkBusiness/service-list/detail',
          name: '车辆套餐详情',
          hideInMenu: true,
          component: '@/pages/park-center/parkBusiness/service-list/detail',
        },
      ],
    },
    {
      path: '/park-center/carManage',
      name: '固定车辆管理',
      routes: [
        {
          path: '/park-center/carManage/authorization-manage',
          name: '授权管理',
          component: '@/pages/park-center/carManage/authorization-manage',
          routers: [],
        },
        {
          path: '/park-center/carManage/authorization-manage/add',
          name: '授权管理新增',
          component: '@/pages/park-center/carManage/authorization-manage/add',
          routers: [],
        },
        {
          path: '/park-center/carManage/authorization-manage/detail',
          name: '授权管理查看',
          component: '@/pages/park-center/carManage/authorization-manage/detail',
          routers: [],
        },
        {
          path: '/park-center/carManage/owner-vehicle-manage',
          name: '车主车辆管理',
          component: '@/pages/park-center/carManage/owner-vehicle-manage',
          routers: [],
        },
        {
          path: '/park-center/carManage/blacklist-vehicle-manage',
          name: '黑名单车辆管理',
          component: '@/pages/park-center/carManage/blacklist-vehicle-manage',
          routers: [],
        },
        {
          path: '/park-center/carManage/vehicle-authorized-record',
          name: '固定车辆操作记录',
          component: '@/pages/park-center/carManage/vehicle-authorized-record',
          routers: [],
        },
        {
          path: '/park-center/carManage/vehicle-change-record',
          name: '车辆变更记录',
          component: '@/pages/park-center/carManage/vehicle-change-record',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/passManage',
      name: '通行记录管理',
      routes: [
        {
          path: '/park-center/passManage/inPlate',
          name: '场内车辆记录',
          component: '@/pages/park-center/passManage/inPlate',
          routers: [],
        },
        {
          path: '/park-center/passManage/pass-list',
          name: '车辆通行记录',
          component: '@/pages/park-center/passManage/pass-list',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/charge',
      name: '缴费记录管理',
      routes: [
        {
          path: '/park-center/charge/bill-list',
          name: '订单记录',
          component: '@/pages/park-center/charge/bill-list',
          routers: [],
        },
        {
          path: '/park-center/charge/deal-list',
          name: '交易记录',
          component: '@/pages/park-center/charge/deal-list',
          routers: [],
        },
        {
          path: '/park-center/charge/deal-list/detail',
          name: '缴费详情',
          hideInMenu: true,
          component: '@/pages/park-center/charge/deal-list/detail',
          routers: [],
        },
        {
          path: '/park-center/charge/menoy-back',
          name: '退款记录',
          component: '@/pages/park-center/charge/menoy-back',
          routers: [],
        },
        {
          path: '/park-center/charge/menoy-back/detail',
          name: '退款详情',
          hideInMenu: true,
          component: '@/pages/park-center/charge/menoy-back/detail',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/check-account',
      name: '对账管理',
      routes: [
        {
          path: '/park-center/check-account/detail-list',
          name: '线上明细对账',
          component: '@/pages/park-center/check-account/detail-list',
          routers: [],
        },
        {
          path: '/park-center/check-account/pay-list',
          name: '线上支付对账',
          component: '@/pages/park-center/check-account/pay-list',
          routers: [],
        },
        {
          path: '/park-center/check-account/error-detail-list',
          name: '异常对账明细',
          component: '@/pages/park-center/check-account/error-detail-list',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/operations-manage',
      name: '运营管理',
      routes: [
        {
          path: '/park-center/operations-manage/merchant-manage',
          name: '商家管理',
          component: '@/pages/park-center/operations-manage/merchant-manage',
          routers: [],
        },
        {
          path: '/park-center/operations-manage/coupon-list',
          name: '优惠券列表',
          component: '@/pages/park-center/operations-manage/coupon-list',
          routers: [],
        },
        {
          path: '/park-center/operations-manage/sale-coupon-list',
          name: '出售优惠券列表',
          component: '@/pages/park-center/operations-manage/sale-coupon-list',
          routers: [],
        },
        {
          path: '/park-center/operations-manage/coupon-usage-record',
          name: '优惠券使用记录',
          component: '@/pages/park-center/operations-manage/coupon-usage-record',
          routers: [],
        },
        {
          path: '/park-center/operations-manage/coupon-issuance-recrod',
          name: '优惠券发放记录',
          component: '@/pages/park-center/operations-manage/coupon-issuance-recrod',
          routers: [],
        },
      ],
    },
    {
      path: '/park-center/passBarrgate',
      name: '异常开闸记录',
      routes: [
        {
          path: '/park-center/passBarrgate/manual-list',
          name: '手动开闸记录',
          component: '@/pages/park-center/passBarrgate/manual-list',
          routers: [],
        },
        {
          path: '/park-center/passBarrgate/abnormal-list',
          name: '异常开闸记录',
          component: '@/pages/park-center/passBarrgate/abnormal-list',
          routers: [],
        },
      ],
    },
  ],
};
export default routers;
