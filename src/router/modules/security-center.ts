// import type { MenuDataItem } from '@ant-design/pro-layout';

// const routers: MenuDataItem = {
//   path: '/security-center',
//   name: '安防中心',
//   icon: 'icon-geren',
//   flatMenu: true,
//   routes: [
//     {
//       path: '/security-center/monitoring-overview',
//       name: '监控概况',
//       component: '@/pages/security-center/monitoring-overview/main',
//     },
//     {
//       path: '/security-center/video-surveillance',
//       name: '视频监控',
//       routes: [
//         {
//           path: '/security-center/video-surveillance/playback-query',
//           name: '实时查询',
//           component: '@/pages/security-center/video-surveillance/playback-query',
//           hideInMenu: true,
//         },
//       ],
//     },
//   ],
// };
// export default routers;

import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  path: '/security-center',
  name: '安防中心',
  icon: 'icon-a-01zuhuguanli',
  flatMenu: true,
  routes: [
    {
      path: '/security-center/monitoring-overview',
      name: '监控概况',
      routes: [
        {
          path: '/security-center/monitoring-overview/main',
          name: '监控概况',
          component: '@/pages/security-center/monitoring-overview/main',
          routers: [],
        },
      ],
    },
    {
      path: '/security-center/video-surveillance',
      name: '视频监控',
      routes: [
        {
          path: '/security-center/video-surveillance/real-time-monitoring',
          name: '实时查询',
          component: '@/pages/security-center/video-surveillance/real-time-monitoring',
          routers: [],
        },
        {
          path: '/security-center/video-surveillance/playback-query',
          name: '回放查询',
          component: '@/pages/security-center/video-surveillance/playback-query',
          routers: [],
        },
      ],
    },
    {
      path: '/security-center/alarm-events',
      name: '告警事件',
      routes: [
        {
          path: '/security-center/alarm-events/alarm-conf',
          name: '告警配置',
          component: '@/pages/security-center/alarm-events/alarm-conf',
          routers: [],
        },
        {
          path: '/security-center/alarm-events/alarm-log',
          name: '告警日志',
          component: '@/pages/security-center/alarm-events/alarm-log',
          routers: [],
        },
      ],
    },
    {
      path: '/security-center/dcs-manage',
      name: '布控管理',
      routes: [
        {
          path: '/security-center/dcs-manage/face-grouping',
          name: '人脸分组管理',
          component: '@/pages/security-center/dcs-manage/face-grouping',
          routers: [],
        },
        {
          path: '/security-center/dcs-manage/dcs-task',
          name: '布控任务管理',
          component: '@/pages/security-center/dcs-manage/dcs-task',
          routers: [],
        },
      ],
    },
    {
      path: '/security-center/inte-retrieval',
      name: '智能检索',
      routes: [
        {
          path: '/security-center/inte-retrieval/pic-find',
          name: '以图找人',
          component: '@/pages/security-center/inte-retrieval/pic-find',
          routers: [],
        },
        {
          path: '/security-center/inte-retrieval/path-find',
          name: '查看轨迹',
          component: '@/pages/security-center/inte-retrieval/path-find',
          routers: [],
        },
      ],
    },
    {
      path: '/security-center/base-info',
      name: '基础信息',
      routes: [
        {
          path: '/security-center/base-info/server-config',
          name: '服务配置',
          component: '@/pages/security-center/base-info/server-config',
          routers: [],
        },
      ],
    },
  ],
};
export default routers;
