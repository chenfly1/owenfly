import { useEffect, useState } from 'react';
import { ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import StatisticItem, { StatisticProps } from './Statistic';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { getMonitorInstance, getWarningStatisticDetail } from '@/services/energy';
import dayjs from 'dayjs';
import { getDirection } from '..';
import { history } from 'umi';
import { meterTypeEnum } from '../../config';

export default () => {
  const [statistic, setStatistic] = useState<
    Partial<{
      today: StatisticProps;
      yesterday: StatisticProps;
      currentMonth: StatisticProps;
      lastMonth: StatisticProps;
    }>
  >({});
  const { insTypeMap } = useInitState<EnergyState>('useEnergy', ['insTypeMap']);

  const columns: ProColumns<EnergyMonitorInstance>[] = [
    {
      title: '预警任务',
      key: 'monitorName',
      dataIndex: 'monitorName',
      ellipsis: true,
      order: -1,
    },
    {
      title: '预警类别',
      key: 'monitorTypeName',
      dataIndex: 'monitorTypeName',
      hideInSearch: true,
    },
    {
      title: '监测点',
      key: 'monitorPointName',
      dataIndex: 'monitorPointName',
      order: -2,
    },
    {
      title: '告警值',
      key: 'limitSize',
      dataIndex: 'limitSize',
      ellipsis: true,
      hideInSearch: true,
      render: (_, row) => {
        return `${row.limitSize ?? ''} ${row.insType === meterTypeEnum.electric ? 'kW·h' : 'm³'}/${
          row.periodTypeName ?? ''
        }`;
      },
    },
    {
      title: '实际用量',
      key: 'totalSize',
      dataIndex: 'totalSize',
      ellipsis: true,
      hideInSearch: true,
      render: (_, row) => {
        return `${row.totalSize ?? ''} ${row.insType === meterTypeEnum.electric ? 'kW·h' : 'm³'}`;
      },
    },
    {
      title: '超额用量',
      key: 'exceedSize',
      dataIndex: 'exceedSize',
      ellipsis: true,
      hideInSearch: true,
      render: (_, row) => {
        return `${row.overSize ?? ''} ${row.insType === meterTypeEnum.electric ? 'kW·h' : 'm³'}`;
      },
    },
    {
      title: '告警时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '告警时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      order: -3,
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            createTimeStart: value[0],
            createTimeEnd: value[1],
          };
        },
      },
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      order: 0,
      valueEnum: insTypeMap.value,
      fieldProps: {
        loading: insTypeMap.loading,
      },
      formItemProps: {
        name: 'insType',
      },
    },
  ];

  const getList = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getMonitorInstance(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const transformRes = (data: WarningStatisticDetailRes, label?: string) => {
    return {
      waringCount: data?.count,
      electricityExceedCount: data?.electricity,
      waterExceedCount: data?.water,
      compare: label
        ? {
            label,
            value: `${((data.race ?? 0) * 100).toFixed(2)}%`,
            direction: getDirection(data?.race),
          }
        : undefined,
    };
  };

  useEffect(() => {
    Promise.all([
      getWarningStatisticDetail({
        periodType: 3,
        date: dayjs().startOf('day').format('YYYY-MM-DD'),
      }),
      getWarningStatisticDetail({
        periodType: 3,
        date: dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD'),
      }),
      getWarningStatisticDetail({
        periodType: 4,
        date: dayjs().startOf('month').format('YYYY-MM-DD'),
      }),
      getWarningStatisticDetail({
        periodType: 4,
        date: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
      }),
    ]).then(([today, yesterday, currentMonth, lastMonth]) => {
      setStatistic({
        today: transformRes(today),
        yesterday: transformRes(yesterday, '较前日'),
        currentMonth: transformRes(currentMonth),
        lastMonth: transformRes(lastMonth, '较前月'),
      });
    });
  }, []);

  return (
    <PageContainer
      header={{
        title: '用量告警',
        onBack: () => {
          history.push({
            pathname: '/energy/dashboard',
          });
        },
      }}
    >
      <Row style={{ margin: '24px 16px' }} gutter={16} justify="space-between">
        <Col span={6}>
          <StatisticItem title="今日告警" source={statistic?.today} />
        </Col>
        <Col span={6}>
          <StatisticItem title="昨日告警" source={statistic?.yesterday} />
        </Col>
        <Col span={6}>
          <StatisticItem title="本月告警" source={statistic?.currentMonth} />
        </Col>
        <Col span={6}>
          <StatisticItem title="上月告警" source={statistic?.lastMonth} />
        </Col>
      </Row>
      <ProTable<EnergyMonitorInstance>
        dateFormatter="string"
        columns={columns}
        form={{ colon: false }}
        request={getList}
        cardBordered
        pagination={{
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};
