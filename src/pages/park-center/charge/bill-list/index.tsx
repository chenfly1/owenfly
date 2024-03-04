import React from 'react';
import { Tabs, Card } from 'antd';
import TemporaryList from './temporary-list';
import MonthlyList from './monthly-list';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
export default () => {
  return (
    <PageContainer header={{ title: null }}>
      <Card bordered={false} className={styles.cardStyle}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              label: `临停订单记录`,
              key: '1',
              children: <TemporaryList />,
            },
            {
              label: `月租车辆订单记录`,
              key: '2',
              children: <MonthlyList />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};
