import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { Button, message } from 'antd';
import {
  addBrandConfig,
  checkAddress,
  eventTypeConfigBatchSava,
  getProjectBrandConfigDetail,
  listEventType,
  listEventTypeConfig,
} from '@/services/monitor';
import { useEffect, useRef, useState } from 'react';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const [detail, setDetail] = useState<ProjectBrandConfigDetailType>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const queryBrandConfigDetail = async () => {
    const res1 = await getProjectBrandConfigDetail({ projectId: project.bid });
    const data = res1.data || {};
    formRef.current?.setFieldsValue({
      ...data,
      deployType: data.deployType === 1 ? 'Sass部署' : '本地私有化部署',
      controlEnable: data.controlEnable === 0 ? false : true,
      sub_address: data?.subBrandConfig?.address,
      sub_appKey: data?.subBrandConfig?.appKey,
      sub_secret: data?.subBrandConfig?.secret,
    });
    setDetail(data);
  };
  const queryEventConfigDetail = async () => {
    const res2 = await listEventTypeConfig({ projectId: project.bid });
    const data = res2.data;
    formRef.current?.setFieldsValue({
      eventTypeCodes: (data || []).map((item: any) => ({
        ...item,
        label: item.eventName,
        value: item.eventTypeCode,
      })),
    });
  };

  const onFinish = async (formData: any) => {
    let params: any = {
      // 新增
      ...formData,
      projectId: project.bid,
      controlEnable: formData.controlEnable ? 1 : 0,
      deployType: formData.deployType === 'Sass部署' ? '1' : '2',
      subBrandConfig: {},
    };
    if (formData.brandCode === 'hik_cloud') {
      params = {
        ...params,
        subBrandConfig: {
          address: formData.sub_address,
          appKey: formData.sub_appKey,
          secret: formData.sub_secret,
        },
      };
    }
    const res1 = await addBrandConfig(params);
    if (formData.controlEnable) {
      const res2 = await eventTypeConfigBatchSava({ saveCmdList: formData.eventTypeCodes });
      if (res2.code === 'SUCCESS' && res1.code === 'SUCCESS') {
        message.success('保存成功');
        queryBrandConfigDetail();
        queryEventConfigDetail();
      }
    } else {
      if (res1.code === 'SUCCESS') {
        message.success('保存成功');
        queryBrandConfigDetail();
        queryEventConfigDetail();
      }
    }
  };
  const queryCheckAddress = async () => {
    const formData = formRef.current?.getFieldFormatValueObject!();
    const res = await checkAddress({
      id: detail?.brandConfigId,
      ...formData,
      deployType: formData.deployType === 'Sass部署' ? '1' : '2',
    });
    if (res.data) {
      message.success('连接成功');
    } else {
      message.error('连接失败');
    }
  };
  useEffect(() => {
    queryBrandConfigDetail();
    queryEventConfigDetail();
  }, []);
  return (
    <PageContainer
      header={{
        title: null,
      }}
      className={styles.pageWarp}
    >
      <ProForm
        labelCol={{ flex: '150px' }}
        colon={false}
        layout="horizontal"
        onFinish={onFinish}
        formRef={formRef}
      >
        <h3 className={styles.cusTtitle}>
          <div className={styles.backDiv} />
          基础连接信息
        </h3>
        <ProFormSelect
          label="连接平台"
          colon={false}
          name="brandCode"
          width={300}
          readonly={false}
          placeholder="请选择连接平台"
          options={[
            {
              label: '海康ISC',
              value: 'hik_isc',
            },
            {
              label: '云眸',
              value: 'hik_cloud',
            },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormText name="appKey" label="连接平台KEY" width={300} rules={[{ required: true }]} />
        <ProFormText
          name="secret"
          label="连接平台Secret"
          width={300}
          rules={[{ required: true }]}
        />
        <ProFormDependency name={['brandCode']}>
          {({ brandCode }) => {
            if (brandCode === 'hik_cloud') {
              return (
                <>
                  <ProFormText
                    labelCol={{ flex: '150px' }}
                    label="本地平台IP"
                    width={300}
                    required={true}
                    name="sub_address"
                  />
                  <ProFormText
                    labelCol={{ flex: '150px' }}
                    label="本地平台KEY"
                    width={300}
                    required={true}
                    name="sub_appKey"
                  />
                  <ProFormText
                    labelCol={{ flex: '150px' }}
                    label="本地平台Secret"
                    width={300}
                    required={true}
                    name="sub_secret"
                  />
                </>
              );
            } else {
              return null;
            }
          }}
        </ProFormDependency>

        <h3 className={styles.cusTtitle}>
          <div className={styles.backDiv} />
          部署组网及配置
        </h3>
        <ProFormRadio.Group
          label="业务平台部署"
          colon={false}
          name="deployType"
          width={300}
          readonly={false}
          options={['Sass部署', '本地私有化部署']}
          rules={[{ required: true }]}
        />
        <ProFormDependency name={['deployType']}>
          {({ deployType }) => {
            if (deployType === 'Sass部署') {
              return (
                <ProFormText
                  name="address"
                  label="业务平台代理域名"
                  width={300}
                  rules={[{ required: true }]}
                />
              );
            } else {
              return (
                <ProFormText
                  name="address"
                  label="对接平台IP"
                  placeholder={'请输入对接平台IP'}
                  width={300}
                  rules={[{ required: true }]}
                  addonAfter={<Button onClick={queryCheckAddress}>连接测试</Button>}
                />
              );
            }
          }}
        </ProFormDependency>

        <h3 className={styles.cusTtitle}>
          <div className={styles.backDiv} />
          业务功能配置
        </h3>
        <ProFormSwitch
          label="布控功能"
          colon={false}
          name="controlEnable"
          width={300}
          readonly={false}
        />
        <ProFormDependency name={['controlEnable']}>
          {({ controlEnable }) => {
            if (controlEnable) {
              return (
                <ProFormSelect
                  label="告警事件配置"
                  width={300}
                  mode="multiple"
                  name="eventTypeCodes"
                  dependencies={['brandCode']}
                  fieldProps={{
                    labelInValue: true,
                  }}
                  request={async ({ brandCode }) => {
                    if (brandCode) {
                      const res = await listEventType({ brandCode });
                      return (res.data || []).map((item: any) => {
                        return { ...item, label: item.eventName, value: item.eventTypeCode };
                      });
                    } else {
                      return [];
                    }
                  }}
                />
              );
            }
          }}
        </ProFormDependency>
      </ProForm>
    </PageContainer>
  );
};
