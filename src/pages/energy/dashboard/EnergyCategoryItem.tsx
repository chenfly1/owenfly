import { PieChart, Wrapper } from '@/components/StatisticCard';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { getEnergyCategoryStatistic } from '@/services/energy';
import { DatePicker, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'antd/es/date-picker/style/css';

type RangeValue = [moment.Moment | null, moment.Moment | null] | null;
const defaultValue: RangeValue = [
  dayjs().subtract(7, 'day').startOf('day') as moment.Moment,
  dayjs().subtract(1, 'day').endOf('day') as moment.Moment,
];

export const EnergyCategoryItem = () => {
  const [loading, setLoading] = useState(false);
  // todo: 优化默认值
  const [meterType, setMeterType] = useState<string>('0');
  const [dates, setDates] = useState<RangeValue>(defaultValue);
  const [dateValue, setDateValue] = useState<RangeValue>(defaultValue);
  const { insTypeMap } = useInitState<EnergyState>('useEnergy', ['insTypeMap']);
  const [source, setSource] = useState<{
    data: {
      value: number;
      name: string;
    }[];
    total: number;
  }>();

  const getSource = async (options: { insType?: string } = {}) => {
    try {
      setLoading(true);
      const { dosageDetail } = await getEnergyCategoryStatistic({
        insType: meterType,
        period: 3, // 按日统计
        recordTimeStart: dateValue?.[0]?.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        recordTimeEnd: dateValue?.[1]?.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ...options,
      });
      let total = 0;
      const data = dosageDetail.map((item) => {
        const value = Number(item.dosage);
        total += value;
        return {
          value: value,
          name: item.insTagName,
        };
      });
      setSource({
        data,
        total: total ? Number(total.toFixed(2)) : 0,
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

  const unit = meterType === '0' ? 'kW·h' : 'm³';

  useEffect(() => {
    getSource();
  }, []);

  return (
    <Wrapper
      title="能源分析分布"
      style={{
        height: 592,
        overflowY: 'scroll',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }} key="meter" className="mb-10">
        <span style={{ width: '80px' }}>选择仪表：</span>
        <Select
          value={meterType}
          style={{ flex: 1 }}
          allowClear={false}
          options={Object.keys(insTypeMap.value || {}).map((key) => ({
            value: key,
            label: insTypeMap.value[key],
          }))}
          onChange={(val) => {
            setMeterType(val);
            getSource({ insType: val });
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }} key="date" className="mb-10">
        <span style={{ width: '80px' }}>选择日期：</span>
        <DatePicker.RangePicker
          style={{ flex: 1 }}
          allowClear={false}
          value={dates || dateValue}
          disabledDate={disabledDate}
          onCalendarChange={(val) => {
            setDates(val);
          }}
          onChange={(val) => {
            setDateValue(val);
          }}
          onOpenChange={(open) => {
            if (!open) {
              getSource();
            }
          }}
        />
      </div>
      <Spin spinning={loading}>
        <PieChart
          source={source?.data}
          center={['50%', '120']}
          colors={['#0D74FF', '#44EB57']}
          legend={{
            key: 'name',
            position: {
              x: 'center',
              y: '230',
            },
            format: (name, row) => [
              name,
              `${row.value} ${unit}`,
              source?.total ? `${((row.value / source.total) * 100).toFixed(2)}%` : '',
            ],
            rich: {
              _el0: {
                width: 100,
                padding: [0, 0, 0, 10],
                align: 'left',
              },
              _el1: {
                width: 100,
                padding: [0, 0, 0, 10],
                align: 'left',
              },
            },
          }}
          insideContent={{
            label: `总用量 ${unit}`,
            value: source?.total ?? 0,
          }}
        />
      </Spin>
    </Wrapper>
  );
};
