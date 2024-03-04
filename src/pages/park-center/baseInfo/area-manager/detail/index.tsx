import { parkTitles } from '@/pages/park-center/utils/constant';
import { parkAreaDetail, updateParkArea } from '@/services/park';
import {
  FooterToolbar,
  ProForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, Form, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';

const Detail: React.FC<Record<string, any>> = () => {
  const [form] = Form.useForm<ParkAreaType>();
  const { query } = history.location;
  const { id, isEdit } = query as any;
  const [disabled] = useState<boolean>(isEdit == 'false');

  const onSave = async (values: any) => {
    updateParkArea(id, { ...values }).then((res) => {
      if (res.code === 'SUCCESS') {
        message.success('更新成功！');
        history.push('/park-center/baseInfo/area-manager');
      }
    });
  };

  const getDetail = async () => {
    if (!id.length) {
      return;
    }

    parkAreaDetail(id).then((res) => {
      if (res.code == 'SUCCESS') {
        const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
        const detailTem = {
          ...res.data,
          projectName: project.name,
          projectCode: project.bid,
        };
        // setDetail(detailTem);
        form.setFieldsValue(detailTem);
      }
    });
  };
  const FooterButtons = (props: Record<string, any>) => {
    if (!disabled) {
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
    getDetail();
  }, []);

  return (
    <ProForm
      form={form}
      submitter={{
        render: (props) => {
          return (
            <FooterToolbar>
              <FooterButtons {...props} />
            </FooterToolbar>
          );
        },
      }}
      onFinish={onSave}
    >
      <PageContainer
        header={{
          title: `区域信息${isEdit === 'true' ? '编辑' : '查看'}`,
          onBack: () => {
            history.goBack();
          },
        }}
      >
        <Card title="项目信息" bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="projectName"
                label={parkTitles.projectName}
                placeholder="-"
                disabled
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="projectCode"
                label={parkTitles.projectNum}
                placeholder="-"
                disabled
              />
            </Col>
          </Row>
        </Card>

        <Card title="车场信息" bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="parkName"
                label={parkTitles.alitaYardName}
                placeholder="-"
                disabled
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="parkCode"
                label={parkTitles.alitaYardNo}
                placeholder="-"
                disabled
              />
            </Col>
          </Row>
        </Card>

        <Card title="区域信息" bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="name"
                disabled={disabled}
                label={parkTitles.areaName}
                fieldProps={{ maxLength: 20, showCount: true }}
                rules={[
                  { required: true, message: '请输入区域名称' },
                  // {
                  //   pattern: /^([\u4E00-\u9FA5A-Za-z0-9\.\s])+$/,
                  //   message: '允许输入中文、英文、数字、点字符、空格',
                  // },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="code" label={parkTitles.areaNum} placeholder="-" disabled />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                disabled={disabled}
                name="parkNumber"
                label={parkTitles.total}
                fieldProps={{
                  controls: false,
                }}
                max={99999}
                min={0}
                rules={[{ required: true, message: '请输入车位数量' }]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormRadio.Group
                name="limitState"
                disabled={disabled}
                label={parkTitles.fullAccess}
                options={[
                  { label: '是', value: 1 },
                  { label: '否', value: 0 },
                ]}
                rules={[{ required: true, message: '请选择满位是否允许进入' }]}
              />
            </Col>
          </Row>
        </Card>

        <Card title="备注" bordered={false} style={{ marginBottom: 24 }}>
          <Col span={22}>
            <ProFormTextArea
              name="remark"
              disabled={disabled}
              placeholder="这个区域的备注描述"
              fieldProps={{ maxLength: 200, showCount: true }}
            />
          </Col>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default Detail;
