import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';
import { useRef, useState } from 'react';
import View from './view';
import { getFeedbackPage } from '@/services/auth';
import { getQueryByPage } from '@/services/wps';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [viewData, setViewData] = useState<Record<string, any>>();

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '所属租户',
      dataIndex: 'tenantId',
      ellipsis: true,
      valueType: 'select',
      hideInTable: true,
      request: async () => {
        const msg = await getQueryByPage({
          pageNo: 1,
          pageSize: 10000,
        });
        return (
          msg.data.items &&
          msg.data.items.map((item) => ({
            value: item.code,
            label: item.name,
          }))
        );
      },
    },
    {
      title: '所属租户',
      dataIndex: 'tenant',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '用户昵称',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '用户手机号',
      dataIndex: 'userPhone',
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.userPhone} text={record.userPhone} />],
    },
    {
      title: '反馈时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '反馈时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            gmtCreatedStart: value[0] + ' 00:00:00',
            gmtCreatedEnd: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '反馈内容',
      dataIndex: 'text',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 100,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '详情',
                onClick() {
                  setViewData(record);
                  setViewOpen(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const reload = () => {
    actionRef.current?.reload();
  };

  const getByPage = async (params: Record<string, any>) => {
    params.pageNo = params.current;
    const res = await getFeedbackPage(params);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
      />
      <View open={viewOpen} onOpenChange={setViewOpen} data={viewData} />
    </PageContainer>
  );
};
