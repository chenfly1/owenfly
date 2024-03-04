import { exportExcel, parkTitles } from '@/pages/park-center/utils/constant';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { monthlyColumns } from '../columns';
import { parkYardListByPage, transRecordsYz } from '@/services/park';
import styles from './style.less';
import { useRef, useState } from 'react';
import { Button } from 'antd';
import ActionGroup from '@/components/ActionGroup';
import { history } from 'umi';
import MoneybackModal from '../moneyBackModal';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [open, setOpen] = useState<boolean>(false);
  const [mbData, setMbData] = useState<OrderRecordsltType>();

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

  const formColumns: ProColumns<TransRecordsyzType>[] = [
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
      },
    },
  ];
  const formColumns1: ProColumns[] = formColumns.map((item) => ({ ...item, hideInTable: true }));
  const monthlyColumns1: ProColumns[] = monthlyColumns.map((item) => {
    if (
      ['pkgPrice', 'totalAmount', 'paidAmount', 'discountAmount', 'refundAmount'].includes(
        item.dataIndex as string,
      )
    ) {
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
  const columns2: ProColumns[] = [
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      fixed: 'right',
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                text: '详情',
                key: 'xq',
                onClick() {
                  history.push({
                    pathname: '/park-center/charge/deal-list/detail',
                    query: { id: row.id, type: 'yz', status: row.refundStatus },
                  });
                },
              },
              {
                text: '退款',
                key: 'tk',
                onClick() {
                  setMbData({ ...row, orderType: 'yz' });
                  setOpen(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const columns1: ProColumns[] = [...formColumns1, ...monthlyColumns1, ...columns2];

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await transRecordsYz(params);
    return {
      data: res.data?.elements,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const onSubmit = () => {};

  const onExportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/trans_records/yz', '月租交易记录', params);
  };
  return (
    <>
      <ProTable<TransRecordsyzType>
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
        toolBarRender={() => [
          <Button key="export" type="primary" onClick={onExportClick}>
            导出
          </Button>,
        ]}
        search={{
          labelWidth: 68,
          // // defaultColsNumber: 7,
        }}
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
      <MoneybackModal open={open} onOpenChange={setOpen} onSubmit={onSubmit} data={mbData} />
    </>
  );
};
