import { Card, Col, Row } from 'antd';
import type { FC } from 'react';
import { useRef } from 'react';
import { ProFormInstance, ProFormItem } from '@ant-design/pro-form';
import ProForm, { ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import styles from './style.less';
import { history } from 'umi';
import {
  getEnterpriseCertificateEnums,
  getIdCardTypeEnums,
  getParkingPlaceDetails,
  getResourceEnum,
} from '@/services/mda';
import ProjectSelect from '@/components/ProjectSelect';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import DataMasking from '@/components/DataMasking';

const fieldLabels = {
  code: '车位号',
  projectBid: '所属项目',
  parkingSpaceId: '车场空间id',
  stageBid: '项目分期',
  parking: '所属车场',
  floor: '所属楼层',
  parkingArea: '车场分区',
  placeArea: '车位面积（m²）',
  parkingType: '车位类型',
  parkingNumber: '泊车数量',
  propertyRight: '产权性质',
  useStatus: '使用状态',
  deliverStatus: '交付状态',
  state: '生效状态',
};

const StallEdit: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();

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
      path: '/base-center/parking-space/stall/details',
      breadcrumbName: '车位详情',
    },
  ];

  return (
    <PageContainer
      header={{
        // title: '车位编辑',
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
        onReset={() => history.goBack()}
        request={async () => {
          const res = await getParkingPlaceDetails((query as any).id);
          formRef?.current?.setFieldsValue({
            projectBid: res.data.projectBid,
          });
          return res.data;
        }}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                readonly
                label={fieldLabels.code}
                name="code"
                fieldProps={{
                  maxLength: 200,
                }}
                // rules={[{ required: true, message: '请输入车位号' }]}
                placeholder="请输入车位号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProjectSelect
                readonly
                label={fieldLabels.projectBid}
                name="projectBid"
                disabled
                // rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.stageBid}
                name="stageBid"
                placeholder="请选择项目分期"
                options={stageList}
              />
            </Col> */}
            {/* 
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.parking}
                name="parking"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属车场' }]}
                placeholder="请输入所属车场"
              />
            </Col> */}
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormCascader
                name="parkingSpaceId"
                label={fieldLabels.parkingSpaceId}
                placeholder="请选择车场空间id"
                rules={[{ required: true, message: '请选择车场空间id' }]}
                fieldProps={{
                  options: Option,
                }}
              />
            </Col> */}
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.floor}
                name="floor"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属楼层' }]}
                placeholder="请输入所属楼层"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.parkingArea}
                name="parkingArea"
                fieldProps={{
                  maxLength: 200,
                }}
                placeholder="请输入车场分区"
              />
            </Col> */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                readonly
                label={fieldLabels.placeArea}
                name="placeArea"
                fieldProps={{
                  maxLength: 200,
                }}
                min={0}
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.parkingType}
                name="parkingType"
                placeholder="请选择车位类型"
                request={async () => {
                  const res = await getResourceEnum('place_parking_type');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                readonly
                label={fieldLabels.parkingNumber}
                name="parkingNumber"
                fieldProps={{
                  maxLength: 200,
                }}
                initialValue={1}
                max={5}
                min={1}
                placeholder="请输入数量"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                readonly
                label={fieldLabels.propertyRight}
                name="propertyRight"
                placeholder="请选择产权性质"
                request={async () => {
                  const res = await getResourceEnum('place_property_right');
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
                label={fieldLabels.useStatus}
                name="useStatus"
                placeholder="请选择使用状态"
                request={async () => {
                  const res = await getResourceEnum('place_use_status');
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
                label={fieldLabels.deliverStatus}
                name="deliverStatus"
                placeholder="请选择交付状态"
                request={async () => {
                  const res = await getResourceEnum('place_deliver_status');
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
          <ProFormItem name="placeOwners">
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

export default StallEdit;
