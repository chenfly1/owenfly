import React, { useEffect, useState } from 'react';
import { Tabs, Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import PersonageTable from './personage/personage-table';
import EnterpriseTable from './enterprise/enterprise-table';
import { useLocation } from 'umi';
import styles from './style.less';

const TableList: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');
  const location = useLocation();

  const onChange = (key: string) => {
    setActiveKey(key);
    if (key === '1') window.location.hash = '';
    if (key === '2') window.location.hash = 'customer';
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setActiveKey('2');
    } else {
      setActiveKey('1');
    }
  }, [location]);

  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <Card bordered={false}>
        {/* <Tabs
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: `个人客户`,
              key: '1',
              children: <PersonageTable />,
            },
            {
              label: `企业客户`,
              key: '2',
              children: <EnterpriseTable />,
            },
          ]}
        /> */}
        <PersonageTable />
      </Card>
    </PageContainer>
  );
};

export default TableList;
