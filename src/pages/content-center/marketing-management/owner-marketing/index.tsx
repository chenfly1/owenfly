import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import Advertisement from './advertisement';
import Cephalogram from './cephalogram';
import Notice from './notice';
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
              label: `首页头图`,
              key: '1',
              children: <Cephalogram />,
            },
            {
              label: `通知栏`,
              key: '2',
              children: <Notice />,
            },
            {
              label: `个人中心广告`,
              key: '3',
              children: <Advertisement />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default TableList;
