import { history } from 'umi';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { parkTitles } from '@/pages/park-center/utils/constant';
import { getUnusualReleaseList, parkYardListByPage } from '@/services/park';
import ActionGroup from '@/components/ActionGroup';
import Detail from '../components/detail';
import { useState } from 'react';

export default () => {
  const [open, setOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getUnusualReleaseList(params);
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
      // state: '1',
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const columns: ProColumns<UnusualReleaseRecordQueryType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      hideInTable: true,
      request: queryParkList,
      order: 4,
    },
    {
      title: '车牌号',
      dataIndex: 'plate',
      hideInTable: true,
      order: 3,
    },
    {
      title: '出场时间',
      dataIndex: 'dataRange',
      valueType: 'dateRange',
      search: {
        transform: (item) => {
          return {
            startTime: item[0] + ' 00:00:00',
            endTime: item[1] + ' 23:59:59',
          };
        },
      },
      hideInTable: true,
      order: 2,
    },
    {
      title: '开闸原因',
      dataIndex: 'reason',
      order: 1,
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
      title: '出场通道',
      dataIndex: 'passageName',
      search: false,
      ellipsis: true,
    },
    {
      title: '出场时间',
      dataIndex: 'exitTime',
      ellipsis: true,
      search: false,
    },

    {
      title: '放行类型',
      dataIndex: 'passageModel',
      ellipsis: true,
      search: false,
      valueEnum: {
        0: '未知',
        1: '自动放行',
        2: '确认放行',
        3: '异常放行',
        4: '遥控开闸',
        5: '自助开闸',
        6: '可疑跟车',
        7: '盘点进场',
        8: '离线自动放行',
        9: '离线遥控放行',
        98: '盘点离场',
        99: '虚拟放行',
        // 离场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
      },
    },
    {
      title: '放行原因',
      dataIndex: 'reason',
      ellipsis: true,
      search: false,
    },
    {
      title: '应收金额（元）',
      dataIndex: 'totalAmount',
      ellipsis: true,
      search: false,
    },
    {
      title: '实收金额（元）',
      dataIndex: 'paidAmount',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠金额（元）',
      dataIndex: 'discountAmount',
      ellipsis: true,
      search: false,
    },
    {
      title: '订单编号',
      dataIndex: 'orderCode',
      ellipsis: true,
      search: false,
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'entryImage',
      valueType: 'option',
      width: 120,
      search: false,
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'detail',
                text: '查看详情',
                onClick: () => {
                  setOpen(true);
                  setModalData({ ...row, type: 'abnormal' });
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
        // title: '车辆通行记录',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable
        columns={columns}
        cardBordered
        form={{
          colon: false,
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        request={queryList}
        rowKey="phone"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        dateFormatter="string"
      />
      <Detail open={open} onOpenChange={setOpen} data={modalData} />
    </PageContainer>
  );
};
