import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';

import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Access, useParams, history, useAccess } from 'umi';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';

const { confirm } = Modal;
import {
  activitySignIn,
  activitySignUpCancel,
  getActivityDetails,
  queryActivityUserPage,
} from '@/services/content';
import ActionGroup from '@/components/ActionGroup';
import styles from './style.less';
import DataMasking from '@/components/DataMasking';
import Add from './ownerApply';

export default () => {
  const actionRef = useRef<ActionType>();
  const params: { id: string } = useParams();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const [detailsModalVisit, setDetailsModalVisit] = useState<ActivityType>();
  const [activityStatus, setActivityStatus] = useState<string>('');
  const [title, settitle] = useState<string>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };
  console.log(params.id);
  useEffect(() => {
    const getActivityDetail = async () => {
      getActivityDetails(params.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          settitle(res.data.title);
          setDetailsModalVisit(res.data);
          setActivityStatus(res.data.runStatus);
        }
      });
    };
    getActivityDetail();
  }, [params.id]);

  // 取消报名
  const handleCancel = (row: ActivityType) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确认是否取消报名',
      // content: (
      // ),
      centered: true,
      onOk: async () => {
        const res = await activitySignUpCancel({
          activityId: params.id,
          accountType: 'B',
          id: row.id,
        });
        if (res.code === 'SUCCESS') {
          actionRef?.current?.reload();
          message.success('取消报名成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleSignIn = async (row: ActivityType) => {
    const res = await activitySignIn({
      activityId: params.id,
      accountType: 'B',
      id: row.id,
    });
    if (res.code === 'SUCCESS') {
      actionRef.current?.reload();
      message.success('签到成功');
    }
  };

  const columns: ProColumns<ActivityType>[] = [
    {
      title: '报名人',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '报名人手机号',
      dataIndex: 'phone',
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.phone} text={record.phone} />],
    },
    {
      title: '报名时间',
      dataIndex: 'gmtCreated',
      search: false,
    },
    {
      title: '报名人数',
      dataIndex: 'signUpCount',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
    },
    {
      title: '是否签到',
      dataIndex: 'signInStatus',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '是',
          status: 'success',
        },
        0: {
          text: '否',
          status: 'error',
        },
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'cancel',
                text: '取消报名',
                // accessKey: 'alitaContent_relateTopicContent_B',
                hidden: activityStatus !== 'SIGN_UP',
                onClick() {
                  handleCancel(record);
                },
              },
              {
                key: 'signIn',
                text: '签到',
                hidden: !['RUNNING', 'FINISH'].includes(activityStatus) || record.signInStatus,
                // accessKey: 'alitaContent_queryArticle',
                onClick() {
                  handleSignIn(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (param: Record<string, any>) => {
    const msg = await queryActivityUserPage({
      ...param,
      pageNo: param.current,
      activityId: params.id,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  const routes = [
    {
      path: '/content-center/community-activity',
      breadcrumbName: '社区管理',
    },
    {
      path: '/content-center/community-activity/activity-management',
      breadcrumbName: '活动管理',
    },
    {
      path: '/content-center/community-activity/activity-management/member',
      breadcrumbName: '活动人员管理',
    },
  ];

  return (
    <PageContainer
      header={{
        title: `${title}`,
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },
        // title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<ActivityType>
        columns={columns}
        className={styles.cardStyle}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 90,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          activityStatus === 'SIGN_UP' ? (
            // <Access key="add" accessible={access.functionAccess('alitaContent_relateTopicContent')}>
            <Button
              key="button"
              onClick={() => {
                setAddModalVisit(true);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              帮业主报名
            </Button>
          ) : // </Access>
          null,
        ]}
      />
      <Add
        open={addModalVisit}
        onOpenChange={setAddModalVisit}
        onSubmit={reload}
        data={detailsModalVisit}
      />
    </PageContainer>
  );
};
