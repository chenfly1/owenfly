import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';

import { ProTable } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useRef, useState } from 'react';
import { Access, history, useAccess } from 'umi';
import { PlusOutlined } from '@ant-design/icons';

import AddModelForm from './add';
import { onlineTopic, queryTopicPage } from '@/services/content';
import { getProjectAllList } from '@/services/mda';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };

  const activeHandle = async (row: TopicContentPageType) => {
    const res = await onlineTopic({ id: row.id, status: row.status ? 0 : 1 });
    if (res.code === 'SUCCESS') {
      actionRef.current?.reload();
      message.success('操作成功');
    }
  };

  const columns: ProColumns<TopicContentPageType>[] = [
    {
      title: '话题编号',
      dataIndex: 'code',
      width: 140,
      order: 4,

      ellipsis: true,
    },
    {
      title: '话题标题',
      dataIndex: 'title',
      width: 260,

      order: 1,
      ellipsis: true,
    },
    {
      title: '创建人账号',
      dataIndex: 'creatorAccount',
      width: 150,

      order: 3,
      ellipsis: true,
    },
    {
      title: '创建人姓名',
      dataIndex: 'creator',
      width: 160,

      order: 2,
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
      title: '最近修改时间',
      dataIndex: 'modifyTime',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '关联项目',
      dataIndex: 'projectBid',

      filters: false,
      ellipsis: true,
      order: 0,
      valueType: 'select',
      hideInTable: true,
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
      title: '关联项目',
      dataIndex: 'projectNames',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '话题内容量',
      dataIndex: 'count',
      width: 120,

      search: false,
      ellipsis: true,
      render: (_, record) => [
        <a
          key="count"
          onClick={() => {
            history.push(`/content-center/content-services/talk-connect/${record.id}`);
          }}
        >
          {record.count}
        </a>,
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,

      ellipsis: true,
      search: false,
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
      title: '操作',
      fixed: 'right',
      width: 100,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaContent_editTopic',
                onClick() {
                  setEditData(record);
                  setAddModalVisit(true);
                },
              },
              {
                key: 'down',
                text: '下线',
                accessKey: 'alitaContent_onlineTopic',
                hidden: !record.status,
                danger: true,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'up',
                text: '上线',
                accessKey: 'alitaContent_onlineTopic',
                hidden: !!record.status,
                onClick() {
                  activeHandle(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    const msg = await queryTopicPage({
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
      <ProTable<TopicContentPageType>
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
            labelWidth: 85,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaContent_addTopic')}>
            <Button
              key="button"
              onClick={() => {
                setEditData({});
                setAddModalVisit(true);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建话题
            </Button>
          </Access>,
        ]}
      />
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />
    </PageContainer>
  );
};
