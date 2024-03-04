import { Card, Col, Row, message, Form, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import type { FC } from 'react';
import { useRef } from 'react';
import ProForm, { ProFormSelect, ProFormText, ProFormCaptcha } from '@ant-design/pro-form';
import type { ProFormInstance, CaptFieldRef } from '@ant-design/pro-components';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { createTenant } from '@/services/wps';
import { getCaptcha } from '@/services/app';
import { history } from 'umi';
import AreaCascader from '@/components/AreaCascader';
import styles from './style.less';

const { confirm } = Modal;

const fieldLabels = {
  name: '公司名称',
  area: '公司地区',
  address: '公司详细地址',
  contacts: '联系人',
  loginPrefix: '个性域名',
  salesman: '业务人员',
  tenantAccount: '租户账号',
  email: '邮箱',
  securePhone: '密保手机',
  phoneCode: '确定码',
};

const TenantAdd: FC<Record<string, any>> = () => {
  const formRef = useRef<ProFormInstance>();
  const captchaRef = useRef<CaptFieldRef | null | undefined>();

  const onFinish = async (values: Record<string, any>) => {
    try {
      console.log(values);
      const params = {
        ...values,
        info: {
          ...values.info,
          province: values.area[0],
          city: values.area[1],
          district: values.area.length > 2 ? values.area[2] : '',
        },
      };
      confirm({
        icon: <ExclamationCircleFilled />,
        title: '创建并发送通知短信',
        centered: true,
        content: (
          <p>创建租户账号不可修改，租户账号/密码相关信息将发送到密保手机，请确定是否继续创建</p>
        ),
        okText: '继续创建',
        cancelText: '取消',
        onOk: async () => {
          const res = await createTenant(params);
          if (res.code === 'SUCCESS') {
            message.success('提交成功');
            history.goBack();
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } catch {
      // console.log
    }
  };

  return (
    <ProForm
      layout="vertical"
      submitter={{
        searchConfig: {
          submitText: '创建并发送通知短信', //修改ProForm提交文字
        },
        render: (props, dom) => {
          return <FooterToolbar>{dom}</FooterToolbar>;
        },
      }}
      formRef={formRef}
      onFinish={onFinish}
    >
      <PageContainer
        header={{
          onBack: () => {
            history.goBack();
          },
        }}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                fieldProps={{
                  maxLength: 50,
                }}
                rules={[{ required: true, message: '请输入公司名称' }]}
                placeholder="请输入公司名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                name="area"
                label={fieldLabels.area}
                rules={[{ type: 'array', required: true, message: '请选择' }]}
              >
                <AreaCascader />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormText
                label={fieldLabels.address}
                name="address"
                fieldProps={{
                  maxLength: 50,
                }}
                rules={[{ required: true, message: '请输入公司详细地址' }]}
                placeholder="请输入公司详细地址，准确到楼栋"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name={['info', 'contacts']}
                label={fieldLabels.contacts}
                fieldProps={{
                  maxLength: 20,
                }}
                placeholder="联系人姓名"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入联系人姓名' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z\·]+$/, message: '请输入中文或者英文字符' },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="loginPrefix"
                label={fieldLabels.loginPrefix}
                fieldProps={{
                  maxLength: 30,
                }}
                tooltip="设置个性域名后，该租户登录的智慧社区系统的域名将以个性域名作为前缀"
                placeholder="请输入租户个性域名前缀"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入租户个性域名前缀' },
                  { pattern: /^[a-zA-Z]+$/, message: '请输入英文字符' },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.salesman}
                name={['info', 'salesman']}
                rules={[
                  {
                    required: true,
                  },
                ]}
                options={[
                  {
                    value: '1',
                    label: '邱文洁',
                  },
                  { value: '2', label: '孙珺（卡卡）' },
                  { value: '3', label: '陈雅婧' },
                  { value: '4', label: '黄从志' },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="创建账号&密保" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.tenantAccount}
                name="tenantAccount"
                fieldProps={{
                  maxLength: 20,
                }}
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入租户账号' },
                  {
                    pattern: /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/,
                    message: '请输入大小写字母或者数字，至少有一字母',
                  },
                ]}
                placeholder="请输入租户账号"
              />
            </Col>

            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.securePhone}
                name={['info', 'securePhone']}
                tooltip="密保手机用于接收该租户密码相关信息"
                fieldProps={{
                  maxLength: 11,
                }}
                validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误',
                  },
                ]}
                placeholder="请输入手机号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormCaptcha
                label={fieldLabels.phoneCode}
                captchaProps={{
                  type: 'primary',
                  ghost: true,
                }}
                fieldProps={{
                  maxLength: 10,
                }}
                placeholder={'请输入确定码'}
                name={['info', 'phoneCode']}
                rules={[
                  {
                    required: true,
                    message: '请输入确定码',
                  },
                ]}
                fieldRef={captchaRef}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count}S ${'获取确定码'}`;
                  }
                  return '获取确定码';
                }}
                onGetCaptcha={async () => {
                  const securePhone = formRef?.current?.getFieldValue(['info', 'securePhone']);
                  if (!securePhone) {
                    message.warning('请输入密保手机');
                    return new Promise((resolve, reject) => {
                      reject();
                    });
                  }
                  if (!/^1\d{10}$/.test(securePhone)) {
                    message.warning('手机号格式错误');
                    return new Promise((resolve, reject) => {
                      reject();
                    });
                  }
                  captchaRef.current?.startTiming();
                  getCaptcha({
                    phone: securePhone,
                  }).then((res) => {
                    if (res.code === 'SUCCESS') {
                      message.success('获取确定码成功');
                    }
                  });
                }}
              />
            </Col>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.email}
                name="email"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: '请输入正确的邮箱地址',
                  },
                ]}
                placeholder="请输入邮箱地址"
              />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default TenantAdd;
