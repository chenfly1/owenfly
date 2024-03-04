import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getDeviceEventLog } from '@/services/device';
import styles from './style.less';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const columns: ProColumns<devicesType>[] = [
    {
      title: '事件日志编号',
      dataIndex: 'id',
      ellipsis: true,
    },
    {
      title: '事件名称',
      dataIndex: 'name',
      search: false,
      ellipsis: true,
    },
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      ellipsis: true,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      ellipsis: true,
    },
    {
      title: '安装位置',
      dataIndex: 'spaceName',
      ellipsis: true,
      search: false,
    },
    {
      title: '上报时间',
      dataIndex: 'reportDate',
      ellipsis: true,
      search: false,
    },
    {
      title: '上报时间',
      dataIndex: 'reportDate',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startDate: value[0],
            endDate: value[1],
          };
        },
      },
    },
  ];

  const toolBarRender = () => {
    return [];
  };

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getDeviceEventLog({
      ...params,
      projectId: project?.bid,
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
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <ProTable<devicesType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={getByPage}
        rowKey="id"
        cardBordered
        search={
          {
            labelWidth: 88,
            labelAlign: 'left',
          } as any
        }
        form={{
          colon: false,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={toolBarRender}
      />
    </PageContainer>
  );
};
