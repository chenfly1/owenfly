import { Card, Col, Row, message } from 'antd';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import ProForm, {
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormCascader,
  ProFormItem,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import {
  getBuildingHouseDetail,
  getEnterpriseCertificateEnums,
  getIdCardTypeEnums,
  getResourceEnum,
} from '@/services/mda';
import { history } from 'umi';
import styles from './style.less';
import ProjectSelect from '@/components/ProjectSelect';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import DataMasking from '@/components/DataMasking';

const fieldLabels = {
  code: '房号',
  projectBid: '所属项目',
  houseSpaceId: '房产全称',
  stageBid: '项目分期',
  building: '所属楼栋',
  unit: '所属单元',
  floor: '所属楼层',
  floorArea: '建筑面积（m²）',
  insideArea: '套内面积（m²）',
  billingArea: '计费面积（m²）',
  propertyType: '房产类型',
  useNature: '使用性质',
  propertyRight: '产权性质',
  occupyStatus: '入住状态',
  rentStatus: '出租状态',
  state: '生效状态',
};

const columns: ProColumns<EnterpriseType>[] = [
  {
    title: '客户名称',
    dataIndex: 'name',

    ellipsis: true,
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    order: 4,

    ellipsis: true,
    render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
  },
  {
    title: '证件类型',
    dataIndex: 'ownerIdentityType',

    hideInSearch: true,
    ellipsis: true,
    order: 1,
    valueType: 'select',
    request: async () => {
      const resD = await getEnterpriseCertificateEnums();
      const res = await getIdCardTypeEnums();
      return [...res.data, ...resD.data].map((i) => ({
        value: i.code,
        label: i.codeName,
      }));
    },
  },
  {
    title: '证件号码',
    dataIndex: 'ownerIdentityCard',

    ellipsis: true,
    render: (_, record) => {
      if (record.identityType === 'id_card') {
        return [<DataMasking key="onlysee" text={record.ownerIdentityCard} type="idCard" />];
      }
      return <span>{record.ownerIdentityCard ? record.ownerIdentityCard : '-'}</span>;
    },
  },
  {
    title: '身份',
    key: 'role',
    dataIndex: 'role',
  },
  {
    title: '成员管理权限',
    key: 'authType',
    dataIndex: 'authType',
  },
];
const HouseEdit: FC<Record<string, any>> = () => {
  const formRef = useRef<ProFormInstance>();

  const { query } = history.location;

  const routes = [
    {
      path: '/base-center',
      breadcrumbName: '资源中心',
    },
    {
      path: '/base-center/parking-space',
      breadcrumbName: '产权管理',
    },
    {
      path: '/base-center/parking-space/house/details',
      breadcrumbName: '房产详情',
    },
  ];

  return (
    <PageContainer
      header={{
        // title: '房产编辑',
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
        submitter={{
          searchConfig: {
            resetText: '返回', //修改ProForm重置文字
          },
          submitButtonProps: {
            style: {
              // 隐藏提交按钮
              display: 'none',
            },
          },
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        formRef={formRef}
        onReset={() => {
          history.goBack();
        }}
        request={
          setTimeout(async () => {
            const res = await getBuildingHouseDetail((query as any).id);
            console.log('res1', res);
            formRef?.current?.setFieldsValue({
              ...res.data,
            });

            return res.data;
          }, 0) as any
        }
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProjectSelect
                readonly
                label={fieldLabels.projectBid}
                name="projectBid"
                disabled
                // rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            {/*  houseSpaceId: "房屋空间id", */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.houseSpaceId}
                name="name"
                readonly
                placeholder="请选择房产空间位置"
              />
            </Col>
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.stageBid}
                name="stageBid"
                placeholder="请选择项目分期"
                options={stageList}
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.building}
                name="building"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属楼栋' }]}
                placeholder="请输入所属楼栋"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.unit}
                name="unit"
                fieldProps={{
                  maxLength: 200,
                }}
                placeholder="请输入所属单元"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.floor}
                fieldProps={{
                  maxLength: 200,
                }}
                name="floor"
                placeholder="请输入所属楼层"
                rules={[{ required: true, message: '请输入所属楼层' }]}
              />
            </Col> */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                readonly
                label={fieldLabels.floorArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="floorArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormDigit
                readonly
                label={fieldLabels.insideArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="insideArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                readonly
                label={fieldLabels.billingArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="billingArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.propertyType}
                name="propertyType"
                placeholder="请选择"
                request={async () => {
                  const res = await getResourceEnum('house_property_type');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.useNature}
                name="useNature"
                placeholder="请选择使用性质"
                request={async () => {
                  const res = await getResourceEnum('house_use_nature');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.propertyRight}
                name="propertyRight"
                placeholder="请选择产权性质"
                request={async () => {
                  const res = await getResourceEnum('house_property_right');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="状态信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.occupyStatus}
                name="occupyStatus"
                placeholder="请选择"
                request={async () => {
                  const res = await getResourceEnum('house_occupy_status');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.rentStatus}
                name="rentStatus"
                placeholder="请选择出租状态"
                request={async () => {
                  const res = await getResourceEnum('house_rent_status');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.state}
                name="state"
                placeholder="请选择生效状态"
                request={async () => {
                  const res = await getResourceEnum('state');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="客户信息" className={styles.card} bordered={false}>
          <ProFormItem name="houseOwners">
            <EditableProTable<EnterpriseType>
              rowKey="id"
              columns={columns}
              // 关闭默认的新建按钮
              recordCreatorProps={false}
            />
          </ProFormItem>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default HouseEdit;
