import { useState } from 'react';
import { Tabs, Card } from 'antd';
import TemporaryList from './temporary-list';
import MonthlyList from './monthly-list';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
export default () => {
  const hash = window.location.hash.slice(1) || '1';
  const [activeKey, setActiveKey] = useState<string>(hash);
  return (
    <PageContainer header={{ title: null }}>
      <Card bordered={false} className={styles.cardStyle}>
        <Tabs
          activeKey={activeKey}
          onChange={(key: any) => {
            window.location.hash = key;
            setActiveKey(key);
          }}
          items={[
            {
              label: `临停车辆交易记录`,
              key: '1',
              children: <TemporaryList />,
            },
            {
              label: `月租车辆交易记录`,
              key: '2',
              children: <MonthlyList />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};
