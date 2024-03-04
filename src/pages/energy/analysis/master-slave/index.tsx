import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { history } from 'umi';
import { defaultColors as colors } from '@/components/StatisticCard/Chart/config';
import { BarChart } from '@/components/StatisticCard';
import MeasureTree from '../../measureTree';
import { insTreePage } from '@/services/energy';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [meterSpaceId, setMeterSpaceId] = useState<string>('0');
  const [barData, setBarData] = useState<InsTreePageType[]>([]);
  const [barXData, setBarXData] = useState<string[]>([]);
  const defaultSeriesData = [
    {
      name: '主路用电',
      type: 'bar',
      barWidth: 18,
      emphasis: {
        focus: 'series',
      },
      data: [],
    },
    {
      name: '从路用电',
      type: 'bar',
      barWidth: 18,
      emphasis: {
        focus: 'series',
      },
      data: [],
    },
  ];
  const [barSeriesData, setBarSeriesData] = useState<any>(defaultSeriesData);

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      meterSpaceId,
      insTypes: ['0'],
      recordTimeStart: p.ranger ? p.ranger[0] + ' 00:00:00' : undefined,
      recordTimeEnd: p.ranger ? p.ranger[1] + ' 23:59:59' : undefined,
      level: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
    };
    const res = await insTreePage(params);
    setBarData(res?.items);
    return {
      data: res?.items || [],
      success: true,
      total: res?.page?.totalItems,
    };
  };
  useMemo(() => {
    const xDataTem = barData.map((item) => item.insName) || [];
    setBarXData(xDataTem);
    const series = defaultSeriesData.map((item) => {
      let dataTem: any = [];
      if (item.name === '主路用电') {
        dataTem = barData.map((innerItem) => innerItem.currPeriod?.readOfTotal);
      } else if (item.name === '从路用电') {
        dataTem = barData.map((innerItem) => innerItem.priorPeriod?.readOfTotal);
      }
      return {
        ...item,
        data: dataTem,
      };
    });
    if (series.length === 0) {
      setBarSeriesData(defaultSeriesData);
    } else {
      setBarSeriesData(series);
    }
  }, [barData]);
  const getOption = () => ({
    colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: barXData,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: barSeriesData,
  });
  const columns: ProColumns<InsTreePageType>[] = [
    // {
    //   title: '仪表类型',
    //   dataIndex: 'insType',
    //   valueType: 'select',
    //   hideInTable: true,
    //   initialValue: '0',
    //   valueEnum: insTypeMap.value,
    //   fieldProps: {
    //     allowClear: false,
    //     loading: insTypeMap.loading,
    //   },
    // },
    {
      title: '主仪表编号',
      dataIndex: 'syncId',
      hideInTable: true,
    },
    {
      title: '主仪表名称',
      dataIndex: 'cnName',
      hideInTable: true,
    },
    {
      title: '选择时间',
      dataIndex: 'ranger',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '主仪表编号',
      dataIndex: 'syncId',
      ellipsis: true,
      search: false,
    },
    {
      title: '主仪表名称',
      dataIndex: 'insName',
      ellipsis: true,
      search: false,
    },
    {
      title: '计量位置',
      dataIndex: 'meterSpaceFullName',
      ellipsis: true,
      search: false,
    },
    {
      title: '主路度数（kw·h）',
      dataIndex: 'currPeriodStr',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row?.currPeriod.readOfTotal || '-';
      },
    },
    {
      title: '从路度数（kw·h）',
      dataIndex: 'priorPeriodStr',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row?.priorPeriod.readOfTotal || '-';
      },
    },
    {
      title: '损耗率',
      dataIndex: 'rateOfLoss',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'detail',
                text: '详情',
                accessKey: 'alitaEnergy_queryInsTreeDetailAnalysis',
                onClick() {
                  history.push({
                    pathname: '/energy/analysis/master-slave/detail',
                    query: {
                      id: row?.insId + '',
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const onSelect = (e: any) => {
    if (e) {
      setMeterSpaceId(e.key);
      actionRef.current?.reload();
    }
  };

  return (
    <PageContainer header={{ title: null }} className={styles.pageWarp}>
      <SplitPane>
        <Pane className="SpaceTreePane" initialSize={'320px'} maxSize="50%">
          <div style={{ height: 'calc(100vh - 123px)', overflowY: 'scroll' }}>
            <MeasureTree
              bodyStyle={{
                padding: '0',
              }}
              select={onSelect}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<InsTreePageType>
            actionRef={actionRef}
            columns={columns}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            columnsState={{
              persistenceKey: 'pro-table-singe-demos',
              persistenceType: 'localStorage',
            }}
            headerTitle={
              <div style={{ width: '100%' }}>
                <BarChart style={{ width: '100%' }} getOption={getOption} />
              </div>
            }
            rowKey="insId"
            search={{
              labelWidth: 100,
            }}
            pagination={{
              showSizeChanger: true,
            }}
            options={false}
            dateFormatter="string"
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default TableList;
