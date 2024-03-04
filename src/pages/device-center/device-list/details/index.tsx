import { Card, Col, Row, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history, useParams } from 'umi';
import styles from './style.less';
import { deviceDetails, getDeviceTypeList } from '@/services/device';
import EventLogTable from './eventLogTable';
import VersionTable from './versionTable';
import AttributeTable from './attributeTable';

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
      label: `属性`,
      children: <AttributeTable data={details as any} deviceId={params.id} />,
    },
    {
      key: '2',
      label: `事件`,
      children: <EventLogTable deviceId={params.id} />,
    },
    // {
    //   key: '3',
    //   label: `远程调试`,
    //   children: <VersionTable data={details as any} deviceId={params.id} />,
    // },
  ];

  const routes = [
    {
      path: '/device-center',
      breadcrumbName: '设备中心',
    },
    {
      path: '/device-center/device-list',
      breadcrumbName: '设备列表',
    },
    {
      path: '/device-center/details/' + params?.id,
      breadcrumbName: '设备详情',
    },
  ];

  return (
    <PageContainer
      header={{
        title: null,
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
          const res = await deviceDetails(params.id);
          res.data.systemName = '智慧人行';
          setDetails(res.data as any);
          return res.data;
        }}
      >
        <Card className={styles.card} title="基础信息" bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="上游ID"
                name="did"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="设备ID"
                name="id"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="SN"
                name="sn"
                fieldProps={{
                  maxLength: 200,
                }}
                readonly
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="授权应用"
                name="systemName"
                fieldProps={{
                  maxLength: 200,
                }}
                readonly
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
              <ProFormText
                label="IP"
                name="ip"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText label="安装位置" name="spaceName" readonly />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="认证状态"
                name="authenticationStatus"
                readonly
                options={[
                  {
                    value: 1,
                    label: (
                      <>
                        <span className={styles.statusSuccess}>已认证</span>
                      </>
                    ),
                  },
                  {
                    value: 2,
                    label: (
                      <>
                        <span className={styles.statusError}>认证异常</span>
                      </>
                    ),
                  },
                  {
                    value: 3,
                    label: (
                      <>
                        <span className={styles.statusError}>认证异常</span>
                      </>
                    ),
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="Mac"
                name="mac"
                readonly
                fieldProps={{
                  maxLength: 200,
                }}
              />
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
