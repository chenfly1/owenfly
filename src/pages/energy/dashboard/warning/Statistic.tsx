import { CompareIndicator, Indicator, Wrapper } from '@/components/StatisticCard';
import { CompareIndicatorProps } from '@/components/StatisticCard/CompareIndicator';
import { Row, Col } from 'antd';

export interface StatisticProps {
  waringCount?: number;
  electricityExceedCount?: number;
  waterExceedCount?: number;
  compare?: CompareIndicatorProps;
}

export default ({ title, source = {} }: { title: string; source?: Partial<StatisticProps> }) => {
  return (
    <Wrapper style={{ minHeight: 170, height: '100%' }} title={title}>
      <Row gutter={[16, 8]} justify="space-between">
        <Col style={{ height: '87px' }}>
          <Indicator size="large" label="告警次数" value={source?.waringCount || 0} unit="次" />
          {source?.compare ? <CompareIndicator {...source.compare} /> : null}
        </Col>
        <Col>
          <Indicator
            size="large"
            label="用电超额"
            value={source?.electricityExceedCount || 0}
            countProps={{ decimals: 2 }}
            unit="kW·h"
          />
        </Col>
        <Col>
          <Indicator
            size="large"
            label="用水超额"
            value={source?.waterExceedCount || 0}
            countProps={{ decimals: 2 }}
            unit="m³"
          />
        </Col>
      </Row>
    </Wrapper>
  );
};
