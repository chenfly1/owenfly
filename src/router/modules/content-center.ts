import type { MenuDataItem } from '@ant-design/pro-layout';

const routers: MenuDataItem = {
  name: '内容服务',
  //   icon: 'icon-a-01zuhuguanli',
  path: '/content-center',
  flatMenu: true,
  routes: [
    {
      path: '/content-center/content-services',
      name: '内容管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/content-center/content-services/articles',
          name: '文章管理',
          component: '@/pages/content-center/content-services/articles',
          routes: [],
        },
        {
          path: '/content-center/content-services/talk',
          name: '话题管理',
          component: '@/pages/content-center/content-services/talk',
          routes: [],
        },
        {
          path: '/content-center/content-services/talk-connect/:id',
          name: '话题内容管理',
          hideInMenu: true,
          component: '@/pages/content-center/content-services/talk/talk-connect',
          routes: [],
        },
      ],
    },
    {
      path: '/content-center/author',
      name: '作者管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/content-center/author/list',
          name: '内部作者',
          component: '@/pages/content-center/author',
          routes: [],
        },
      ],
    },
    {
      path: '/content-center/marketing-management',
      name: '营销管理',
      icon: 'icon-geren',
      routes: [
        {
          path: '/content-center/marketing-management/owner-marketing',
          name: '住户端营销',
          component: '@/pages/content-center/marketing-management/owner-marketing',
        },
        {
          path: '/content-center/marketing-management/staff-marketing',
          name: '员工端营销',
          component: '@/pages/content-center/marketing-management/staff-marketing',
        },
      ],
    },
    {
      path: '/content-center/community-activity',
      name: '社区活动',
      icon: 'icon-geren',
      routes: [
        {
          path: '/content-center/community-activity/activity-management/add',
          name: '活动新建',
          hideInMenu: true,
          component: '@/pages/content-center/community-activity/activity-management/add',
          routes: [],
        },
        {
          path: '/content-center/community-activity/activity-management/member/:id',
          name: '活动成员管理',
          hideInMenu: true,
          component: '@/pages/content-center/community-activity/activity-management/member',
          routes: [],
        },
        {
          path: '/content-center/community-activity/activity-management',
          name: '活动管理',
          component: '@/pages/content-center/community-activity/activity-management',
          routes: [],
        },
      ],
    },
  ],
};
export default routers;
