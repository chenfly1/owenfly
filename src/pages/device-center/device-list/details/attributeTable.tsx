import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';

import { deviceDebugProperty, getDeviceRemoteDebug } from '@/services/device';
import styles from './style.less';
import { Button, Modal, Radio, RadioChangeEvent } from 'antd';

export default (props: { data: devicesListType; deviceId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setModel] = useState(1);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<devicesType>[] = [
    {
      title: '属性',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '英文名',
      dataIndex: 'code',
      ellipsis: true,
    },
    {
      title: '当前值',
      dataIndex: 'value',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '正常模式',
        },
        2: {
          text: '常开模式',
        },
        3: {
          text: '常闭模式',
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'ops',
      key: 'ops',
      render: (_: any, row: any) => {
        return (
          <Button
            key="edit"
            type="link"
            onClick={() => {
              // console.log(_.value, '_.value', _, row, '--========');
              setModel(row.value);
              setIsModalOpen(true);
            }}
          >
            编辑
          </Button>
        );
      },
    },
  ];

  const getByPage = async () => {
    const msg = await getDeviceRemoteDebug(props.deviceId);
    return {
      data: msg.data,
      success: true,
    };
  };
  const handleOk = async () => {
    await deviceDebugProperty({
      id: props.deviceId,
      mode,
    });
    setIsModalOpen(false);
    actionRef.current?.reload();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <ProTable<devicesType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={getByPage as any}
        rowKey="id"
        search={false}
        options={false}
        className={styles.EventLogStyle}
        pagination={false}
      />
      <Modal
        title="调试属性-模式"
        centered
        width="480px"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Radio.Group
          size="large"
          value={mode}
          className={styles.radioGroupBox}
          buttonStyle="solid"
          onChange={async (e: RadioChangeEvent) => {
            const { value } = e.target;
            setModel(value);
          }}
        >
          <Radio.Button value={1}>正常</Radio.Button>
          <Radio.Button value={2}>常开</Radio.Button>
          <Radio.Button value={3}>常闭</Radio.Button>
        </Radio.Group>
      </Modal>
    </>
  );
};
