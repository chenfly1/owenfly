import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { history } from 'umi';
import Detail from './detail';
import ActionGroup from '@/components/ActionGroup';
import { invoiceList } from '@/services/payment';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<InvoiceListType>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    if (params.dateRange) {
      params.entryStartTime = params.dateRange[0] + ' 00:00:00';
      params.entryEndTime = params.dateRange[1] + ' 23:59:59';
    }
    const res = await invoiceList(params);
    return {
      data: res.data?.elements || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const columns: ProColumns<InvoiceListType>[] = [
    {
      title: '资料编号',
      dataIndex: 'code',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '商户名称',
      dataIndex: 'userName',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      ellipsis: true,
      hideInTable: true,
    },
    {
      title: '抬头名称',
      dataIndex: 'title',
      ellipsis: true,
      hideInTable: true,
    },

    {
      title: '资料编号',
      dataIndex: 'code',
      ellipsis: true,
      search: false,
    },
    {
      title: '提交时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '提交用户',
      dataIndex: 'userName',
      ellipsis: true,
      search: false,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      ellipsis: true,
      search: false,
    },
    {
      title: '用户房产',
      dataIndex: 'room',
      ellipsis: true,
      search: false,
    },
    {
      title: '抬头名称',
      dataIndex: 'title',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                text: '详情',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<InvoiceListType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={
          {
            labelWidth: 88,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
      />

      <Detail open={drawerVisit} onOpenChange={setDrawerVisit} data={modalData} />
    </PageContainer>
  );
};
