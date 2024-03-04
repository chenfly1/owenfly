import ActionGroup from '@/components/ActionGroup';
import { getBillErr, parkYardListByPage } from '@/services/park';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import { useRef } from 'react';
import DetailDrawer from './detail-drawer';
import BusinessForm from './manual-drawer/business-form';
import ThreeForm from './manual-drawer/three-form';
import AmountForm from './manual-drawer/amount-form';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const actionRef = useRef<ActionType>();
  const detailDrawerRef = useRef<any>();
  const businessFormRef = useRef<any>();
  const threeFormRef = useRef<any>();
  const amountFormRef = useRef<any>();

  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const columns: ProColumns<BillErrListItem>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      valueType: 'select',
      request: queryParkList,
      order: 4,
    },
    {
      title: '车场订单编号',
      dataIndex: 'orderId',
      hideInSearch: true,
    },
    {
      title: '车场订单编号',
      dataIndex: 'orderCode',
      hideInTable: true,
      order: 3,
    },
    {
      title: '三方交易订单号',
      dataIndex: 'thirdOrderId',
      search: false,
    },
    {
      title: '交易完成时间',
      dataIndex: 'paySuccessTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '车场支付金额（元）',
      dataIndex: 'payAmount',
      search: false,
    },
    {
      title: '三方交易金额（元）',
      dataIndex: 'thirdTotalAmount',
      search: false,
    },
    {
      title: '收费科目',
      dataIndex: 'checkType',
      order: 2,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '停车费',
        },
        2: {
          text: '月租费',
        },
      },
    },
    {
      title: '对账日期',
      dataIndex: 'chkDate',
      valueType: 'date',
      order: 1,
    },
    {
      title: '异常类型',
      dataIndex: 'errType',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '金额不齐',
        },
        2: {
          text: '业务单边',
        },
        3: {
          text: '三方单边',
        },
      },
    },
    {
      title: '对账结果',
      dataIndex: 'chkResult',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '差错账',
        },
        2: {
          text: '跨日账',
        },
      },
    },
    {
      title: '处理状态',
      dataIndex: 'transState',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: '待处理 ',
          status: 'Warning',
        },
        1: {
          text: '已处理',
          status: 'Success',
        },
      },
    },
    {
      title: '操作',
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'info',
                text: '详情',
                accessKey: 'alitaParking_BillChkOnlinepayErrController.detail',
                hidden: false,
                onClick: async () => {
                  detailDrawerRef.current.open(record.id);
                },
              },
              {
                key: 'manual',
                text: '人工核销',
                accessKey: 'alitaParking_BillChkOnlinepayErrController.review',
                hidden: false,
                disabled: record.transState === 1,
                onClick: async () => {
                  if (record.errType === 1) {
                    amountFormRef.current.open(record);
                  } else if (record.errType === 2) {
                    businessFormRef.current.open(record);
                  } else if (record.errType === 3) {
                    threeFormRef.current.open(record);
                  }
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: any) => {
    const tParams = {
      ...params,
      pageNo: params.current,
    };
    const res = await getBillErr(tParams);
    // await getBillErr(tParams);
    // const res = await Promise.resolve({
    //   data: {
    //     elements: [
    //       {
    //         id: 1,
    //         parkId: '1',
    //         payAmount: 1,
    //         errType: 1,
    //         orderId: '1',
    //       },
    //       {
    //         id: 2,
    //         parkId: '2',
    //         payAmount: 1,
    //         errType: 2,
    //         orderId: '2',
    //       },
    //       {
    //         id: 3,
    //         parkId: '3',
    //         payAmount: 1,
    //         errType: 3,
    //         orderId: '3',
    //       },
    //     ],
    //     total: 1,
    //   },
    //   code: 'SUCCESS',
    // });
    return {
      data: res.data?.elements.map((item: any) => ({
        ...item,
        payAmount: item.payAmount / 100 || '-',
        thirdTotalAmount: item.thirdTotalAmount / 100 || '-',
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 100,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        dateFormatter="string"
      />
      <DetailDrawer ref={detailDrawerRef} />
      <BusinessForm
        ref={businessFormRef}
        onOk={() => {
          actionRef.current?.reload();
        }}
      />
      <ThreeForm
        ref={threeFormRef}
        onOk={() => {
          actionRef.current?.reload();
        }}
      />
      <AmountForm
        ref={amountFormRef}
        onOk={() => {
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};
