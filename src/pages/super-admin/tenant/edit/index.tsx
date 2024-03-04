import { ExclamationCircleFilled } from '@ant-design/icons';
import { Card, Col, Row, message, Button, Form, Modal } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import ProForm, { ProFormSelect, ProFormText, ProFormSwitch } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { updateTenant, getTenantDetails } from '@/services/wps';
import styles from './style.less';
import { history } from 'umi';
import ModelForm from './modelForm';
import AreaCascader from '@/components/AreaCascader';
import { Method } from '@/utils';

const { confirm } = Modal;

const fieldLabels = {
  tenantAccount: '租户账号',
  name: '公司名称',
  area: '公司地区',
  address: '公司详细地址',
  contacts: '联系人',
  salesman: '业务人员',
  state: '租户状态',
  email: '电子邮箱',
};

const TenantEdit: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const [detailsData, setDetailData] = useState<TenantListType>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);

  const onFinish = async (values: Record<string, any>) => {
    try {
      const params = {
        ...detailsData,
        ...values,
        state: values.state ? 'NORMAL' : 'BAND',
        info: {
          ...detailsData?.info,
          ...values?.info,
          province: values.area[0],
          city: values.area[1],
          district: values.area.length > 2 ? values.area[2] : '',
        },
      };
      confirm({
        icon: <ExclamationCircleFilled />,
        title: '编辑租户',
        content: <p>提交后，该租户信息将更新，请确定是否提交</p>,
        okText: '确定提交',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          const res = await updateTenant((query as any).id, params);
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
    <PageContainer
      header={{
        onBack: () => {
          return history.goBack();
        },
      }}
    >
      <ProForm
        layout="vertical"
        submitter={{
          searchConfig: {
            resetText: '取消', //修改ProForm取消文字
            submitText: '提交', //修改ProForm提交文字
          },
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        request={async () => {
          const res = await getTenantDetails((query as any).id);
          if (res.data.info) {
            setDetailData(res.data);
            return {
              ...res.data,
              state: res.data.state === 'NORMAL' ? true : false,
              area: res.data.info.district
                ? [res.data.info.province, res.data.info.city, res.data.info.district]
                : [res.data.info.province, res.data.info.city],
            };
          } else {
            return res.data;
          }
        }}
        onReset={() => history.goBack()}
        onFinish={onFinish}
      >
        <Card title="租户信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText disabled label={fieldLabels.tenantAccount} name="tenantAccount" />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
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
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.salesman}
                name={['info', 'salesman']}
                rules={[
                  {
                    required: true,
                    message: '请选择',
                  },
                ]}
                placeholder="请选择"
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
            <Col lg={6} md={12} sm={24}>
              <Form.Item
                name="area"
                label={fieldLabels.area}
                rules={[{ type: 'array', required: true, message: '请选择' }]}
              >
                <AreaCascader />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
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
                name="email"
                label={fieldLabels.email}
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
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <div />
            </Col>
            <Col lg={6} md={12} sm={24}>
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
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSwitch name="state" label={fieldLabels.state} />
            </Col>
          </Row>
        </Card>
        <Card title="租户密码" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <div className={styles.password}>
                <span>密保手机</span>
                <span>
                  已绑定：{Method.onlySeeSome((detailsData as any)?.info.securePhone, 'phone')}
                </span>
                <Button onClick={() => setModalVisit(true)} type="link">
                  修改
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
        <ModelForm
          modalVisit={modalVisit}
          detailsData={detailsData as TenantListType}
          setDetailData={setDetailData}
          onOpenChange={setModalVisit}
        />
      </ProForm>
    </PageContainer>
  );
};

export default TenantEdit;
