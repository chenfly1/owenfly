import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { CarTypeEnum } from '../../data.d';
import { platformVehicleQueryByPage } from '@/services/park';
import DataMasking from '@/components/DataMasking';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onDoubleClick: (data: PlatformVehicleType, action: Record<string, any>) => void;
  parkId: string;
};

const YardModal: React.FC<IProps> = ({ open, onOpenChange, onDoubleClick, data, parkId }) => {
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<PlatformVehicleType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [open]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    params.parkId = parkId;
    const res = await platformVehicleQueryByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<PlatformVehicleType>[] = [
    {
      title: '车牌号码',
      key: 'plate',
      dataIndex: 'plate',
      order: 0,
    },
    {
      title: '车辆类型',
      key: 'vehicleType',
      dataIndex: 'vehicleType',
      hideInSearch: true,

      valueType: 'select',
      request: async () => {
        return Object.entries(CarTypeEnum).map((item) => {
          return {
            label: item[1].text,
            value: item[0],
          };
        });
      },
    },
    {
      title: '车主姓名',
      key: 'name',
      dataIndex: 'name',

      hideInSearch: true,
    },
    {
      title: '手机号',
      key: 'mobile',
      dataIndex: 'mobile',
      render: (_, record) => {
        return [<DataMasking key="onlysee" text={record.mobile} />];
      },
    },
    {
      title: '授权状态',
      key: 'authStatus',
      dataIndex: 'authStatus',
      valueEnum: {
        1: {
          text: '已授权',
          status: 'Success',
        },
        2: {
          text: '未授权',
          status: 'Error',
        },
      },
    },
    {
      title: '车主类型',
      dataIndex: 'userType',
      valueEnum: {
        1: '业主',
        2: '员工',
      },
      order: 0,
    },
  ];
  return (
    <Modal
      title="车主车牌"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      onOk={() => {
        const row = selectedRows[0];
        onDoubleClick(row, data as Record<string, any>);
      }}
    >
      <ProTable<PlatformVehicleType>
        actionRef={actionRef}
        columns={columns}
        search={{
          span: 8,
          labelWidth: 68,
          // defaultColsNumber: 7,
        }}
        rowKey="plate"
        cardBordered
        form={{
          colon: false,
        }}
        pagination={{
          defaultPageSize: 10,
        }}
        request={queryList}
        options={false}
        tableAlertRender={false}
        dateFormatter="string"
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (_, newSelectedRows: any[]) => {
            setSelectedRows(newSelectedRows);
            setSelectedRowKeys(_);
          },
        }}
        onRow={(row) => {
          return {
            onDoubleClick: () => {
              onDoubleClick(row, data as Record<string, any>);
            },
          };
        }}
      />
    </Modal>
  );
};

export default YardModal;
