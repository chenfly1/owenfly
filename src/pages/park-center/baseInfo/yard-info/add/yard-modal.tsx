import { Modal } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
// import { storageSy } from '@/utils/Setting';
import { factoryList, parkList } from '@/services/park';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onDoubleClick: (data: any, action: Record<string, any>) => void;
};

const YardModal: React.FC<IProps> = ({ open, onOpenChange, onDoubleClick, data }) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [open]);
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await parkList(params);
    return {
      data: res.data.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page.totalItems,
    };
  };
  const columns: ProColumns[] = [
    {
      title: '设备品牌',
      key: 'factoryCode',
      dataIndex: 'factoryCode',
      order: 3,

      hideInTable: true,
      valueType: 'select',
      fieldProps: { allowClear: false },
      initialValue: 'AI_KE',
      request: async () => {
        const res = await factoryList();
        return res.data.map((item) => ({
          label: item.name,
          value: item.code,
        }));
      },
    },
    {
      title: '车场编号',
      key: 'code',
      dataIndex: 'code',
      hideInSearch: true,
    },
    {
      title: '车场名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '车位总数',
      key: 'totalCarports',
      dataIndex: 'totalCarports',

      hideInSearch: true,
    },
  ];
  return (
    <Modal
      title="厂家车场"
      open={open}
      width={'60%'}
      centered={true}
      onCancel={() => {
        onOpenChange(false);
      }}
      onOk={() => {
        // actionRef.current
        const factoryCode = formRef.current?.getFieldValue('factoryCode');
        const row = selectedRows[0];
        (row as any).factoryCode = factoryCode;
        onDoubleClick(row, data as Record<string, any>);
      }}
      // footer={false}
    >
      <ProTable<any>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        style={{ maxHeight: '700px', overflow: 'auto' }}
        form={{
          colon: false,
        }}
        search={{
          span: 8,
          labelWidth: 68,
          // defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="code"
        cardBordered
        request={queryList}
        options={false}
        dateFormatter="string"
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (_, newSelectedRows: any[]) => {
            setSelectedRows(newSelectedRows);
            setSelectedRowKeys(_);
          },
        }}
        tableAlertRender={false}
        onRow={(row: any) => {
          return {
            onClick: () => {
              setSelectedRows([row]);
              setSelectedRowKeys([row.code]);
            },
            onDoubleClick: () => {
              const factoryCode = formRef.current?.getFieldValue('factoryCode');
              row.factoryCode = factoryCode;
              onDoubleClick(row, data as Record<string, any>);
            },
          };
        }}
      />
    </Modal>
  );
};

export default YardModal;
