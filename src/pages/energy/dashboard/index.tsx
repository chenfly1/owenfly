import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import {
  getEnergyCarbonStatistic,
  getEnergyConsumptionStatistic,
  getEnergyWarningStatistic,
} from '@/services/energy';
import { CompareIndicatorProps } from '@/components/StatisticCard/CompareIndicator';
import WarningItem, { WaringItemProps } from './WarningItem';
import CarbonItem, { CarbonItemProps } from './CarbonItem';
import EnergyTrendItem from './EnergyTrendItem';
import { EnergyCategoryItem } from './EnergyCategoryItem';
import {
  ConsumptionItemProps,
  ElectricityConsumptionItem,
  WaterConsumptionItem,
} from './ConsumptionItem';
import PageWrapper from '@/components/PageWrapper';

// 获取环比趋势方向
export const getDirection = (value: string | number): CompareIndicatorProps['direction'] => {
  const val = Number(value);
  if (isNaN(val)) return undefined;
  if (val > 0) return 'top';
  if (val < 0) return 'down';
  return undefined;
};

export default () => {
  const [source, setSource] = useState<
    Partial<{
      electricityConsumption: ConsumptionItemProps;
      waterConsumption: ConsumptionItemProps;
      warning: WaringItemProps;
      carbon: CarbonItemProps;
    }>
  >();

  const getSource = async () => {
    // 电量统计
    getEnergyConsumptionStatistic({ type: 0 }).then((res) => {
      setSource((prev) => ({
        ...prev,
        electricityConsumption: {
          currentMonth: res.currentMonth.readOfTotal,
          lastMonth: res.lastMonth.readOfTotal,
          precedingMonth: res.precedingMonth.readOfTotal,
          compare: {
            lastMonth: {
              value: `${((res.compare ?? 0) * 100).toFixed(2)}%`,
              direction: getDirection(res.compare),
            },
          },
        },
      }));
    });
    // 水量统计
    getEnergyConsumptionStatistic({ type: 1 }).then((res) => {
      setSource((prev) => ({
        ...prev,
        waterConsumption: {
          currentMonth: res.currentMonth.readOfTotal,
          lastMonth: res.lastMonth.readOfTotal,
          precedingMonth: res.precedingMonth.readOfTotal,
          compare: {
            lastMonth: {
              value: `${((res.compare ?? 0) * 100).toFixed(2)}%`,
              direction: getDirection(res.compare),
            },
          },
        },
      }));
    });
    // 能耗超限告警统计
    getEnergyWarningStatistic().then((res) => {
      setSource((prev) => ({
        ...prev,
        warning: {
          today: res.today,
          yesterday: res.yesterday,
          currentMonth: res.currentMonth,
          lastMonth: res.lastMonth,
          compare: {
            yesterday: {
              value: `${((res.compareYesterday ?? 0) * 100).toFixed(2)}%`,
              direction: getDirection(res.compareYesterday),
            },
            lastMonth: {
              value: `${((res.compareLastMonth ?? 0) * 100).toFixed(2)}%`,
              direction: getDirection(res.compareLastMonth),
            },
          },
        },
      }));
    });
    // 碳排放统计信息
    getEnergyCarbonStatistic().then((res) => {
      setSource((prev) => ({
        ...prev,
        carbon: {
          today: res.today,
          currentMonth: res.month,
          currentYear: res.year,
        },
      }));
    });
  };

  useEffect(() => {
    getSource();
  }, []);

  return (
    <PageWrapper title="首页">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <ElectricityConsumptionItem {...source?.electricityConsumption} />
        </Col>
        <Col span={8}>
          <WaterConsumptionItem {...source?.waterConsumption} />
        </Col>
        <Col span={8}>
          <WarningItem {...source?.warning} />
        </Col>
        <Col span={16}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <CarbonItem {...source?.carbon} />
            </Col>
            <Col span={24}>
              <EnergyTrendItem />
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <EnergyCategoryItem />
        </Col>
      </Row>
    </PageWrapper>
  );
};
