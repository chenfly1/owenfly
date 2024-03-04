import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { platformVehicleQueryByPage } from '@/services/park';
import { parkingFeeRank } from '@/services/bi';

type IProps = {
  open: boolean;
  data: Record<string, any>;
  onOpenChange: (open: boolean) => void;
};

const App: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const actionRef = useRef<ActionType>();

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);
  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      projectIds: data.projectIds,
      start: data.dates[0],
      end: data.dates[1],
      type: data.type,
    };
    const res = await parkingFeeRank(params);
    return {
      data: res.data.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<ParkingFeeRankType>[] = [
    {
      title: '排名',
      dataIndex: 'index',
      search: false,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      search: false,
    },
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      search: false,
    },
    {
      title: '车场数量',
      dataIndex: 'parkNum',
      search: false,
    },
    {
      title: '临停实收金额总数(元)',
      dataIndex: 'paidAmount',
      search: false,
      render: (_, row) => {
        return Number(row.paidAmount / 100).toFixed(2);
      },
    },
    {
      title: '临停应收金额总数(元)',
      dataIndex: 'totalAmount',
      search: false,
      render: (_, row) => {
        return Number(row.totalAmount / 100).toFixed(2);
      },
    },
    {
      title: '订单总数',
      dataIndex: 'orderCount',
      search: false,
    },
    {
      title: '实收率',
      dataIndex: 'rate',
      search: false,
    },
  ];
  return (
    <Modal
      title={data.type === '0' ? '临停收入统计' : '月租收入统计'}
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={null}
    >
      <ProTable<ParkingFeeRankType>
        actionRef={actionRef}
        columns={columns}
        search={false}
        rowKey="projectCode"
        cardBordered
        form={{
          colon: false,
        }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        request={queryList}
        options={false}
        tableAlertRender={false}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default App;
