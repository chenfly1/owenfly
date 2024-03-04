import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import Advertisement from './advertisement';
import WorkGarden from './work-garden';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
const TableList: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const onChange = (key: string) => {
    setActiveKey(key);
  };
  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <Card bordered={false}>
        <Tabs
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: `工作园地`,
              key: '1',
              children: <WorkGarden />,
            },
            {
              label: `个人中心广告`,
              key: '2',
              children: <Advertisement />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default TableList;
