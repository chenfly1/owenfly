import { Indicator } from '@/components/StatisticCard';
import { Card, Image } from 'antd';

export interface SCProps {
  label: string;
  value: number;
  unit?: string;
  rate?: string;
}

const StatisticCard = ({ label, value, unit, rate }: SCProps) => {
  return (
    <Card bordered bodyStyle={{ display: 'flex', justifyContent: 'space-between' }}>
      <Indicator
        label={label}
        value={value}
        unit={unit}
        // inline={true}
        // style={{
        //   display: 'flex',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        //   flex: 1,
        // }}
        // countProps={{
        //   decimals: 2,
        // }}
        labelStyle={{ fontSize: '20px', paddingRight: '10px' }}
        valueStyle={{ fontSize: '20px', color: '#0d74ff' }}
        unitStyle={{ fontSize: '20px' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* <div style={{ fontSize: '10px', paddingRight: '10px' }}>占比</div> */}
        {/* <div style={{ fontSize: '18px', color: '#0d74ff' }}>{`(${rate}%）`}</div> */}
        <Image src="/images/header-community.svg" width={80} height={80} preview={false} />
      </div>
    </Card>
  );
};

export default StatisticCard;
