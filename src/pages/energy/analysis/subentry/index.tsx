import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { defaultColors as colors } from '@/components/StatisticCard/Chart/config';
import {
  ProCard,
  ProForm,
  ProFormDateRangePicker,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { Button, Col, Divider, Row } from 'antd';
import { BarChart, PieChart } from '@/components/StatisticCard';
import MeasureTree from '../../measureTree';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { getInsTagCollect, getInsTagColumnar } from '@/services/energy';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

const TableList: React.FC = () => {
  const { insTypeMap } = useInitState<EnergyState>('useEnergy', ['insTypeMap']);
  const [meterSpaceId, setMeterSpaceId] = useState<string>('0');
  const [barXData, setBarXData] = useState<string[]>([]);
  const [unit, setUnit] = useState('kW·h');
  const defaultSeriesData = [
    {
      name: '',
      type: 'bar',
      stack: 'Search Engine',
      barWidth: 18,
      emphasis: {
        focus: 'series',
      },
      data: [],
    },
  ];
  const [barSeriesData, setBarSeriesData] = useState<any>(defaultSeriesData);
  const [pieData, setPieData] = useState<InsTagCollectType>({
    averageDosage: '0',
    maximumProportion: '',
    minimumProportion: '',
    maximumName: '',
    minimumName: '',
    dosageDetail: [],
  });
  const [barData, setBarData] = useState<InsTagColumnarType>([]);
  const formRef = useRef<ProFormInstance>();

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
  const getPieOption = ({ series, ...option }: any) => {
    return {
      tooltip: {
        trigger: 'item',
      },
      ...option,
      series: [
        {
          ...series[0],
          label: {
            show: true,
          },
          itemStyle: {
            // borderRadius: 5,
            // borderColor: '#fff',
            // borderWidth: 2,
            // borderJoin: 'round',
          },
        },
      ],
    };
  };
  const pieSource = useMemo(() => {
    return pieData.dosageDetail.map((item) => ({
      name: item.insTagName,
      value: item.dosage,
    }));
  }, [pieData]);

  useMemo(() => {
    const xData = ((barData[0] || {}).columnars || []).map((item) => item.meterSpaceName) || [];
    setBarXData(xData);
    const series = barData.map((item) => {
      return {
        name: item.insTagName,
        type: 'bar',
        stack: 'Search Engine',
        barWidth: 18,
        emphasis: {
          focus: 'series',
        },
        data: item.columnars.map((j) => j.dosage),
      };
    });
    setBarSeriesData(series);
  }, [barData]);

  const onSelect = (e: any) => {
    if (e) {
      setMeterSpaceId(e.key);
    }
  };

  // 饼状图数据
  const queryPieData = async () => {
    const p = formRef.current?.getFieldFormatValueObject!();
    if (p.insType === '0') {
      setUnit('kW·h');
    } else {
      setUnit('m³');
    }
    const params = {
      ...p,
      period: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      meterSpaceId,
      insType: p.insType,
      recordTimeStart: p.ranger ? p.ranger[0] + ' 00:00:00' : undefined,
      recordTimeEnd: p.ranger ? p.ranger[1] + ' 23:59:59' : undefined,
    };
    const res = await getInsTagCollect(params);
    setPieData(res);
  };

  // 柱状图数据
  const queryBarData = async () => {
    const p = formRef.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      period: '3',
      meterSpaceId,
      insType: p.insType,
      recordTimeStart: p.ranger ? p.ranger[0] + ' 00:00:00' : undefined,
      recordTimeEnd: p.ranger ? p.ranger[1] + ' 23:59:59' : undefined,
    };
    const res = await getInsTagColumnar(params);
    setBarData(res);
  };

  useRequest(
    async () => {
      queryPieData();
      queryBarData();
    },
    {
      refreshDeps: [meterSpaceId],
    },
  );

  // useEffect(() => {
  //   queryPieData();
  //   queryBarData();
  // }, []);
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
          <ProCard split="horizontal">
            <ProCard>
              <ProForm
                layout="horizontal"
                colon={false}
                formRef={formRef}
                labelCol={{ flex: '100px' }}
                onValuesChange={(changeValues) => console.log(changeValues)}
                submitter={false}
              >
                <Row>
                  <Col span={6}>
                    <ProFormSelect
                      name="insType"
                      label="仪表类型"
                      initialValue={'0'}
                      valueEnum={insTypeMap.value}
                      fieldProps={{
                        allowClear: false,
                        loading: insTypeMap.loading,
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <ProFormDateRangePicker
                      name="ranger"
                      label="选择时间"
                      initialValue={[dayjs().subtract(6, 'day'), dayjs()]}
                    />
                  </Col>
                  <Col span={8}>
                    <Button
                      type="primary"
                      onClick={() => {
                        queryPieData();
                        queryBarData();
                      }}
                      style={{ marginLeft: '20px' }}
                    >
                      查询
                    </Button>
                  </Col>
                </Row>
              </ProForm>
            </ProCard>
            <ProCard>
              <ProCard split="vertical">
                <ProCard title="能源分项分布">
                  <div className={styles.staticCard}>
                    <div className={styles.staticCardLeft}>
                      <div className={styles.boldNum}>{pieData.averageDosage}</div>
                      <div>{unit}/天</div>
                    </div>
                    <Divider type="vertical" />
                    <div>
                      <span>占比最大：</span>
                      <span className={styles.boldText}>{pieData.maximumName}</span>
                    </div>
                    <div>
                      <span>占比最小：</span>
                      <span className={styles.boldText}>{pieData.minimumName}</span>
                    </div>
                  </div>
                  <PieChart
                    radius={['40%', '60%']}
                    center={['30%', '50%']}
                    source={pieSource}
                    legend={{
                      key: 'name',
                      position: 'right',
                      format: (name, row) => [name, row.value],
                      rich: {
                        _el0: {
                          width: 100,
                          padding: [0, 10, 0, 10],
                        },
                      },
                    }}
                    getOption={getPieOption}
                  />
                </ProCard>
                <ProCard title="能源分项分析">
                  <BarChart style={{ width: '100%', height: '400px' }} getOption={getOption} />
                </ProCard>
              </ProCard>
            </ProCard>
          </ProCard>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default TableList;
