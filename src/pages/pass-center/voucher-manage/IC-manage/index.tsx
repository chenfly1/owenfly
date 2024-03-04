import React, { useRef, useState } from 'react';
import { Tabs, Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import ICInit from './IC-init';
import ICInformation from './IC-information';
const TableList: React.FC = () => {
  const ref = useRef<any>();
  const initRef = useRef<any>();
  const [activeKey, setActiveKey] = useState('1');

  const onChange = (key: string) => {
    ref?.current?.closeSerial();
    initRef?.current?.closeSerial();
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
              label: `IC卡初始化`,
              key: '1',
              children: <ICInit ref={initRef} />,
            },
            {
              label: `查看卡信息`,
              key: '2',
              children: <ICInformation ref={ref} />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default TableList;
