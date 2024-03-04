import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef } from 'react';
import { Access, useAccess, history } from 'umi';
import { parkYardListByPage, recordUsed } from '@/services/park';
import { exportExcel } from '../../utils/constant';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await recordUsed(params);
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

  const columns: ProColumns<RecordUsedType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      valueType: 'select',
      request: queryParkList,
      ellipsis: true,
      order: 4,
    },
    {
      title: '车牌号码',
      dataIndex: 'plateNumber',
      order: 3,
      hideInTable: true,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      ellipsis: true,
      search: false,
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      ellipsis: true,
      order: 2,
    },
    {
      title: '停车订单号',
      dataIndex: 'orderId',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠券类型',
      dataIndex: 'couponType',
      ellipsis: true,
      search: false,
      valueEnum: {
        // '01': '时间折扣',
        '02': '金额折扣',
        // '03': '单次优惠',
        // '04': '折扣优惠',
      },
    },
    {
      title: '优惠券名称',
      dataIndex: 'couponName',
      ellipsis: true,
      order: 1,
    },
    {
      title: '优惠券编号',
      dataIndex: 'couponId',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠金额(元)',
      dataIndex: 'upLimitDiscountValue',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return Number((row.upLimitDiscountValue || 0) / 100).toFixed(2);
      },
    },
    {
      title: '实际优惠金额(元)',
      dataIndex: 'currDiscountPrice',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return Number((row.currDiscountPrice || 0) / 100).toFixed(2);
      },
    },
    {
      title: '使用时间',
      dataIndex: 'useTime',
      ellipsis: true,
      search: false,
    },
  ];
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/coupon/record/used', '优惠券使用记录', params);
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
      <ProTable<RecordUsedType>
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
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="id"
        search={
          {
            labelWidth: 75,
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
        headerTitle={
          <Space>
            <Access
              key="2"
              accessible={access.functionAccess('alitaParking_coupon_mng_couponUsedRecord')}
            >
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
      />
    </PageContainer>
  );
};
