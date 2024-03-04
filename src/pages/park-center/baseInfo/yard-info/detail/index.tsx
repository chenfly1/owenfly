import { parkDetail, parkModify } from '@/services/park';
import {
  FooterToolbar,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, Form, message, Row, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { history, useLocation } from 'umi';
import styles from './style.less';

const businessTypeOptions = [
  {
    label: '临停缴费',
    value: '1',
  },
  {
    label: '车辆授权',
    value: '2',
  },
  {
    label: '优惠券',
    value: '3',
  },
];
const Detail: React.FC<Record<string, any>> = () => {
  const [form] = Form.useForm();
  const [detail, setDetail] = useState<Record<string, any>>();
  const location: any = useLocation();
  const id = location.query.id;
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  // const handleRest = () => {
  //   form.setFieldsValue(detail ?? {});
  // };

  const onFinish = async (values: any) => {
    const params = {
      id,
      ...values,
      businessType: values.businessType.map((item: any) => item.label).join('/'),
    };
    const res = await parkModify(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功！');
      history.push(`/park-center/baseInfo/yard-info`);
    }
  };

  const getParkDetail = async () => {
    const res = await parkDetail(id);

    const businessType = businessTypeOptions.filter((item) =>
      res?.data?.businessType?.includes(item.label),
    );
    const temDetail = {
      ...res.data,
      businessType,
      projectName: project.name,
      projectCode: project.bid,
      projectType: project.businessType + '',
      projectAddress: project.address,
    };
    setDetail(temDetail);
    form.setFieldsValue(temDetail);
  };

  const FooterButtons = (props: Record<string, any>) => {
    if (!isDisabled) {
      return (
        <>
          <Button
            type="default"
            onClick={() => {
              history.goBack();
            }}
          >
            取消
          </Button>
          {/* <Button type="default" onClick={handleRest}>
            重置
          </Button> */}
          <Button type="primary" onClick={() => props.form?.submit?.()}>
            提交
          </Button>
        </>
      );
    }
    return (
      <>
        <Button
          type="default"
          onClick={() => {
            history.goBack();
          }}
        >
          返回
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setIsDisabled(false);
          }}
        >
          编辑
        </Button>
      </>
    );
  };

  useEffect(() => {
    if (id) {
      getParkDetail();
    }
  }, []);
  const nodes = useMemo(() => {
    if (isDisabled) {
      return (detail?.businessType || []).map((item: any, i: number) => {
        return (
          <Tag key={i} color="geekblue">
            {item.label}
          </Tag>
        );
      });
    } else {
      return [];
    }
  }, [isDisabled, detail]);

  return (
    <ProForm
      form={form}
      // layout="horizontal"
      // labelAlign="right"
      labelCol={{
        span: 10,
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
          // title: '车场信息详情',
          title: null,

          onBack: () => {
            history.goBack();
          },
        }}
      >
        <Card title="项目信息" className={styles.card} bordered={false}>
          {/* <h3 style={{ fontWeight: 'bold' }}>项目信息</h3> */}
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label="项目"
                allowClear={false}
                name="projectName"
                disabled
                // readonly
                placeholder=""
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="projectCode"
                label="项目编号"
                disabled
                //  readonly
                placeholder=""
              />
            </Col>
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="projectType"
                label="项目业态"
                disabled
                // readonly
                placeholder=""
                options={[
                  {
                    value: '1',
                    label: '住宅',
                  },
                  {
                    value: '2',
                    label: '办公',
                  },
                  {
                    value: '3',
                    label: '商写',
                  },
                  {
                    value: '4',
                    label: '医疗',
                  },
                  {
                    value: '5',
                    label: '学校',
                  },
                  {
                    value: '6',
                    label: '产业园',
                  },
                  {
                    value: '7',
                    label: '城市公共服务',
                  },
                ]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="projectAddress"
                label="项目地址"
                disabled
                // readonly
                placeholder=""
              />
            </Col> */}
          </Row>
        </Card>
        <Card title="车场信息" className={styles.card} bordered={false}>
          {/* <h3 style={{ fontWeight: 'bold' }}>车场信息</h3> */}
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="name"
                label="车场名称"
                fieldProps={{
                  showCount: true,
                  maxLength: 20,
                }}
                disabled={isDisabled}
                rules={[
                  { required: true, message: '请输入车场名称' },
                  // {
                  //   pattern: /^([\u4E00-\u9FA5A-Za-z0-9\.\s])+$/,
                  //   message: '允许输入中文、英文、数字、点字符、空格',
                  // },
                ]}
                placeholder="请输入车场名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="code"
                label="车场编号"
                disabled
                // readonly
                rules={[{ required: true, message: '请输入车场编号' }]}
                placeholder=""
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="state"
                disabled={isDisabled}
                allowClear={false}
                label="车场状态"
                rules={[{ required: true, message: '请选择车场状态' }]}
                placeholder="请选择车场状态"
                options={[
                  {
                    label: '未启用',
                    value: 0,
                  },
                  {
                    label: '已上线',
                    value: 1,
                  },
                  {
                    label: '已下线',
                    value: 2,
                  },
                ]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="areaNumber"
                label="区域数量"
                disabled
                // readonly
                rules={[{ required: true, message: '请输入区域数量' }]}
                placeholder="请输入区域数量"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                name="parkNumber"
                min={0}
                max={99999}
                fieldProps={{ precision: 0, controls: false }}
                disabled={isDisabled}
                label="车位总数"
                rules={[{ required: true, message: '请输入车位总数' }]}
                placeholder="请输入车位总数"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24} />
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                name="contactName"
                label="车场联系人姓名"
                disabled={isDisabled}
                placeholder="请输入车场联系人姓名"
                fieldProps={{
                  showCount: true,
                  maxLength: 20,
                }}
                rules={[
                  {
                    pattern: /^([\u4E00-\u9FA5])+$/,
                    message: '允许输入中文',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="contactMobile"
                label="车场联系人手机号"
                disabled={isDisabled}
                placeholder="请输入车场联系人手机号"
                rules={[
                  {
                    pattern: /^1[3456789]\d{9}$/,
                    message: '手机号格式错误',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                hidden={isDisabled}
                name="businessType"
                fieldProps={{
                  labelInValue: true,
                }}
                label="车场业务"
                disabled={isDisabled}
                rules={[{ required: true, message: '请选择车场业务' }]}
                placeholder="请选择车场业务"
                mode="multiple"
                options={businessTypeOptions}
              />
              <ProForm.Item hidden={!isDisabled} label="车场业务">
                {nodes}
              </ProForm.Item>
            </Col>
          </Row>
        </Card>
        <Card title="品牌信息" className={styles.card} bordered={false}>
          {/* <h3 style={{ fontWeight: 'bold' }}>厂家信息</h3> */}
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText name="factoryName" label="车场品牌" disabled placeholder="" />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="parkName"
                disabled
                // readonly
                label="厂家车场名称"
                placeholder=""
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                name="parkCode"
                disabled
                // readonly
                label="厂家车场编号"
                placeholder=""
              />
            </Col>
          </Row>
        </Card>
        <Card title="备注" className={styles.card} bordered={false} style={{ marginBottom: 24 }}>
          {/* <h3 style={{ fontWeight: 'bold' }}>厂家信息</h3> */}
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
