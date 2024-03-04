import { PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import Add from './add';
import { couponSale, platformVehicleQueryByPage } from '@/services/park';
import { exportExcel } from '../../utils/constant';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<CouponSaleType>();
  const access = useAccess();
  const [readonly, setReadonly] = useState<boolean>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    if (params.dateRange) {
      params.startTime = params.dateRange[0] + ' 00:00:00';
      params.endTime = params.dateRange[1] + ' 23:59:59';
    }
    const res = await couponSale(params);
    return {
      data: res.data?.elements || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const columns: ProColumns<CouponSaleType>[] = [
    {
      title: '订单编号',
      dataIndex: 'orderCode',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠券类型',
      dataIndex: 'type',
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
      dataIndex: 'name',
      order: 2,
      ellipsis: true,
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      order: 3,
      ellipsis: true,
    },
    {
      title: '出售数量',
      dataIndex: 'salesTotal',
      search: false,
    },
    {
      title: '出售人',
      dataIndex: 'creator',
      search: false,
      ellipsis: true,
    },
    {
      title: '出售时间',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      order: 1,
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '出售时间',
      dataIndex: 'gmtCreated',
      search: false,
      ellipsis: true,
    },
  ];

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    exportExcel('/parking/mng/coupon_sales/export', '优惠卷出售记录', params);
  };
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
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
      <ProTable<CouponSaleType>
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
            labelWidth: 73,
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
            <Access key="2" accessible={access.functionAccess('alitaParking_coupon_sales_export')}>
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('alitaParking_coupon_sales_add')}>
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              出售优惠券
            </Button>
          </Access>,
        ]}
      />

      <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={readonly}
      />
    </PageContainer>
  );
};
