import { Card, Col, Row, message } from 'antd';

import type { FC } from 'react';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { fakeSubmitForm } from './service';
import styles from './style.less';

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
      submitter={{
        render: (props, dom) => {
          return <FooterToolbar>{dom}</FooterToolbar>;
        },
      }}
      initialValues={{ members: tableData }}
      onFinish={onFinish}
    >
      <PageContainer header={{ title: null }}>
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="房号"
                name="name"
                rules={[{ required: true, message: '请输入房号' }]}
                placeholder="请输入房号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属项目"
                name="name"
                rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="项目分期"
                name="logo"
                rules={[{ required: true, message: '请选择项目分期' }]}
                placeholder="请选择项目分期"
                options={[
                  {
                    value: '1',
                    label: '同事甲',
                  },
                  {
                    value: '2',
                    label: '同事乙',
                  },
                  {
                    value: '3',
                    label: '同事丙',
                  },
                ]}
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="所属楼栋"
                name="name"
                rules={[{ required: true, message: '请输入所属楼栋' }]}
                placeholder="请输入所属楼栋"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属单元"
                name="name"
                rules={[{ required: true, message: '请输入所属单元' }]}
                placeholder="请输入所属单元"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属楼层"
                name="name"
                placeholder="请输入所属楼层"
                rules={[{ required: true, message: '请输入所属楼层' }]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="建筑面积"
                name="name"
                rules={[{ required: true, message: '请输入建筑面积' }]}
                placeholder="请输入建筑面积"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="套内面积"
                name="name"
                rules={[{ required: true, message: '请输入套内面积' }]}
                placeholder="请输入套内面积"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="计费面积"
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label="房产类型"
                name="logo"
                rules={[{ required: true, message: '请选择房产类型' }]}
                placeholder="请选择"
                options={[
                  {
                    value: '1',
                    label: '销售楼层',
                  },
                  {
                    value: '2',
                    label: '自持房产',
                  },
                  {
                    value: '3',
                    label: '物业用房',
                  },
                  {
                    value: '4',
                    label: '公共区域',
                  },
                  {
                    value: '5',
                    label: '未知',
                  },
                  {
                    value: '6',
                    label: '其他',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="使用性质"
                name="logo"
                rules={[{ required: true, message: '请选择使用性质' }]}
                placeholder="请选择使用性质"
                options={[
                  {
                    value: '1',
                    label: '住宅',
                  },
                  {
                    value: '2',
                    label: '商业',
                  },
                  {
                    value: '3',
                    label: '公共',
                  },
                  {
                    value: '4',
                    label: '其他',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="产权性质"
                name="logo"
                rules={[{ required: true, message: '请选择产权性质' }]}
                placeholder="请选择产权性质"
                options={[
                  {
                    value: '1',
                    label: '自有产权',
                  },
                  {
                    value: '2',
                    label: '业主产权',
                  },
                  {
                    value: '3',
                    label: '公有产权',
                  },
                  {
                    value: '4',
                    label: '产权不明',
                  },
                  {
                    value: '5',
                    label: '其他产权',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="状态信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label="入住状态"
                name="logo"
                rules={[{ required: true, message: '请选择入住状态' }]}
                placeholder="请选择"
                options={[
                  {
                    value: '1',
                    label: '常住',
                  },
                  {
                    value: '2',
                    label: '未入住',
                  },
                  {
                    value: '3',
                    label: '非常住',
                  },
                  {
                    value: '4',
                    label: '一般常住',
                  },
                  {
                    value: '5',
                    label: '其他',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="出租状态"
                name="logo"
                rules={[{ required: true, message: '请选择出租状态' }]}
                placeholder="请选择出租状态"
                options={[
                  {
                    value: '1',
                    label: '自用',
                  },
                  {
                    value: '2',
                    label: '已出租',
                  },
                  {
                    value: '3',
                    label: '未出租',
                  },
                  {
                    value: '4',
                    label: '其他',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label="生效状态"
                name="logo"
                rules={[{ required: true, message: '请选择生效状态' }]}
                placeholder="请选择生效状态"
                options={[
                  {
                    value: '1',
                    label: '生效',
                  },
                  {
                    value: '2',
                    label: '失效',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default AdvancedForm;
