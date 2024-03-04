import React, { useEffect, useState } from 'react';
import { Tabs, Card } from 'antd';
import HouseTable from './house/house-table';
import StallTable from './stall/stall-table';
import { PageContainer } from '@ant-design/pro-layout';
import { useLocation } from 'umi';
import styles from './index.less';
const TableList: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setActiveKey('2');
    } else {
      setActiveKey('1');
    }
  }, [location]);

  const onChange = (key: string) => {
    setActiveKey(key);
    if (key === '1') window.location.hash = '';
    if (key === '2') window.location.hash = 'stall';
  };
  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <Card bordered={false}>
        <Tabs
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: `房产`,
              key: '1',
              children: <HouseTable />,
            },
            {
              label: `车位`,
              key: '2',
              children: <StallTable />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default TableList;
