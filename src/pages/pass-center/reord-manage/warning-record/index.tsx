import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { getWornLogByPage, getWornTypeList } from '@/services/door';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<WornLogType>[] = [
    {
      title: '报警类型',
      dataIndex: 'type',
      ellipsis: true,
      valueType: 'select',
      request: async () => {
        const res = await getWornTypeList();
        return res.data.map((i) => ({
          value: i.code,
          label: i.name,
        }));
      },
    },
    {
      title: '报警时间',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '报警时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            startTime: value[0] + ' 00:00:00',
            endTime: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      search: false,
      ellipsis: true,
    },
    {
      title: '处理方式',
      dataIndex: 'status',
      search: false,
      valueType: 'select',
      valueEnum: {
        3: {
          text: '误报',
          status: 'Error',
        },
        1: {
          text: '已处理',
          status: 'Success',
        },
        2: {
          text: '未处理',
          status: 'Error',
        },
      },
    },
    {
      title: '处理时间',
      dataIndex: 'treatmentTime',
      search: false,
      ellipsis: true,
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getWornLogByPage({
      ...params,
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
      <ProTable<WornLogType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={{
          labelWidth: 68,
          defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};
