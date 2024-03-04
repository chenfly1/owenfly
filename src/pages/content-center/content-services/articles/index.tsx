import React, { useEffect, useState } from 'react';
import { Tabs, Card } from 'antd';
import CommunityArticlesTable from './community-articles';
import WorkArticlesTable from './work-articles';
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
              label: `社区文章`,
              key: '1',
              children: <CommunityArticlesTable />,
            },
            {
              label: `工作文章`,
              key: '2',
              children: <WorkArticlesTable />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default TableList;
