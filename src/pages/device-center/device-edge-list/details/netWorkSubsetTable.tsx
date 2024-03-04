import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getQueryByDevicePage } from '@/services/device';
import styles from './style.less';

export default (props: { did: string }) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<devicesType>[] = [
    {
      title: 'DID',
      dataIndex: 'did',
      ellipsis: true,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'Error',
        },
      },
    },
    {
      title: '厂商',
      dataIndex: 'manufacturer',
      ellipsis: true,
    },
    {
      title: '型号',
      dataIndex: 'model',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      ellipsis: true,
    },
    {
      title: '授权应用',
      dataIndex: 'systemName',
      ellipsis: true,
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getQueryByDevicePage({
      ...params,
      rootId: props.did,
      pageNo: params.current,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
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
        // pagination={false}
      />
    </>
  );
};
