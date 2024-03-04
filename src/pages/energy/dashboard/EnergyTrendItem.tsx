import { BarChart, Wrapper } from '@/components/StatisticCard';
import { getEnergyTrendingStatistic } from '@/services/energy';
import { Button, DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'antd/es/date-picker/style/css';

interface EnergyTrendItemProps {
  electricity: {
    time: string;
    value: number;
    unit: string;
  }[];
  water: {
    time: string;
    value: number;
    unit: string;
  }[];
}

type RangeValue = [moment.Moment | null, moment.Moment | null] | null;
const defaultValue: RangeValue = [
  dayjs().subtract(7, 'day').startOf('day') as moment.Moment,
  dayjs().subtract(1, 'day').endOf('day') as moment.Moment,
];
export default () => {
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<RangeValue>(defaultValue);
  const [value, setValue] = useState<RangeValue>(defaultValue);
  const [source, setSource] = useState<EnergyTrendItemProps>({
    electricity: [],
    water: [],
  });

  const getSource = async (values = value) => {
    // 获取统计数据
    setLoading(true);
    try {
      const res = await getEnergyTrendingStatistic({
        startTime: values?.[0]?.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: values?.[1]?.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      });
      setSource({
        electricity: Object.keys(res.electricity).map((time) => ({
          time,
          value: Number(res.electricity[time] || 0),
          unit: 'kW·h',
        })),
        water: Object.keys(res.water).map((time) => ({
          time,
          value: Number(res.water[time] || 0),
          unit: 'm³',
        })),
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const disabledDate = (current: moment.Moment) => {
    if (current && current >= dayjs().startOf('day')) return true;
    if (!dates) return false;
    const tooLate = dates[0] && current.diff(dates[0], 'days') >= 7;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') >= 7;
    return !!tooEarly || !!tooLate;
  };

  useEffect(() => {
    getSource();
  }, []);

  return (
    <Wrapper
      title="用能趋势"
      extra={[
        <>
          <Button type="text">
            选择日期：
            <DatePicker.RangePicker
              value={dates || value}
              disabledDate={disabledDate}
              onCalendarChange={(val) => {
                setDates(val);
              }}
              onChange={(val) => {
                setValue(val);
              }}
              onOpenChange={(open) => {
                if (!open) getSource();
              }}
            />
          </Button>
        </>,
      ]}
    >
      <Spin spinning={loading}>
        <BarChart
          style={{
            height: 342,
          }}
          transformSourceConfig={{
            categoryKey: 'time',
            valueKey: 'value',
          }}
          source={{
            用电量: source.electricity,
            用水量: source.water,
          }}
          legend={{
            key: 'name',
            position: 'top',
            show: true,
          }}
          colors={['#0D74FF', '#44EB57']}
          getOption={(options) => {
            return {
              ...options,
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              yAxis: [
                {
                  name: 'kW·h',
                  type: 'value',
                },
                {
                  name: 'm³',
                  type: 'value',
                },
              ],
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
              },
              series: options.series.map((item: any, index: number) => ({
                ...item,
                yAxisIndex: index,
              })),
            };
          }}
        />
      </Spin>
    </Wrapper>
  );
};
