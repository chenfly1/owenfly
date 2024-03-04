import { Card, Col, Row, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history, useParams } from 'umi';
import styles from './style.less';
import { getEdgeDeviceDetails } from '@/services/device';
import NetWorkSubsetTable from './netWorkSubsetTable';
// import NetWorkMonitoringTable from './NetWorkMonitoringTable';

const DeviceDetails: FC<Record<string, any>> = () => {
  const params: { id: string } = useParams();
  const [activeKey, setActiveKey] = useState<string>('1');
  const [details, setDetails] = useState<devicesListType>();

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `网关子设备`,
      children: <NetWorkSubsetTable did={details?.did as any} />,
    },
    // {
    //   key: '2',
    //   label: `网关监控`,
    //   children: <NetWorkMonitoringTable deviceId={params.id} />,
    // }
  ];

  const routes = [
    {
      path: '/device-center',
      breadcrumbName: '设备中心',
    },
    {
      path: '/device-center/device-edge-list',
      breadcrumbName: '边缘端管理',
    },
    {
      path: '/device-center/device-edge-list/details',
      breadcrumbName: '实例详情',
    },
  ];

  return (
    <PageContainer
      header={{
        title: '实例详情',
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProForm
        layout="horizontal"
        submitter={{
          searchConfig: {
            resetText: '返回', //修改ProForm重置文字
          },
          submitButtonProps: {
            style: {
              // 隐藏提交按钮
              display: 'none',
            },
          },
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={() => history.goBack()}
        request={async () => {
          const res = await getEdgeDeviceDetails(params.id);
          setDetails(res.data as any);
          return res.data;
        }}
      >
        <Card className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="DID"
                name="did"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="软件版本"
                name="softVersion"
                fieldProps={{
                  maxLength: 200,
                }}
                readonly
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText label="固件版本" name="firmwareVersion" readonly />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="IP地址"
                name="ip"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="网络状态"
                name="status"
                readonly
                options={[
                  {
                    value: 1,
                    label: (
                      <>
                        <span className={styles.statusSuccess}>在线</span>
                      </>
                    ),
                  },
                  {
                    value: 0,
                    label: (
                      <>
                        <span className={styles.statusError}>离线</span>
                      </>
                    ),
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText label="注册人" name="gmtCreator" readonly />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText label="注册时间" name="registerDate" readonly />
            </Col>
          </Row>
        </Card>
        <Card className={styles.cardTab} bordered={false}>
          <Tabs activeKey={activeKey} items={items} onChange={onChange} />
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default DeviceDetails;
