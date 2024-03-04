import ProjectSelect from '@/components/ProjectSelect';
import { passageDetail, passageUpdate } from '@/services/park';
import {
  FooterToolbar,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, Form, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { history, useLocation, useModel } from 'umi';
import styles from './style.less';

const Detail: React.FC<Record<string, any>> = () => {
  const [form] = Form.useForm();
  const location: any = useLocation();
  const id = location.query.id;
  const { initialState } = useModel('@@initialState');
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [isDisabled] = useState<boolean>(location.query.edit === 'false');

  const onFinish = async (values: any) => {
    const params = {
      id,
      ...values,
    };
    const res = await passageUpdate(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功');
      history.push(`/park-center/baseInfo/channel-info`);
    }
  };

  const getPassageDetail = async () => {
    console.log(id);
    const res = await passageDetail(id);
    console.log(res);
    const projectInfo =
      (initialState?.projectList || []).find((item) => item.bid === project.bid) || {};
    const detailTem = {
      ...res.data,
      projectId: (projectInfo as any).bid,
      businessType: (projectInfo as any).bid,
      address: (projectInfo as any).address,
    };
    form.setFieldsValue(detailTem);
  };

  const FooterButtons = (props: Record<string, any>) => {
    if (!isDisabled) {
      return (
        <>
          <Button type="default" onClick={() => history.goBack()}>
            返回
          </Button>
          <Button type="primary" onClick={() => props.form?.submit?.()}>
            提交
          </Button>
        </>
      );
    }
    return (
      <Button
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        返回
      </Button>
    );
  };

  useEffect(() => {
    if (id) {
      getPassageDetail();
    }
  }, []);

  return (
    <ProForm
      form={form}
      labelCol={{
        span: 8,
      }}
      submitter={{
        render: (props) => {
          return (
            <FooterToolbar>
              <FooterButtons {...props} />
            </FooterToolbar>
          );
        },
      }}
      onFinish={onFinish}
    >
      <PageContainer
        header={{
          title: '通道信息详情',
          onBack: () => {
            history.goBack();
          },
        }}
      >
        <Card title="项目信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProjectSelect
                label="项目"
                allowClear={false}
                name="projectId"
                disabled
                // readonly
                placeholder=""
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="projectId"
                label="项目编号"
                disabled
                //  readonly
                placeholder=""
              />
            </Col>
          </Row>
        </Card>
        <Card title="车场信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText name="parkName" label="车场名称" disabled placeholder="" />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="parkCode" label="车场编号" disabled placeholder="" />
            </Col>
          </Row>
        </Card>
        <Card title="通道信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="areaName"
                label="所属区域名称"
                disabled
                dependencies={['parkCode']}
                placeholder="请选择所属区域"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="areaCode" disabled label="所属区域编号" placeholder="" />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24} />
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="name"
                disabled={isDisabled}
                label="通道名称"
                fieldProps={{ maxLength: 20, showCount: true }}
                placeholder="请输入通道名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="id"
                disabled
                // readonly
                label="通道编号"
                placeholder=""
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="type"
                disabled={isDisabled}
                allowClear={false}
                label="通道类型"
                placeholder="请选择通道类型"
                options={[
                  {
                    label: '入口',
                    value: '1',
                  },
                  {
                    label: '出口',
                    value: '2',
                  },
                  {
                    label: '出入口',
                    value: '3',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="备注" className={styles.card} bordered={false} style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col lg={22} md={12} sm={24}>
              <ProFormTextArea
                name="remark"
                fieldProps={{ maxLength: 200, showCount: true }}
                disabled={isDisabled}
                placeholder="请输入备注"
              />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default Detail;
