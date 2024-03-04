import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { proectThirdPage } from '@/services/mda';
import styles from '../style.less';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onDoubleClick: (data: ProectThirdType, action: Record<string, any>) => void;
};

const YardModal: React.FC<IProps> = ({ open, onOpenChange, onDoubleClick, data }) => {
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<ProectThirdType[]>([]);
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
    const res = await proectThirdPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<ProectThirdType>[] = [
    {
      title: '项目编号',
      dataIndex: 'commNum',
      width: 150,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'commName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '所属组织',
      dataIndex: 'commOrgName',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '类型',
      dataIndex: 'commType',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '开发状态',
      dataIndex: 'commStatus',
      width: 100,
      ellipsis: true,
      search: false,
    },
    {
      title: '项目地址',
      ellipsis: true,
      width: 300,
      dataIndex: 'commAddr',
      search: false,
    },
  ];
  return (
    <Modal
      title="关联项目"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      centered
      onOk={() => {
        const row = selectedRows[0];
        onDoubleClick(row, data as Record<string, any>);
      }}
    >
      <ProTable<ProectThirdType>
        actionRef={actionRef}
        columns={columns}
        search={{
          span: 8,
          labelWidth: 68,
          // defaultColsNumber: 7,
        }}
        rowKey="commId"
        className={styles.tableStyle}
        cardBordered
        form={{
          colon: false,
        }}
        scroll={{ y: 400 }}
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
