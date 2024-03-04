import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getPlateChangeList, parkYardListByPage } from '@/services/park';
import { PackageUseEnum } from '../data.d';
import { history } from 'umi';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getPlateChangeList(params);
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

  const columns: ProColumns<PlateChangeType>[] = [
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
      title: '套餐类型',
      dataIndex: 'packageType',
      valueEnum: PackageUseEnum,
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
      title: '下发状态',
      dataIndex: 'downStatus',
      valueEnum: {
        1: {
          text: '下发成功',
          status: 'Success',
        },
        0: {
          text: '下发失败',
          status: 'Error',
        },
      },
      order: 2,
      hideInTable: true,
    },

    {
      title: '车场名称',
      dataIndex: 'parkName',
      ellipsis: true,
      search: false,
    },
    {
      title: '套餐用途',
      dataIndex: 'packageType',
      valueEnum: PackageUseEnum,
      ellipsis: true,
      search: false,
    },
    {
      title: '车辆套餐',
      dataIndex: 'packageName',
      ellipsis: true,
      search: false,
    },
    {
      title: '车位编号',
      dataIndex: 'spaceCode',
      ellipsis: true,
      search: false,
    },
    {
      title: '原车牌号码',
      dataIndex: 'originPlate',
      ellipsis: true,
      search: false,
    },
    {
      title: '变更后车牌号码',
      dataIndex: 'plate',
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
      valueEnum: {
        1: {
          text: '下发成功',
        },
        2: {
          text: '无需下发',
        },
        3: {
          text: '下发失败',
        },
      },
      ellipsis: true,
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
      <ProTable<PlateChangeType>
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
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
