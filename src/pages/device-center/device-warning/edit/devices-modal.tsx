import { Button, Modal, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { getQueryByDevicePage } from '@/services/device';
import styles from './style.less';

type IProps = {
  open: boolean;
  disabled: boolean;
  data: Record<string, any>;
  selectKeys: any[];
  onOpenChange: (open: boolean) => void;
  onDoubleClick: (data: string[], action: Record<string, any>) => void;
};

const Add: React.FC<IProps> = ({
  open,
  onOpenChange,
  data,
  disabled,
  selectKeys,
  onDoubleClick,
}) => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const actionRef = useRef<ActionType>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState([]);

  const handleRowSelectionChange = (selectedRowKey: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKey);
    setSelectedRow(selectedRows);
  };

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
      setSelectedRowKeys(selectKeys);
      console.log(selectKeys);
    }
  }, [open]);

  const onOk = () => {
    console.log(selectedRowKeys);
    if (!selectedRowKeys.length) {
      return message.error('请勾选数据');
    }
    onDoubleClick(selectedRowKeys, data);
    onOpenChange(false);
  };

  const queryList = async (params: any) => {
    const res = await getQueryByDevicePage({
      ...params,
      projectId: project?.bid,
      showSubordinates: true,
      pageNo: params.current,
    });
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备名称',
      width: '25%',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '设备ID',
      width: '25%',
      dataIndex: 'id',
      ellipsis: true,
    },
    {
      title: 'SN',
      width: '25%',
      dataIndex: 'sn',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      width: '25%',
      dataIndex: 'ip',
      ellipsis: true,
    },
  ];
  return (
    <Modal
      title="项目自定义设备"
      open={open}
      width={'70%'}
      centered
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={[
        disabled ? (
          <Button
            key="back"
            disabled={false}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            返回
          </Button>
        ) : (
          <>
            <Button
              key="cancel"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              取消
            </Button>
            <Button key="confirm" type="primary" onClick={onOk}>
              确定
            </Button>
          </>
        ),
      ]}
    >
      <ProTable<devicesListType>
        actionRef={actionRef}
        columns={columns}
        search={{
          labelWidth: 80,
        }}
        tableAlertRender={false}
        tableClassName={styles.deviceTable}
        form={{
          colon: false,
          disabled: false,
        }}
        rowKey="id"
        request={queryList}
        options={false}
        rowSelection={{
          preserveSelectedRowKeys: true, // 翻页记录上一页数据
          selectedRowKeys,
          onChange: handleRowSelectionChange,
          getCheckboxProps: (record) => ({
            disabled: disabled, // 配置无法勾选的列
          }),
        }}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default Add;
