import ProjectSelect from '@/components/ProjectSelect';
import { deviceDetail, deviceUpdate, passageList } from '@/services/park';
import { FooterToolbar, ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, Form, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { history, useLocation } from 'umi';
import { DeviceTypeEnum2 } from '../../data.d';
import styles from './style.less';

const Detail: React.FC<Record<string, any>> = () => {
  const [form] = Form.useForm();
  const location: any = useLocation();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [detail, setDetail] = useState<Record<string, any>>();
  const [isDisabled] = useState<boolean>(location.query.edit === 'false');
  const id = location.query.id;

  const onFinish = async (values: any) => {
    console.log(values);
    const params = {
      ...detail,
      ...values,
    };
    const res = await deviceUpdate(params);
    if (res.code === 'SUCCESS') {
      message.success('提交成功');
      history.push(`/park-center/baseInfo/equipment-info/`);
    }
  };

  const getDeviceDetail = async () => {
    const res = await deviceDetail(id);
    const detailTem = {
      ...res.data,
      passageId: res.data.passageId?.toString() || '',
      projectId: project.bid,
    };
    setDetail(detailTem);
    form.setFieldsValue(detailTem);
  };

  const FooterButtons = (props: Record<string, any>) => {
    if (!isDisabled) {
      return (
        <>
          <Button type="default" onClick={() => history.goBack()}>
            取消
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
      getDeviceDetail();
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
          title: '设备信息详情',
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
              <ProFormText
                name="parkCode"
                label="车场编号"
                disabled
                // readonly
                placeholder=""
              />
            </Col>
          </Row>
        </Card>
        <Card title="设备信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="code"
                disabled
                // readonly
                label="设备编号"
                placeholder="请输入设备编号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="name"
                disabled={isDisabled}
                fieldProps={{ maxLength: 20, showCount: true }}
                label="设备名称"
                placeholder="请输入设备名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="passageId"
                label="所属通道名称"
                disabled={isDisabled}
                placeholder="请选择所属区域"
                dependencies={['parkName']}
                request={async ({ parkName }) => {
                  const params = {
                    projectId: project.bid,
                    parkName: parkName,
                    pageNo: 1,
                    pageSize: 1000,
                  };
                  const res = await passageList(params);
                  return res.data.map((item: any) => ({
                    label: item.name,
                    value: (item?.id || '').toString(),
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="type"
                disabled={isDisabled}
                label="设备类型"
                placeholder=""
                request={async () =>
                  Object.entries(DeviceTypeEnum2).map((item) => {
                    return {
                      label: item[1],
                      value: item[0],
                    };
                  })
                }
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="brand" disabled label="设备品牌" placeholder="" />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="model" disabled label="设备型号" placeholder="" />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default Detail;
