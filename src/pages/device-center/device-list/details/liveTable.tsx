import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getRealTimeData } from '@/services/device';
import styles from './style.less';

export default (props: { data: devicesListType; deviceId: string }) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<devicesType>[] = [
    {
      title: '字段名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 200,
      valueType: 'select',
      valueEnum: {
        did: {
          text: '下游系统设备ID',
        },
        ip: {
          text: 'IP地址',
        },
        firmware_version: {
          text: '软件版本',
        },
        location_number: {
          text: '设备编号',
        },
      },
    },
    {
      title: '描述',
      dataIndex: 'value',
      ellipsis: true,
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getRealTimeData(props.deviceId);
    return {
      data: msg.data,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      // total: msg.data.length,
    };
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
    </>
  );
};
