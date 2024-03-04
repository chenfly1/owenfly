import { Card, Col, Row, message, Button } from 'antd';

import type { FC } from 'react';
import ProForm, { ProFormSelect, ProFormText, ProFormCascader } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { fakeSubmitForm } from './service';
import styles from './style.less';

const fieldLabels = {
  name: '应用名称',
  url: '应用地址',
  logo: '应用图标',
  urlAddress: '同步地址',
  owner2: '同步周期',
  dateRange2: '同步时间',
  approver2: '自动同步',
};

const tableData = [
  {
    key: '1',
    workId: '00001',
    name: 'John Brown',
    department: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    workId: '00002',
    name: 'Jim Green',
    department: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    workId: '00003',
    name: 'Joe Black',
    department: 'Sidney No. 1 Lake Park',
  },
];

const AdvancedForm: FC<Record<string, any>> = () => {
  const onFinish = async (values: Record<string, any>) => {
    try {
      await fakeSubmitForm(values);
      message.success('提交成功');
    } catch {
      // console.log
    }
  };

  return (
    <ProForm
      layout="vertical"
      hideRequiredMark
      submitter={{
        render: (props, dom) => {
          return <FooterToolbar>{dom}</FooterToolbar>;
        },
      }}
      initialValues={{ members: tableData }}
      onFinish={onFinish}
    >
      <PageContainer header={{ title: null }}>
        <Card title="租户信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                rules={[{ required: true, message: '请输入租户账号' }]}
                placeholder="请输入租户账号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.logo}
                name="name"
                rules={[{ required: true, message: '请输入公司名称' }]}
                placeholder="请输入公司名称"
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label="业务人员"
                name="remark"
                rules={[
                  {
                    required: true,
                  },
                ]}
                initialValue="1"
                options={[
                  {
                    value: '1',
                    label: '策略一',
                  },
                  { value: '2', label: '策略二' },
                ]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormCascader
                request={async () => [
                  {
                    value: 'zhejiang',
                    label: '浙江',
                    children: [
                      {
                        value: 'hangzhou',
                        label: '杭州',
                        children: [
                          {
                            value: 'xihu',
                            label: '西湖',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    value: 'jiangsu',
                    label: 'Jiangsu',
                    children: [
                      {
                        value: 'nanjing',
                        label: 'Nanjing',
                        children: [
                          {
                            value: 'zhonghuamen',
                            label: 'Zhong Hua Men',
                          },
                        ],
                      },
                    ],
                  },
                ]}
                name="areaList"
                label="公司地区"
                placeholder="请选择公司地区"
                rules={[{ required: true }]}
                initialValue={['zhejiang', 'hangzhou', 'xihu']}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="name"
                label="联系人"
                placeholder="联系人姓名"
                rules={[{ required: true }]}
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <div />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="公司地址"
                name="name"
                rules={[{ required: true, message: '请输入公司地址' }]}
                placeholder="请输入公司地址"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="联系方式"
                name="name"
                rules={[{ required: true, message: '请输入联系方式' }]}
                placeholder="请输入联系方式"
              />
            </Col>
          </Row>
        </Card>
        <Card title="租户密码" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText.Password
                name="password"
                label="当前密码"
                required
                addonAfter={
                  <Button type="primary" ghost>
                    随机密码
                  </Button>
                }
                placeholder="这是输入密码"
                rules={[{ required: true, message: '这是输入密码' }]}
              />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default AdvancedForm;
