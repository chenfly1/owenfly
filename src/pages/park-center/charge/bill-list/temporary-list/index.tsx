import { parkTitles } from '@/pages/park-center/utils/constant';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { temporaryColumns } from '../columns';
import { orderRecordsLt, parkYardListByPage } from '@/services/park';
import styles from './style.less';
import { Button } from 'antd';
import { useRef } from 'react';
import { exportExcel } from '@/pages/park-center/utils/constant';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
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
  const formRef = useRef<ProFormInstance>();
  const formColumns: ProColumns<OrderRecordsltType>[] = [
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
        '01': '待支付',
        '02': '支付成功',
        '03': '支付超时',
        '04': '支付失败',
        '05': '已取消',
        '06': '已关闭',
      },
    },
  ];
  const formColumns1: ProColumns[] = formColumns.map((item) => ({ ...item, hideInTable: true }));

  const temporaryColumns1: ProColumns[] = temporaryColumns.map((item) => {
    if (['totalAmount', 'paidAmount', 'discountAmount'].includes(item.dataIndex as string)) {
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

  const columns1: ProColumns[] = [...formColumns1, ...temporaryColumns1];
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    const res = await orderRecordsLt(params);
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
    params.projectId = project.bid;
    exportExcel('/parking/mng/order_records/lt', '临停订单记录', params);
  };

  return (
    <>
      <ProTable<OrderRecordsltType>
        cardBordered
        columns={columns1}
        className={styles.cardTable}
        formRef={formRef}
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
    </>
  );
};
