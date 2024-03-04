import { Indicator } from '@/components/StatisticCard';
import { Card } from 'antd';

export interface SCProps {
  label: string;
  value: number;
  unit: string;
  rate?: string;
}

const StatisticCard = ({ label, value, unit, rate }: SCProps) => {
  return (
    <Card
      bordered={false}
      bodyStyle={{ background: '#F5F7F9', minHeight: '94px', padding: '24px 24px 10px' }}
    >
      <Indicator
        label={label}
        value={value}
        unit={unit}
        inline={true}
        style={{
          display: 'flex',
          // justifyContent: '',
          alignItems: 'center',
          flex: 1,
        }}
        countProps={{
          decimals: 2,
        }}
        labelStyle={{ fontSize: '16px', paddingRight: '10px' }}
        valueStyle={{ fontSize: '20px' }}
        unitStyle={{ fontSize: '16px' }}
      />
      {rate && (
        <div
        // style={{
        //   display: 'flex',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        // }}
        >
          {/* <div style={{ fontSize: '10px', paddingRight: '10px' }}>占比</div> */}
          <div style={{ fontSize: '16px' }}>{`(${rate}%）`}</div>
        </div>
      )}
    </Card>
  );
};

export default StatisticCard;
