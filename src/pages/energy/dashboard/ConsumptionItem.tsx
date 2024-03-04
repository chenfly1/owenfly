import { CompareIndicator, Indicator, Wrapper } from '@/components/StatisticCard';
import { Col, Row } from 'antd';

export interface ConsumptionItemProps {
  currentMonth: number; // 当月用量
  lastMonth: number; // 上月用量
  precedingMonth: number; // 前月用量
  compare: {
    lastMonth: {
      value: string;
      direction?: 'top' | 'down';
    };
  }; // 对比上月计算量
}

export const ElectricityConsumptionItem = (props: Partial<ConsumptionItemProps>) => {
  const unit = 'kW·h';
  return (
    <Wrapper bodyStyle={{ height: 168 }} title="用电量">
      <Indicator
        className="mb-5"
        label="本月用电量"
        value={props.currentMonth || 0}
        countProps={{ decimals: 2 }}
        unit={unit}
        size="large"
      />
      <Row justify="space-between">
        <Col span={15}>
          <Indicator
            className="mb-5 mr-5"
            label="上月用电"
            value={props.lastMonth || 0}
            countProps={{ decimals: 2 }}
            unit={unit}
            inline={true}
            size="middle"
          />
          <CompareIndicator
            label="较前月"
            value={props.compare?.lastMonth?.value || 0}
            direction={props.compare?.lastMonth?.direction}
            inline={true}
          />
        </Col>
        <Col span={9}>
          <Indicator
            label="前月用电"
            value={props.precedingMonth || 0}
            countProps={{ decimals: 2 }}
            unit={unit}
            inline={true}
            size="middle"
          />
        </Col>
      </Row>
    </Wrapper>
  );
};

export const WaterConsumptionItem = (props: Partial<ConsumptionItemProps>) => {
  const unit = (
    <>
      m<sup>3</sup>
    </>
  );
  return (
    <Wrapper bodyStyle={{ height: 168 }} title="用水量">
      <Indicator
        className="mb-5"
        label="本月用水量"
        value={props.currentMonth || 0}
        countProps={{ decimals: 2 }}
        unit={unit}
        size="large"
      />
      <Row justify="space-between">
        <Col span={15}>
          <Indicator
            className="mb-5 mr-5"
            label="上月用水"
            value={props.lastMonth || 0}
            countProps={{ decimals: 2 }}
            unit={unit}
            inline={true}
            size="middle"
          />
          <CompareIndicator
            label="较前月"
            value={props.compare?.lastMonth.value || 0}
            direction={props.compare?.lastMonth.direction}
            inline={true}
          />
        </Col>
        <Col span={9}>
          <Indicator
            label="前月用水"
            value={props.precedingMonth || 0}
            countProps={{ decimals: 2 }}
            unit={unit}
            inline={true}
            size="middle"
          />
        </Col>
      </Row>
    </Wrapper>
  );
};
