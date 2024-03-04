import { CompareIndicator, Indicator, PieChart } from '@/components/StatisticCard';
import { authVehicStatic } from '@/services/bi';
import { Col, Row } from 'antd';
import { useMemo, useState } from 'react';

type IProps = {
  dates: string[];
  projectIds: string[];
  isRate: number;
};

const App: React.FC<IProps> = ({ dates, projectIds, isRate }) => {
  const [total, setTotal] = useState<number>(0);
  const [detailData, setDetailData] = useState<AuthVehicStaticType>({
    property: 0,
    moth: 0,
    propertyRate: 'jq9gng',
    mothRate: 'vkpqu5',
    collect: [
      {
        id: '1',
        name: '产权车辆',
        type: '1',
        count: 0,
        rate: '0',
      },
      {
        id: '2',
        name: '月租车辆',
        type: '2',
        count: 0,
        rate: '0',
      },
      {
        id: '3',
        name: '免费车辆',
        type: '3',
        count: 0,
        rate: '0',
      },
      {
        id: '4',
        name: '访客车辆',
        type: '5',
        count: 0,
        rate: '0',
      },
      {
        id: '5',
        name: '其它车辆',
        type: '5',
        count: 0,
        rate: '0',
      },
    ],
  });
  const queryDetail = async () => {
    const res = await authVehicStatic({
      projectIds: projectIds,
      start: dates[0],
      end: dates[1],
      isRate,
    });
    setDetailData(res.data);
  };
  useMemo(() => {
    queryDetail();
  }, [dates]);

  const source = useMemo(() => {
    const totalTem = detailData.collect.reduce((prev, { count }) => prev + count, 0);
    setTotal(totalTem);
    return (detailData.collect || []).map((item) => {
      return {
        value: item.count,
        name: item.name,
        rate: item.rate + '%',
      };
    });
  }, [detailData]);
  return (
    <>
      <Row>
        <Col span={12}>
          <Indicator
            label="产权车辆"
            value={detailData.property}
            unit="辆"
            size="middle"
            labelStyle={{ fontWeight: 'bold' }}
          />
          {isRate === 1 && (
            <CompareIndicator
              label="较上期"
              value={detailData.propertyRate + '%'}
              direction={Number(detailData.propertyRate) > 0 ? 'down' : 'top'}
            />
          )}
        </Col>
        <Col span={12}>
          <Indicator
            label="月租车辆"
            value={detailData.moth}
            unit="辆"
            size="middle"
            labelStyle={{ fontWeight: 'bold' }}
          />
          {isRate === 1 && (
            <CompareIndicator
              label="较上期"
              value={detailData.mothRate + '%'}
              direction={Number(detailData.mothRate) > 0 ? 'down' : 'top'}
            />
          )}
        </Col>
      </Row>
      <PieChart
        style={{ height: '266px' }}
        // source={[
        //   { value: 335, name: '产权车辆', rate: '10%' },
        //   { value: 310, name: '月租车辆', rate: '10%' },
        //   { value: 234, name: '免费车辆', rate: '10%' },
        //   { value: 135, name: '其它车辆', rate: '10%' },
        //   { value: 135, name: '访客车辆', rate: '10%' },
        // ]}
        source={source}
        center={['30%', '50%']}
        legend={{
          key: 'name',
          position: 'right',
          format: (name, row) => {
            return [name, row.rate];
          },
          rich: {
            name: {
              width: 60,
              padding: [0, 0, 0, 10],
              align: 'left',
            },
            rate: {
              width: 0,
            },
          },
          x: 'auto',
          right: '10%',
        }}
        insideContent={{
          label: '车辆总数',
          value: total,
        }}
      />
    </>
  );
};

export default App;
