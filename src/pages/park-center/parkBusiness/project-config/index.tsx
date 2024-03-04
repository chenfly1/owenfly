import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { TabsProps } from 'antd';
import { Card, Modal } from 'antd';
import { Tabs } from 'antd';
import ConfigVisit from './config-visit';
import ConfigBus from './config-bus';
import { useLocation } from 'react-router';
import { history } from 'umi';
import { ExclamationCircleFilled } from '@ant-design/icons';
import style from './style.less';

export default () => {
  const busRef = useRef<any>();
  const visitRef = useRef<any>();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '小程序业务办理',
      children: <ConfigBus ref={busRef} />,
    },
    {
      key: '2',
      label: '访客车辆配置',
      children: <ConfigVisit ref={visitRef} />,
    },
  ];

  const [activeKey, setActiveKey] = useState('1');
  const location = useLocation();
  const hashArray = ['bus', 'visit'];

  useEffect(() => {}, [location]);

  const changeSuccess = (key: string) => {
    window.location.hash = hashArray[Number(key) - 1];
    setActiveKey(key);
  };

  const afterClick = (key: string, currentRef: any) => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '数据还未保存，是否保存？',
      centered: true,
      onOk: async () => {
        currentRef.onEditBtn(() => {
          changeSuccess(key);
        });
      },
      onCancel() {
        changeSuccess(key);
      },
    });
  };
  const handleChange = (key: string) => {
    if (!busRef.current.disable) {
      if (activeKey === '1') {
        afterClick(key, busRef.current);
      } else if (activeKey === '2') {
        afterClick(key, visitRef.current);
      }
    } else {
      changeSuccess(key);
    }
  };
  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Card bodyStyle={{ padding: '0px 24px' }} bordered={false}>
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={(key) => {
            handleChange(key);
          }}
        />
      </Card>
    </PageContainer>
  );
};
