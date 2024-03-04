import ActionGroup from '@/components/ActionGroup';
import { parkYardListByPage, refundRecord } from '@/services/park';
import { Method } from '@/utils';
import { ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { history } from 'umi';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [exporting, setExporting] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };
  const columns: ProColumns<RefundRecordType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      valueType: 'select',
      request: queryParkList,
      hideInTable: true,
      order: 7,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      hideInTable: true,
      order: 6,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      hideInTable: true,
      order: 5,
    },
    {
      title: '退款方式',
      dataIndex: 'refundType',
      hideInTable: true,
      valueEnum: {
        '00': '现金',
        '01': '微信',
        '02': '支付宝',
        '13': '钱包',
      },
      order: 4,
    },
    {
      title: '停车订单号',
      dataIndex: 'orderId',
      order: 3,
      hideInTable: true,
    },
    {
      title: '退款状态',
      dataIndex: 'refundStatus',
      hideInTable: true,
      order: 2,
      valueEnum: {
        '1': '退款中',
        '2': '已退款',
        '3': '退款失败',
      },
    },
    {
      title: '退款完成时间',
      dataIndex: 'refundEndTime',
      order: 1,
      valueType: 'dateRange',
      search: {
        transform: (item) => {
          return {
            startTime: item[0],
            endTime: item[1],
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '第三方交易流水号',
      dataIndex: 'thirdNo',
      order: 0,
      hideInTable: true,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      ellipsis: true,
      search: false,
    },
    {
      title: '车牌号',
      dataIndex: 'plate',
      ellipsis: true,
      search: false,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      ellipsis: true,
      search: false,
    },
    {
      title: '退款状态',
      dataIndex: 'refundStatus',
      valueEnum: {
        '1': '退款中',
        '2': '已退款',
        '3': '退款失败',
      },
      ellipsis: true,
      search: false,
    },
    {
      title: '退款金额(元)',
      dataIndex: 'refundAmount',
      ellipsis: true,
      search: false,
    },
    {
      title: '退款方式',
      dataIndex: 'refundMethod',
      valueEnum: {
        '00': '现金',
        '01': '微信',
        '02': '支付宝',
        '13': '钱包',
      },
      ellipsis: true,
      search: false,
    },
    {
      title: '订单生成时间',
      dataIndex: 'refundStartTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '退款完成时间',
      dataIndex: 'refundEndTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'refundUser',
      ellipsis: true,
      search: false,
    },
    {
      title: '停车订单号',
      dataIndex: 'orderId',
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
                text: '详情',
                key: 'detail',
                onClick() {
                  history.push({
                    pathname: '/park-center/charge/menoy-back/detail',
                    query: { id: row?.id, refundType: row.refundType },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    const res = await refundRecord(params);
    return {
      data: (res.data?.elements || []).map((item) => ({
        ...item,
        refundAmount: item.refundAmount ? (item.refundAmount / 100).toFixed(2) : 0,
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
    };
    Method.exportExcel(
      `/parking/mng/refund_record/export`,
      `退款记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'GET',
    ).finally(() => {
      setExporting(false);
    });
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
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={queryList}
        rowKey="areaNum"
        search={
          {
            labelWidth: 90,
            labelAlign: 'left',
          } as any
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            limit={2}
            actions={[
              {
                key: 'export',
                text: '导出',
                loading: exporting,
                onClick() {
                  exportClick();
                },
              },
            ]}
          />
        }
        dateFormatter="string"
      />
    </PageContainer>
  );
};
