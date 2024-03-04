import {
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import Add from './add';
import { couponOffline, couponOnline, couponQeryByPage } from '@/services/park';
import { exportExcel } from '../../utils/constant';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<CouponType>();
  const access = useAccess();
  const [readonly, setReadonly] = useState<boolean>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await couponQeryByPage(params);
    return {
      data: res.data?.elements || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const onStateChange = (row: any) => {
    const isOnline = row.status === '00';
    Modal.confirm({
      title: isOnline ? '确定下线吗？' : '确定上线吗？',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        let res: any;
        if (isOnline) {
          res = await couponOffline({ id: row?.id });
        } else {
          res = await couponOnline({ id: row?.id });
        }
        if (res.code === 'SUCCESS') {
          actionRef.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const columns: ProColumns<CouponType>[] = [
    {
      title: '券编码',
      dataIndex: 'code',
      ellipsis: true,
      search: false,
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      order: 2,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      ellipsis: true,
      order: 1,
      valueEnum: {
        // '01': '时间折扣',
        '02': '金额折扣',
        // '03': '单次优惠',
        // '04': '折扣优惠',
      },
    },
    {
      title: '库存数量',
      dataIndex: 'total',
      ellipsis: true,
      search: false,
    },
    {
      title: '可出售数量',
      dataIndex: 'saleTotal',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.total - row.saleTotal;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        '00': {
          text: '已上线',
          status: 'Success',
        },
        // '01': {
        //   text: '待发布',
        //   status: 'Processing',
        // },
        // '02': {
        //   text: '已失效',
        //   status: 'Error',
        // },
        '03': {
          text: '已下线',
          status: 'Default',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      ellipsis: true,
      search: false,
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        const onLine = (
          <Access key="1" accessible={access.functionAccess('alitaParking_coupon_mng_on')}>
            <a
              onClick={() => {
                onStateChange(row);
              }}
            >
              上线
            </a>
          </Access>
        );
        const offfLine = (
          <Access key="2" accessible={access.functionAccess('alitaParking_coupon_mng_off')}>
            <a
              onClick={() => {
                onStateChange(row);
              }}
            >
              下线
            </a>
          </Access>
        );
        if (row.status === '03') {
          return onLine;
        } else if (row.status === '00') {
          return offfLine;
        }
        return null;

        // return (
        // <Dropdown
        //   menu={{
        //     items: [
        //       {
        //         key: '1',
        //         label: onLine,
        //       },
        //       {
        //         key: '2',
        //         label: offfLine,
        //       },
        //     ],
        //   }}
        // >
        //   <a onClick={(e) => e.preventDefault()}>
        //     <Space>
        //       更多
        //       <CaretDownOutlined />
        //     </Space>
        //   </a>
        // </Dropdown>
        // <Space>{detail}</Space>
        // );
      },
    },
  ];
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/platform_vehicle/queryByPage', '优惠券', params, 'POST');
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
      <ProTable<CouponType>
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
            labelWidth: 78,
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
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('alitaParking_coupon_mng_add')}>
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增优惠券
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
