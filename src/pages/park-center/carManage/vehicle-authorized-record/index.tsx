import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getOperateLogList, parkYardListByPage } from '@/services/park';
import { AuthOpertionSattus, BusinessType, OperationType } from '../data.d';
import { history } from 'umi';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getOperateLogList(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const columns: ProColumns<OperateLogType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      request: queryParkList,
      order: 4,
      hideInTable: true,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      order: 3,
      hideInTable: true,
    },
    {
      title: '操作类型',
      dataIndex: 'operateType',
      valueEnum: OperationType,
      order: 2,
      hideInTable: true,
    },
    {
      title: '操作时间',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (item) => {
          return {
            startTime: item[0] + ' 00:00:00',
            endTime: item[1] + ' 23:59:59',
          };
        },
      },
      order: 1,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      ellipsis: true,
      search: false,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作类型',
      dataIndex: 'operateType',
      ellipsis: true,
      valueEnum: OperationType,
      search: false,
    },
    {
      title: '业务类型',
      dataIndex: 'operateBusiness',
      valueEnum: BusinessType,
      ellipsis: true,
      search: false,
    },
    {
      title: '套餐名称',
      dataIndex: 'packageName',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作渠道',
      dataIndex: 'operateSource',
      ellipsis: true,
      valueEnum: {
        1: '小程序',
        2: '平台',
      },
      search: false,
    },
    {
      title: '下发状态',
      dataIndex: 'distribute',
      ellipsis: true,
      valueEnum: AuthOpertionSattus,
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作时间',
      dataIndex: 'gmtOperated',
      ellipsis: true,
      search: false,
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
      <ProTable<OperateLogType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
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
        dateFormatter="string"
      />
    </PageContainer>
  );
};
