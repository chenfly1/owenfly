import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import { getOpenGateList, parkYardListByPage } from '@/services/park';
import ActionGroup from '@/components/ActionGroup';
import { useState } from 'react';
import Detail from '../components/detail';

export default () => {
  const [open, setOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});
  const passageModeEnum = {
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

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getOpenGateList(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const columns: ProColumns<OpenGateRecordQueryType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      hideInTable: true,
      request: queryParkList,
      order: 4,
    },
    {
      title: '参考车牌号',
      dataIndex: 'plate',
      hideInTable: true,
      order: 3,
    },
    {
      title: '开闸时间',
      dataIndex: 'openTime',
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
      search: false,
    },
    {
      title: '参考车牌号',
      dataIndex: 'plate',
      search: false,
    },
    {
      title: '进出场类型',
      dataIndex: 'passageModel',
      search: false,
      valueEnum: passageModeEnum,
    },
    {
      title: '通道名称',
      dataIndex: 'passageName',
      search: false,
    },
    {
      title: '开闸时间',
      dataIndex: 'openTime',
      search: false,
    },
    {
      title: '开闸原因',
      dataIndex: 'reason',
      search: false,
    },
    {
      title: '操作来源',
      dataIndex: 'operator',
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
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
                  setModalData({ ...row });
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
      <ProTable<OpenGateRecordQueryType>
        columns={columns}
        cardBordered
        form={{
          colon: false,
        }}
        request={queryList}
        rowKey="id"
        search={
          {
            labelWidth: 75,
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
