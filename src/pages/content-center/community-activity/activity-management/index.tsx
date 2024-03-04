import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';

import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import { Access, history, useAccess } from 'umi';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';

import { activityOnline, queryActivityPage } from '@/services/content';
import { getProjectAllList } from '@/services/mda';
import ActionGroup from '@/components/ActionGroup';
import QrcodeView from './qrcode';

const { confirm } = Modal;

const valueEnum = {
  PENDING: {
    text: '待报名',
  },
  SIGN_UP: {
    text: '报名中',
  },
  WAITING: {
    text: '待开始',
  },
  RUNNING: {
    text: '进行中',
  },
  FINISH: {
    text: '已结束',
  },
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };

  const activeHandle = async (row: ActivityType) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: `${row.status ? '是否确认下线该活动？' : '是否确认上线该活动？'}`,
      content: `${
        row.status
          ? `活动当前处于【${valueEnum[row.runStatus]?.text}】状态，已有【${
              row.signUpUserCount
            }】人报名。活动下线后不可重新上线，请谨慎选择。`
          : '活动一经上线相关信息不可更改，请确认活动内容准确无误。'
      }`,
      centered: true,
      onOk: async () => {
        const res = await activityOnline({ id: row.id, status: row.status ? 2 : 1 });
        if (res.code === 'SUCCESS') {
          actionRef.current?.reload();
          message.success('操作成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: ProColumns<ActivityType>[] = [
    {
      title: '活动编号',
      dataIndex: 'code',
      width: 140,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      width: 160,
      search: false,
      ellipsis: true,
    },
    {
      title: '活动标题',
      dataIndex: 'title',
      width: 260,
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 160,
      ellipsis: true,
      render: (_, record) => [
        <span key="creatorAccount">
          {record.creator}（{record.creatorAccount}）
        </span>,
      ],
    },
    {
      title: '关联项目',
      dataIndex: 'projectBid',
      ellipsis: true,
      width: 160,
      valueType: 'select',
      request: async () => {
        const res = await getProjectAllList();
        console.log(res);
        return (res.data.items as any).map((i: any) => ({
          value: i.bid,
          label: i.name,
        }));
      },
    },
    {
      title: '上/下线',
      dataIndex: 'status',
      width: 120,
      ellipsis: true,
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '下线',
          status: 'Error',
        },
      },
    },
    {
      title: '上/下线',
      dataIndex: 'status',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '下线',
          status: 'Error',
        },
        2: {
          text: '下线',
          status: 'Error',
        },
      },
    },
    {
      title: '活动状态',
      dataIndex: 'runStatus',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      valueEnum: valueEnum,
    },
    {
      title: '报名人数',
      dataIndex: 'signUpCount',
      width: 120,
      search: false,
      ellipsis: true,
      render: (_, record) => [
        access.functionAccess('alitaContent_activityUser.query') ? (
          <a
            key="count"
            onClick={() => {
              history.push(
                `/content-center/community-activity/activity-management/member/${record.id}`,
              );
            }}
          >
            {record.signUpCount}
          </a>
        ) : (
          <span>{record.signUpCount}</span>
        ),
      ],
    },
    {
      title: '签到人数',
      dataIndex: 'signInCount',
      width: 120,
      search: false,
      ellipsis: true,
      render: (_, record) => [
        record.needSignIn ? (
          access.functionAccess('alitaContent_activityUser.query') ? (
            <a
              key="counts"
              onClick={() => {
                history.push(
                  `/content-center/community-activity/activity-management/member/${record.id}`,
                );
              }}
            >
              {record.signInCount}
            </a>
          ) : (
            <span>{record.signInCount}</span>
          )
        ) : (
          <span>-</span>
        ),
      ],
    },
    {
      title: '签到率',
      dataIndex: 'singInRate',
      width: 160,
      search: false,
      ellipsis: true,
      render: (_, record) => [
        <span key="singInRate">{record.needSignIn ? record.singInRate + ' %' : '-'} </span>,
      ],
    },
    {
      title: '操作',
      fixed: 'right',
      width: 180,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '查看',
                accessKey: 'alitaContent_activity.query',
                onClick() {
                  history.push(
                    `/content-center/community-activity/activity-management/add?id=${record.id}&pageType=view`,
                  );
                },
              },
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaContent_activity.edit',
                hidden: record.status !== 0,
                onClick() {
                  history.push(
                    `/content-center/community-activity/activity-management/add?id=${record.id}&pageType=edit`,
                  );
                },
              },
              {
                key: 'down',
                text: '下线',
                accessKey: 'alitaContent_activity.online',
                hidden: !record.status || record.status === 2,
                danger: true,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'up',
                text: '上线',
                accessKey: 'alitaContent_activity.online',
                hidden: !!record.status,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'qrcode',
                text: '签到二维码',
                accessKey: 'alitaContent_activity.query.qrcode',
                hidden: !record.needSignIn || record.status === 2,
                onClick() {
                  setEditData(record);
                  setAddModalVisit(true);
                },
              },
              {
                key: 'result',
                text: '活动结果发布',
                accessKey: 'alitaContent_[addArticle, editArticle, activity.edit]',
                hidden: record.status !== 1,
                onClick() {
                  if (record.articleId) {
                    history.push(
                      `/content-center/content-services/articles?formType=activity&activityId=${record.id}&id=${record.articleId}`,
                    );
                  } else {
                    history.push(
                      `/content-center/content-services/articles?formType=activity&activityId=${record.id}`,
                    );
                  }
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    const msg = await queryActivityPage({
      ...params,
      pageNo: params.current,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<ActivityType>
        columns={columns}
        className="tableStyle"
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
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaContent_activity.edit')}>
            <Button
              key="button"
              onClick={() => {
                history.push(`/content-center/community-activity/activity-management/add`);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建
            </Button>
          </Access>,
        ]}
      />
      <QrcodeView
        open={addModalVisit}
        onOpenChange={setAddModalVisit}
        onSubmit={reload}
        data={editData}
      />
    </PageContainer>
  );
};
