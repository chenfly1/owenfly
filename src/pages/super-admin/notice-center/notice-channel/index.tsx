import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef, useState } from 'react';
import Add from './add';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { deleteNoticeChannel, getNoticeChannelList, getNoticeTypeList } from '@/services/notice';
import Task from './task';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [taskOpen, setTaskOpen] = useState<boolean>(false);
  const [addData, setAddData] = useState<Record<string, any>>();
  const [taskData, setTaskData] = useState<Record<string, any>>();

  const reload = () => {
    actionRef.current?.reload();
  };

  // 渠道类型
  const getChannelTypeList = async () => {
    const res = await getNoticeTypeList();
    return res.data.map((item: any) => ({
      label: item.channelTypeDesc,
      value: item.channelType,
    }));
  };

  // 删除行数据
  const deleteRow = async (row: Record<string, any>) => {
    const bid = row.bid;
    const res = await deleteNoticeChannel({ bid });
    if (res.code === 'SUCCESS') {
      message.success('删除成功！');
      reload();
      return true;
    }
    return false;
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '渠道名称（账号）',
      dataIndex: 'channelName',
      ellipsis: true,
      order: 2,
    },
    {
      title: '渠道ID',
      dataIndex: 'channelBid',
      ellipsis: true,
      hideInTable: true,
      order: 1,
    },
    {
      title: '渠道ID',
      dataIndex: 'bid',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '渠道类型',
      dataIndex: 'channelType',
      ellipsis: true,
      valueType: 'select',
      request: getChannelTypeList,
      order: 0,
    },
    {
      title: '参数',
      dataIndex: 'params',
      ellipsis: true,
      hideInSearch: true,
      width: 500,
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  setAddData(record);
                  setAddOpen(true);
                },
              },
              {
                key: 'task',
                text: '分配租户',
                onClick() {
                  setTaskData(record);
                  setTaskOpen(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除吗？',
                    centered: true,
                    onOk: async () => {
                      return deleteRow(record);
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    params.pageNo = params.current;
    const res = await getNoticeChannelList(params);
    return {
      data: (res.data?.items || []).map((item) => ({
        ...item,
        params: `appId: ${item.appId}, appSecret: ${item.appSecret}, key: ${item.key}, smsSecret: ${item.smsSecret}`,
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const toolBarRender = () => {
    return [
      <Button
        key="add"
        onClick={() => {
          setAddData({});
          setAddOpen(true);
        }}
        icon={<PlusOutlined />}
        type="primary"
      >
        新建渠道
      </Button>,
    ];
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={getByPage}
        rowKey="bid"
        search={
          {
            labelWidth: 110,
            labelAlign: 'left',
          } as any
        }
        toolBarRender={toolBarRender}
        pagination={{
          showSizeChanger: true,
        }}
      />
      <Add open={addOpen} onOpenChange={setAddOpen} onSubmit={reload} data={addData} />
      <Task open={taskOpen} onOpenChange={setTaskOpen} onSubmit={reload} data={taskData} />
    </PageContainer>
  );
};
