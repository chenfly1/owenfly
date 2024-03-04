import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef } from 'react';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import {
  deleteNoticeTask,
  getNoticeTaskList,
  getNoticeTempList,
  updateNoticeTaskStatus,
} from '@/services/notice';
import { history } from 'umi';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const reload = () => {
    actionRef.current?.reload();
  };

  const updateStatus = async (params: Record<string, any>) => {
    const res = await updateNoticeTaskStatus(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功');
      reload();
      return true;
    }
    return false;
  };

  // 删除行数据
  const deleteRow = async (row: Record<string, any>) => {
    const bid = row.bid;
    const res = await deleteNoticeTask({ bid });
    if (res.code === 'SUCCESS') {
      message.success('删除成功！');
      reload();
      return true;
    }
    return false;
  };
  const getNoticeList = async () => {
    const res = await getNoticeTempList({
      pageNo: 1,
      pageSize: 1000,
      status: 1,
    });
    return (res.data.items || []).map((item: any) => ({
      ...item,
      label: item.templateName,
      value: item.bid,
    }));
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '消息ID',
      dataIndex: 'msgBid',
      ellipsis: true,
    },
    {
      title: '模版名称',
      dataIndex: 'templateName',
      ellipsis: true,
    },
    {
      title: '发送方式',
      dataIndex: 'sendType',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        immediate: '直接发送',
        waitingForCall: '触发发送',
        singleSchedule: '单次定时',
        cycleSchedule: '周期循环',
      },
    },
    {
      title: '发送渠道',
      dataIndex: 'channelType',
      ellipsis: true,
      valueEnum: {
        WECHAT_OFFICIAL_ACCOUNT: '微信服务号',
        MINI_MAIL: '小程序站内',
        WEB_MAIL: 'web站内信',
        SMS: '短信',
      },
    },
    {
      title: '消息来源',
      dataIndex: 'msgSource',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: '停发',
        },
        1: {
          text: '开启',
        },
      },
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
                key: 'view',
                text: '查看详情',
                onClick() {
                  history.push({
                    pathname: '/notice-center/notice-task/add',
                    query: {
                      id: record.bid,
                      isView: 'true',
                    },
                  });
                },
              },
              {
                key: 'active',
                text: '开启',
                hidden: record.status === 1,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定开启吗？',
                    centered: true,
                    onOk: async () => {
                      return updateStatus({ bid: record.bid, status: 1 });
                    },
                  });
                },
              },
              {
                key: 'unactive',
                text: '停发',
                hidden: record.status === 0,
                danger: true,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定停用吗？',
                    centered: true,
                    onOk: async () => {
                      return updateStatus({ bid: record.bid, status: 0 });
                    },
                  });
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
    const res = await getNoticeTaskList(params);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const toolBarRender = () => {
    return [
      <Button
        key="add"
        onClick={() => {
          history.push('/notice-center/notice-task/add');
        }}
        icon={<PlusOutlined />}
        type="primary"
      >
        新建发送任务
      </Button>,
    ];
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable
        form={{
          colon: false,
        }}
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        toolBarRender={toolBarRender}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};
