import { CompareIndicator, Indicator, Wrapper } from '@/components/StatisticCard';
import { Button, Col, Row } from 'antd';
import { history } from 'umi';

export interface WaringItemProps {
  today: number; // 当日告警数量
  yesterday: number; // 昨日告警数量
  currentMonth: number; // 本月告警数量
  lastMonth: number; // 上月告警数量
  compare: {
    yesterday: {
      value: string;
      direction?: 'top' | 'down';
    }; // 日对比计算量
    lastMonth: {
      value: string;
      direction?: 'top' | 'down';
    }; // 月对比计算量
  };
}

export default (props: Partial<WaringItemProps>) => {
  const unit = '次';
  return (
    <Wrapper
      bodyStyle={{ height: 168 }}
      title="能耗超限报警"
      extra={[
        <Button
          key="check"
          type="link"
          onClick={() => {
            history.push({
              pathname: '/energy/dashboard/warning',
            });
          }}
        >
          查看详情
        </Button>,
      ]}
    >
      <Row justify="space-between">
        <Col span={12}>
          <Indicator label="今日" value={props.today || 0} unit={unit} size="large" inline={true} />
        </Col>
        <Col span={12}>
          <Indicator
            className="mr-5"
            label="昨日"
            value={props.yesterday || 0}
            unit={unit}
            size="large"
            inline={true}
          />
          <CompareIndicator
            label="较前日"
            value={props.compare?.yesterday.value || 0}
            direction={props.compare?.yesterday.direction}
            inline={true}
          />
        </Col>
        <Col span={12}>
          <Indicator
            label="本月"
            value={props.currentMonth || 0}
            unit={unit}
            inline={true}
            size="large"
          />
        </Col>
        <Col span={12}>
          <Indicator
            className="mr-5"
            label="上月"
            value={props.lastMonth || 0}
            unit={unit}
            inline={true}
            size="large"
          />
          <CompareIndicator
            label="较前月"
            value={props.compare?.lastMonth.value || 0}
            direction={props.compare?.lastMonth.direction}
            inline={true}
          />
        </Col>
      </Row>
    </Wrapper>
  );
};
