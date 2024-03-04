import { exportExcel, parkTitles } from '@/pages/park-center/utils/constant';
import type { ActionType, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { monthlyColumns } from '../columns';
import { closeOrderRecord, orderRecordsYz, parkYardListByPage } from '@/services/park';
import styles from './style.less';
import { useRef, useState } from 'react';
import { Button, Modal, message } from 'antd';
import ActionGroup from '@/components/ActionGroup';
import { ExclamationCircleFilled } from '@ant-design/icons';
import RefrePayModal from './refrePayModal';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const actionRef = useRef<ActionType>();
  const [refrePayModalShow, setRefrePayModalShow] = useState(false);
  const [refrePayModalData, setRefrePayModalData] = useState({});

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

  const reload = () => {
    actionRef.current?.reload();
  };

  const closeOrder = async (row: any) => {
    const id = row?.id;
    const res = await closeOrderRecord({ id, type: 'yz' });
    if (res.code === 'SUCCESS') {
      message.success('关闭成功');
      reload();
      return true;
    }
    return false;
  };

  const formColumns: ProColumns<OrderRecordsyzType>[] = [
    {
      title: parkTitles.alitaYardName,
      dataIndex: 'parkId',
      valueType: 'select',
      request: queryParkList,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
    },
    {
      title: '订单编号',
      dataIndex: 'orderCode',
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      valueEnum: {
        '01': { text: '待支付', status: 'Error' },
        '02': { text: '支付成功', status: 'Success' },
        '03': { text: '支付超时', status: 'Warning' },
        '04': { text: '支付失败', status: 'Error' },
        '05': '已取消',
        '06': '已关闭',
      },
    },
  ];
  const formColumns1: ProColumns[] = formColumns.map((item) => ({ ...item, hideInTable: true }));

  const monthlyColumns1: ProColumns[] = monthlyColumns.map((item) => {
    if (['packagePrice'].includes(item.dataIndex as string)) {
      return {
        ...item,
        title: item.title + '(元)',
        render: (_, row) => {
          // return (
          //   <ProFormMoney readonly fieldProps={{ value: row[item.dataIndex as string] / 100 }} />
          // );
          return Number(row[item.dataIndex as string] / 100).toFixed(2);
        },
      };
    } else {
      return item;
    }
  });

  const optionColumns = [
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'detail',
                disabled: row.orderStatusName !== '支付超时',
                // hidden: row.orderStatusName !== '支付超时',
                text: '重新发起支付',
                onClick: () => {
                  setRefrePayModalShow(true);
                  setRefrePayModalData(row);
                },
              },
              {
                key: 'detail',
                text: '关闭订单',
                // hidden: row.orderStatusName !== '支付超时',
                disabled: row.orderStatusName !== '支付超时',
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确认关闭该订单？',
                    centered: true,
                    content: <p style={{ color: '#999' }}>关闭订单后，该订单无法被重复支付</p>,
                    onOk: async () => {
                      return closeOrder(row);
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const columns1: ProColumns[] = [...formColumns1, ...monthlyColumns1, ...optionColumns];
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await orderRecordsYz(params);
    return {
      data: res.data?.elements,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };
  const onExportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/order_records/yz', '月租订单记录', params);
  };
  return (
    <>
      <ProTable<OrderRecordsyzType>
        cardBordered
        className={styles.cardTable}
        columns={columns1}
        formRef={formRef}
        actionRef={actionRef}
        ghost={true}
        form={{
          colon: false,
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        request={queryList}
        rowKey="areaNum"
        search={{
          labelWidth: 68,
          // // defaultColsNumber: 7,
        }}
        toolBarRender={() => [
          <Button key="export" type="primary" onClick={onExportClick}>
            导出
          </Button>,
        ]}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        dateFormatter="string"
      />
      <RefrePayModal
        open={refrePayModalShow}
        onOpenChange={setRefrePayModalShow}
        onSubmit={() => {
          setRefrePayModalShow(false);
          reload();
        }}
        data={refrePayModalData}
      />
    </>
  );
};
