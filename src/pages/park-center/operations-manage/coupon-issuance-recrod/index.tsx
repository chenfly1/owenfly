import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef } from 'react';
import { Access, useAccess, history } from 'umi';
import { couponReceive, parkYardListByPage } from '@/services/park';
import { exportExcel } from '../../utils/constant';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await couponReceive(params);
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

  const columns: ProColumns<CouponReceiveType>[] = [
    {
      title: '适用车场',
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
      title: '商家名称',
      dataIndex: 'merchantName',
      ellipsis: true,
      order: 2,
    },
    {
      title: '优惠券类型',
      dataIndex: 'cardType',
      order: 1,
      ellipsis: true,
      valueEnum: {
        // '01': '时间折扣',
        '02': '金额折扣',
        // '03': '单次优惠',
        // '04': '折扣优惠',
      },
    },
    {
      title: '优惠券名称',
      dataIndex: 'cardName',
      ellipsis: true,
      order: 0,
    },
    {
      title: '优惠券编号',
      dataIndex: 'receiveCode',
      ellipsis: true,
      search: false,
    },
    {
      title: '领取时间',
      dataIndex: 'exchangeTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠券状态',
      dataIndex: 'state',
      ellipsis: true,
      search: false,
      valueEnum: {
        '01': { text: '待使用', status: 'Success' },
        '00': { text: '未兑换', status: 'Default' },
        '02': { text: '已使用', status: 'Success' },
        '03': { text: '过期返还', status: 'Error' },
      },
    },
    {
      title: '优惠金额(元)',
      dataIndex: 'cardAmount',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return Number(row.cardAmount / 100).toFixed(2);
      },
    },
  ];
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/coupon/record/receive', '优惠券发放记录', params);
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
      <ProTable<CouponReceiveType>
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
        rowKey="relId"
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
              accessible={access.functionAccess('alitaParking_coupon_mng_merchantCouponRecord')}
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
