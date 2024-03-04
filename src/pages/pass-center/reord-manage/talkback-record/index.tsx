import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { getTalkBackLogByPage } from '@/services/door';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<TlakbackLogType>[] = [
    {
      title: '呼叫方',
      dataIndex: 'callFrom',
      ellipsis: true,
    },
    {
      title: '呼叫方名称',
      dataIndex: 'callFromName',
      search: false,
      ellipsis: true,
    },
    {
      title: '接听方',
      dataIndex: 'callTo',
      search: false,
      ellipsis: true,
    },
    {
      title: '接听方名称',
      dataIndex: 'callToName',
      search: false,
      ellipsis: true,
    },
    {
      title: '呼叫时间',
      dataIndex: 'callTime',
      hideInSearch: true,
    },
    {
      title: '呼叫时间',
      dataIndex: 'callTime',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            callTimeStart: value[0] + ' 00:00:00',
            callTimeEnd: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '接听状态',
      dataIndex: 'status',
      search: false,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '呼叫成功',
        },
        2: {
          text: '呼叫失败',
        },
        3: {
          text: '应答成功',
        },
        4: {
          text: '应答失败',
        },
      },
    },
    {
      title: '接听时长（S）',
      dataIndex: 'duration',
      search: false,
      ellipsis: true,
    },
    // {
    //   title: '抓拍图片',
    //   dataIndex: 'pic',
    //   search: false,
    //   render: (_, record) => {
    //     return record.pic ? <Image width={40} height={40} src={record.pic} /> : '-';
    //   },
    // },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getTalkBackLogByPage({
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
      <ProTable<TlakbackLogType>
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
          labelWidth: 58,
          defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};
