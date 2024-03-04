import { CompareIndicator, Indicator, PieChart } from '@/components/StatisticCard';
import Line from '@/components/StatisticCard/Chart/Line';
import { parkPassDetail } from '@/services/bi';
import { Col, Row } from 'antd';
import { useMemo, useState } from 'react';

type IProps = {
  dates: string[];
  projectIds: string[];
  parkIds: string[];
  isRate: number;
};

const App: React.FC<IProps> = ({ projectIds, dates, parkIds, isRate }) => {
  const [detail, setDetail] = useState<any>({});
  const [xData, setXData] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [yData1, setYData1] = useState<number[]>([88, 3, 55, 5, 5, 66, 7, 99]);
  const [yData2, setYData2] = useState<number[]>([4, 76, 33, 25, 5, 66, 67, 17]);
  const queryDetail = async () => {
    const res = await parkPassDetail({
      projectIds: projectIds,
      start: dates[0],
      end: dates[1],
      parkIds,
      isRate,
    });
    setDetail(res.data || {});
  };
  useMemo(() => {
    queryDetail();
  }, [dates, parkIds]);

  useMemo(() => {
    setXData(Object.keys(detail.entryGraph || {}));
    setYData1(Object.values(detail.entryGraph || {}));
    setYData2(Object.values(detail.exitGraph || {}));
  }, [detail]);
  return (
    <>
      <Row>
        <Col span={8}>
          <Indicator
            label="进场车辆总数"
            value={detail.entryCount}
            unit="次"
            size="middle"
            labelStyle={{ fontWeight: 'bold' }}
          />
          {isRate === 1 && (
            <CompareIndicator
              label="较上期"
              value={detail.entryCompare + '%'}
              direction={detail.entryCompare >= 0 ? 'top' : 'down'}
            />
          )}
        </Col>
        <Col span={8}>
          <Indicator
            label="离场车辆总数"
            value={detail.exitCount}
            unit="次"
            size="middle"
            labelStyle={{ fontWeight: 'bold' }}
          />
          {isRate === 1 && (
            <CompareIndicator
              label="较上期"
              value={detail.exitCompare + '%'}
              direction={detail.exitCompare >= 0 ? 'top' : 'down'}
            />
          )}
        </Col>
      </Row>
      <Line
        style={{ padding: '20px 0 0 0' }}
        data={[
          { name: '进场', data: yData1 },
          { name: '离场', data: yData2 },
        ]}
        options={{
          yAxis: {
            type: 'value',
            name: '单位/次',
            nameTextStyle: {
              align: 'center',
              verticalAlign: 'bottom',
              padding: [0, 20, 10, 0],
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
          },
          xAxis: {
            type: 'category',
            data: xData,
            axisTick: {
              show: false,
            },
          },
          grid: { top: 50, right: 36, bottom: 40, left: 36 },
          legend: {
            data: ['进场', '离场'],
            right: '10%',
            top: 'top',
          },
        }}
      />
    </>
  );
};

export default App;
