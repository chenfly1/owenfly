import { Button, Modal, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { queryUserByPage } from '@/services/door';
import { useMemo, useRef, useState } from 'react';
import DataMasking from '@/components/DataMasking';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onDoubleClick: (data: DoorUserListType) => void;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onDoubleClick }) => {
  const actionRef = useRef<ActionType>();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);

  const handleRowSelectionChange = (selectedRowKey: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKey);
    setSelectedRow(selectedRows);
  };

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);

  const onOk = () => {
    console.log(selectedRow);
    if (!selectedRow.length) {
      return message.error('请勾选数据');
    }
    onDoubleClick(selectedRow[0]);
    onOpenChange(false);
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await queryUserByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<DoorUserListType>[] = [
    {
      title: '人员姓名',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '人员手机',
      key: 'phone',
      search: false,
      dataIndex: 'phone',
      render: (_, record) => [<DataMasking key="onlysee" text={record.phone} />],
    },
    {
      title: '人员类型',
      dataIndex: 'type',
      search: false,
      valueType: 'select',
      valueEnum: {
        '01': {
          text: '员工',
        },
        '02': {
          text: '客户',
        },
        '03': {
          text: '保洁人员',
        },
        '04': {
          text: '安防人员',
        },
        '05': {
          text: '快递人员',
        },
        '06': {
          text: '施工人员',
        },
        '99': {
          text: '其他',
        },
      },
    },
  ];
  return (
    <Modal
      title="人员数据"
      open={open}
      width={'70%'}
      centered
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={onOk}>
          确定
        </Button>,
      ]}
    >
      <ProTable<DoorUserListType>
        actionRef={actionRef}
        columns={columns}
        search={{
          labelWidth: 80,
        }}
        scroll={{ y: 400 }}
        form={{
          colon: false,
        }}
        rowKey="id"
        // cardBordered
        request={queryList}
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: handleRowSelectionChange,
        }}
        options={false}
        dateFormatter="string"
        onRow={(row) => {
          return {
            onDoubleClick: () => {
              onDoubleClick(row);
            },
          };
        }}
      />
    </Modal>
  );
};

export default Add;
