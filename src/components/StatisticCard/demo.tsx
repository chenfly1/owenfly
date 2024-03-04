import { Button } from 'antd';
import { Wrapper, Indicator, CompareIndicator, PieChart, BarChart } from './index';

export default () => (
  <div>
    <BarChart
      transformSourceConfig={{
        name: 'test',
        categoryKey: 'name',
        valueKey: 'value',
      }}
      swap={true}
      source={[
        { value: 335, name: '直接访问' },
        { value: 310, name: '邮件营销' },
        { value: 234, name: '联盟广告' },
        { value: 135, name: '视频广告' },
        { value: 1548, name: '搜索引擎' },
      ]}
      legend={{
        key: 'name',
        position: 'top',
        width: 100,
        show: true,
        format: (name, row) => `${name} (${row.name})`,
      }}
    />
    <PieChart
      source={[
        { value: 335, name: 'abcd' },
        { value: 310, name: 'efdd' },
        { value: 234, name: 'sssd' },
        { value: 135, name: 'fdsfs' },
        { value: 1548, name: 'sddff' },
      ]}
      center={['50%', '30%']}
      legend={{
        key: 'name',
        position: 'bottom',
        format: (name, row) => `${name} (${row.value})`,
      }}
      insideContent={{
        label: '实收共计(万元)',
        value: '20000',
        compare: {
          label: '较前期',
          value: '400',
          direction: 'down',
        },
      }}
    />
    <div style={{ width: '240px', marginLeft: '30px' }}>
      <Wrapper title="总收入" extra={[<Button type="link">查看排名</Button>]}>
        <div>
          <Indicator value={100} unit="万元" size="large" />
          <CompareIndicator label="较前期" value={100} direction="top" />
          <Indicator
            className="mt-5"
            label="应收总数"
            value={100}
            unit="万元"
            size="small"
            inline={true}
          />
          <Indicator label="应收总数" value={100} unit="万元" size="small" inline={true} />
        </div>
      </Wrapper>
    </div>
  </div>
);
