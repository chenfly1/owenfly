import { Button, Card, Col, Row, message } from 'antd';
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history, useParams } from 'umi';
import styles from './style.less';
import { ProFormSelect, type ProFormInstance } from '@ant-design/pro-components';
import TriggerCard from './triggerCard';
import PushCard from './pushCard';
import {
  getDeviceAlarmDetails,
  getDeviceAlarmLogDetails,
  saveDeviceAlarm,
} from '@/services/device';

const Add: FC<Record<string, any>> = () => {
  const params: { id: string } = useParams();
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [detailsData, setDetailsData] = useState<Record<string, any>>();

  // 告警详情
  const getDetails = async (id: string) => {
    const res = await getDeviceAlarmDetails(id);
    if (res.code === 'SUCCESS') {
      setDetailsData(res.data);
      formRef?.current?.setFieldsValue({
        ...res.data,
        executions: res.data.executions.map((item: any) => ({
          ...item,
          works: [
            {
              linkCode: item.linkCode,
              system: 'Alita工单中心',
              linkText: '@{设备名称}@{触发条件}',
              avoidRepeat: item.avoidRepeat,
              image: '-',
              handler: '按工单模版配置',
            },
          ],
        })),
      });
    }
  };

  // 日志详情
  const getLogDetails = async (id: string) => {
    const res = await getDeviceAlarmLogDetails(id);
    if (res.code === 'SUCCESS') {
      setDetailsData(res.data);
      formRef?.current?.setFieldsValue({
        ...res.data,
        conditions: [
          {
            value: res.data.value,
            unit: res.data.unit,
            deviceIds: [res.data.deviceId],
          },
        ],
        executions: res.data.executions.map((item: any) => ({
          ...item,
          works: [
            {
              linkCode: item.linkCode,
              system: 'Alita工单中心',
              linkText: item.linkText,
              avoidRepeat: item.avoidRepeat,
              image: '-',
              handler: '按工单模版配置',
            },
          ],
        })),
      });
      console.log(formRef?.current?.getFieldsValue());
    }
  };

  useEffect(() => {
    if (params?.id && (query?.pageType === 'edit' || query?.pageType === 'view')) {
      getDetails(params?.id as string);
      if (query?.pageType === 'view') {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
    if (params?.id && query?.pageType === 'logView') {
      getLogDetails(params?.id as string);
      setDisabled(true);
    }
  }, []);

  const onFinish = async (values: Record<string, any>) => {
    try {
      const res = await saveDeviceAlarm({
        ...detailsData,
        ...values,
        executions: values.executions.map((item: any) => ({
          ...item,
          ...item.works,
        })),
      });
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        history.goBack();
      }
      console.log(values);
    } catch {
      // console.log
    }
  };

  const routes = [
    {
      path: '/device-center',
      breadcrumbName: '设备中心',
    },
    {
      path: '/device-center/device-warning',
      breadcrumbName: '设备告警管理',
    },
    {
      path: '/device-center/device-warning/edit',
      breadcrumbName: disabled ? '设备告警详情' : '设备告警编辑',
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
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProForm
        layout="horizontal"
        formRef={formRef}
        colon={false}
        labelCol={{
          flex: '78px',
        }}
        labelAlign="left"
        scrollToFirstError
        disabled={disabled}
        submitter={{
          searchConfig: {
            resetText: '取消', //修改ProForm重置文字
          },
          render: (props, dom) => {
            if (disabled)
              return (
                <FooterToolbar>
                  <Button
                    key="back"
                    disabled={false}
                    onClick={() => {
                      history.goBack();
                    }}
                  >
                    返回
                  </Button>
                </FooterToolbar>
              );
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={() => history.goBack()}
        onFinish={onFinish}
      >
        <Card bordered={false} className={styles.card}>
          <Row>
            <Col xl={6} lg={6} md={12} sm={24}>
              <ProFormText
                label="告警名称"
                name="name"
                fieldProps={{
                  maxLength: 20,
                }}
                placeholder={'请输入告警名称'}
                rules={[
                  { required: true, message: '请输入告警名称' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '请输入中文或者英文字符' },
                ]}
              />
            </Col>
            <Col xl={6} offset={2} lg={6} md={12} sm={24} hidden={query?.pageType !== 'logView'}>
              <ProFormText label="触发时间" name="time" />
            </Col>
            <Col xl={6} offset={2} lg={6} md={12} sm={24} hidden={query?.pageType !== 'logView'}>
              <ProFormSelect
                label="执行结果"
                name="execResult"
                options={[
                  {
                    value: 1,
                    label: '全部成功',
                  },
                  {
                    value: 2,
                    label: '部分成功',
                  },
                  {
                    value: 0,
                    label: '全部失败',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card bordered={false} className={styles.card}>
          <div className={styles.headTitle} hidden={query?.pageType === 'logView'}>
            触发条件
            <span className={styles.subHeaderTitle}>
              （配置触发条件，有多个触发条件时，只要其中一个条件满足，即可触发）
            </span>
          </div>
          <div className={styles.headTitle} hidden={query?.pageType !== 'logView'}>
            触发结果
          </div>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24}>
              <TriggerCard from={formRef} disabled={disabled} />
            </Col>
          </Row>
        </Card>
        <Card bordered={false} className={styles.card}>
          <div className={styles.headTitle} hidden={query?.pageType === 'logView'}>
            告警设置
            <span className={styles.subHeaderTitle}>（执行内容）</span>
          </div>
          <div className={styles.headTitle} hidden={query?.pageType !== 'logView'}>
            执行结果
          </div>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24}>
              <PushCard from={formRef} disabled={disabled} />
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default Add;
