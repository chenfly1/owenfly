import { PageContainer } from '@ant-design/pro-layout';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { getNoticeChannelList, getSendStatisticList } from '@/services/notice';
import { getTenantList } from '@/services/flow';
import dayjs from 'dayjs';

export default () => {
  /** 获取消息列表 */
  const getList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getSendStatisticList(params);
    return {
      data: (res?.data?.items || []).map((item: any) => {
        return {
          ...item,
          countStr: `${item.successCount}/${item.failCount}`,
          successRate: item.totalCount
            ? Number((item.successCount / item.totalCount) * 100).toFixed(2) + '%'
            : '0%',
        };
      }),
      success: res?.code === 'SUCCESS' ? true : false,
      total: res?.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<SendStatisticList>[] = [
    {
      title: '租户名称',
      dataIndex: 'tenantId',
      order: 6,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
      },
      request: async ({ keyWords }) => {
        const res = await getTenantList({ pageNo: 1, pageSize: 2000, name: keyWords });
        return res.items.map(({ code, name }) => ({
          label: name,
          value: code,
        }));
      },
      debounceTime: 1000,
    },
    {
      title: '统计日期',
      dataIndex: 'sendStatus',
      order: 4,
      valueType: 'dateRange',
      search: {
        transform: (item) => {
          return {
            startTime: dayjs(item[0] + ' 00:00:00').valueOf(),
            endTime: dayjs(item[1] + ' 23:59:59').valueOf(),
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '统计日期',
      valueType: 'date',
      dataIndex: 'statisticDate',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '渠道名称(账号)',
      dataIndex: 'channelBid',
      order: 5,
      valueType: 'select',
      request: async () => {
        const res = await getNoticeChannelList({
          pageNo: 1,
          pageSize: 1000,
        });

        return res.data.items.map((item: any) => {
          return {
            label: item.channelName,
            value: item.bid,
          };
        });
      },
      ellipsis: true,
      // hideInSearch: true,
    },
    {
      title: '渠道ID',
      dataIndex: 'channelBid',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '消息发送总数',
      dataIndex: 'totalCount',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '发送成功/发送失败',
      dataIndex: 'countStr',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      ellipsis: true,
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<SendStatisticList>
        columns={columns}
        form={{ colon: false }}
        tableAlertRender={false}
        cardBordered
        request={getList}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="bid"
        search={{ labelWidth: 98 }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
