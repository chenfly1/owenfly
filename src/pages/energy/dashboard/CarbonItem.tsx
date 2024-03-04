import { Indicator, Wrapper } from '@/components/StatisticCard';
import { Button, Col, Row, Divider } from 'antd';
import { history } from 'umi';

interface ItemProps {
  carbon: number; // 碳排放量
  carbonDioxide: number; // 二氧化碳排放量
}

export interface CarbonItemProps {
  today: ItemProps; // 今日碳指标统计
  currentMonth: ItemProps; // 本月碳指标统计
  currentYear: ItemProps; // 本年度碳指标统计
}

export default (props: Partial<CarbonItemProps>) => {
  const unit = 'kg';
  return (
    <Wrapper
      title="碳指标排放"
      extra={[
        <Button
          key="check"
          type="link"
          onClick={() => {
            history.push({
              pathname: '/energy/analysis/carbon',
            });
          }}
        >
          查看详情
        </Button>,
      ]}
    >
      <Row justify="space-between">
        <Col>
          <h3>今日</h3>
          <div>
            <Indicator
              label="碳排放"
              value={props.today?.carbon || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
            <Indicator
              label="二氧化碳排放"
              value={props.today?.carbonDioxide || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
          </div>
        </Col>
        <Divider style={{ height: 'inherit' }} type="vertical" dashed={true} />
        <Col>
          <h3>本月</h3>
          <div>
            <Indicator
              label="碳排放"
              value={props.currentMonth?.carbon || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
            <Indicator
              label="二氧化碳排放"
              value={props.currentMonth?.carbonDioxide || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
          </div>
        </Col>
        <Divider style={{ height: 'inherit' }} type="vertical" dashed={true} />
        <Col>
          <h3>本年</h3>
          <div>
            <Indicator
              label="碳排放"
              value={props.currentYear?.carbon || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
            <Indicator
              label="二氧化碳排放"
              value={props.currentMonth?.carbonDioxide || 0}
              countProps={{ decimals: 2 }}
              unit={unit}
              inline={true}
              size="large"
            />
          </div>
        </Col>
      </Row>
    </Wrapper>
  );
};
