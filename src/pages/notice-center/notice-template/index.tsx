import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import {
  batchDeleteNotTemplate,
  deleteNoticeTemp,
  getNoticeChannelList,
  getNoticeTempList,
  updateStatusNoticeTemp,
} from '@/services/notice';
import { history } from 'umi';
import DetailModal from './detail';
import dayjs from 'dayjs';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const reload = () => {
    actionRef.current?.reload();
  };

  const getChannelList = async () => {
    const res = await getNoticeChannelList({
      pageNo: 1,
      pageSize: 100,
    });

    return res.data.items.map((item: any) => {
      return {
        label: item.channelName,
        value: item.bid,
      };
    });
  };

  // 删除行数据
  const deleteRow = async (row: Record<string, any>) => {
    const bid = row.bid;
    const res = await deleteNoticeTemp({ bid });
    if (res.code === 'SUCCESS') {
      message.success('删除成功！');
      reload();
      return true;
    }
    return false;
  };

  const updateStatus = async (params: Record<string, any>) => {
    const res = await updateStatusNoticeTemp(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功');
      reload();
      return true;
    }
    return false;
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '起止时间',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      search: {
        transform: (item) => {
          return {
            startTime: dayjs(item[0]).valueOf(),
            endTime: dayjs(item[1]).valueOf(),
          };
        },
      },
      order: 1,
      hideInTable: true,
    },
    {
      title: '模版ID',
      dataIndex: 'bid',
      ellipsis: true,
      order: 5,
    },
    {
      title: '模版名称',
      dataIndex: 'templateName',
      ellipsis: true,
      order: 4,
    },
    {
      title: '渠道类型',
      dataIndex: 'channelType',
      ellipsis: true,
      valueType: 'select',
      hideInSearch: true,
      request: async () => {
        return [
          {
            label: '微信服务号',
            value: 'WECHAT_OFFICIAL_ACCOUNT',
          },
          {
            label: '小程序站内',
            value: 'MINI_MAIL',
          },
          {
            label: 'web站内信',
            value: 'WEB_MAIL',
          },
          {
            label: '短信',
            value: 'SMS',
          },
        ];
      },
    },
    {
      title: '渠道名称（账号）',
      dataIndex: 'channelBid',
      ellipsis: true,
      valueType: 'select',
      order: 2,
      request: getChannelList,
    },
    {
      title: '创建者',
      dataIndex: 'gmtCreator',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '模板状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      order: 3,
      valueEnum: {
        1: {
          text: '可用',
        },
        0: {
          text: '禁用',
        },
      },
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      search: false,
      render: (_, record) => {
        const disabled = ['WECHAT_OFFICIAL_ACCOUNT', 'SMS'].includes(record.channelType);
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '查看详情',
                onClick() {
                  setDetailData(record);
                  setDetailOpen(true);
                },
              },
              {
                key: 'edit',
                text: '编辑',
                disabled,
                onClick() {
                  history.push({
                    pathname: '/notice-center/notice-template/add',
                    query: {
                      id: record.bid,
                    },
                  });
                },
              },
              {
                key: 'active',
                text: '启用',
                hidden: record.status === 1,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定启用吗？',
                    centered: true,
                    onOk: async () => {
                      return updateStatus({ bid: record.bid, status: 1 });
                    },
                  });
                },
              },
              {
                key: 'unactive',
                text: '停用',
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
    const res = await getNoticeTempList(params);
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
          history.push('/notice-center/notice-template/add');
        }}
        icon={<PlusOutlined />}
        type="primary"
      >
        新建
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
        rowKey="bid"
        search={
          {
            labelWidth: 105,
            labelAlign: 'left',
          } as any
        }
        toolBarRender={toolBarRender}
        pagination={{
          showSizeChanger: true,
        }}
        tableAlertRender={false}
        rowSelection={{
          type: 'checkbox',
          alwaysShowAlert: false,
          selectedRowKeys,
          onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            selection={{
              count: selectedRowKeys.length,
            }}
            limit={2}
            actions={[
              {
                key: 'batchDelete',
                text: '批量删除',
                onClick() {
                  if (selectedRowKeys.length === 0) {
                    message.warning('请先勾选模板');
                    return;
                  }
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定批量删除吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await batchDeleteNotTemplate({
                        bids: selectedRowKeys,
                      });
                      if (res.code === 'SUCCESS') {
                        message.success('删除成功');
                        reload();
                      }
                      return res;
                    },
                  });
                },
              },
            ]}
          />
        }
      />
      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSubmit={() => {}}
        data={detailData}
      />
    </PageContainer>
  );
};
