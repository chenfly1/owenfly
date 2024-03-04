import { Card, Col, Row, message, Form, Button } from 'antd';
import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';
import { history, useLocation } from 'umi';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import {
  getIdCardTypeEnums,
  getCultureEnums,
  getPoliticsStatusEnums,
  getMaritalStatusEnums,
  getCustomerRoleEnums,
  createCustomer,
  getBuildingHouseList,
  customerDetail,
  modifyCustomer,
  getParkingQueryByPage,
  getPropertyTypeEnums,
  getGenderEnum,
} from '@/services/mda';
import styles from './style.less';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';

const fieldLabels = {
  name: '客户名称',
  mobile: '手机号',
  gender: '客户性别',
  identityType: '证件类型',
  identityCard: '证件号码',
  culture: '文化程度',
  nativePlace: '籍贯',
  occupation: '职业',
  birthday: '生日',
  politicsStatus: '政治面貌',
  maritalStatus: '婚姻状态',
};

const PersonageForm: FC<Record<string, any>> = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>();
  const [projectBid, setProjectBid] = useState<string>();
  const [houseList, setHouseList] = useState<BuildingHouseListType[]>([]);
  const [houseMap, setHouseMap] = useState<BuildingHouseListType>({} as BuildingHouseListType);
  const [carList, setCarList] = useState<ParkingPlaceListType[]>([]);
  const [carMap, setCarMap] = useState<ParkingPlaceListType>({} as ParkingPlaceListType);
  const [bid, setBid] = useState<string>('');
  const [expandBid, setExpandBid] = useState<string>('');
  // const [propertyType, setPropertyType] = useState<string>();
  const [detail, setDetail] = useState<CusMemberPersonType>();
  const location: any = useLocation();

  const getCustomerDetail = async (val: string) => {
    const res = await customerDetail({
      bid: val,
      projectBid,
    });
    if (res.code === 'SUCCESS') {
      form.setFieldsValue(res.data);
      setDetail(res.data);
      setBid(res.data.bid);
      if (res.data.customerExpand) {
        setExpandBid(res.data.customerExpand.bid);
      }
    }
  };

  const propertyHouse = async () => {
    const res = await getBuildingHouseList({ projectBid });
    const map: any = {};
    if (res.code === 'SUCCESS') {
      setHouseList(res.data.items ?? []);
      const arr =
        res.data.items &&
        res.data.items.map((i: any) => {
          map[i.bid] = { text: i.name };
          return {
            value: i.bid,
            label: i.name,
          };
        });
      setHouseMap(map);
      return arr;
    }
    return [];
  };

  const propertyCar = async () => {
    const res = await getParkingQueryByPage({ projectBid, pageNo: 1, pageSize: 20 });
    const map: any = {};
    if (res.code === 'SUCCESS') {
      setCarList(res.data.items ?? []);
      const arr =
        res.data.items &&
        res.data.items.map((i: any) => {
          map[i.bid] = { text: i.name };
          return {
            value: i.bid,
            label: i.name,
          };
        });
      setCarMap(map);
      return arr;
    }
    return [];
  };

  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
    if (Object.keys(project).length) {
      setProjectBid(project.bid);
    }
    if (location.query.isEdit === 'true' && projectBid) {
      getCustomerDetail(location.query.bid);
    }
    if (location.query.isEdit === 'false' && projectBid) {
      actionRef.current?.addEditRecord(
        { id: Date.now(), projectBid: projectBid ?? '' },
        { newRecordType: 'dataSource' },
      );
    }
    if (projectBid) {
      propertyHouse();
      propertyCar();
    }
  }, [location.query, projectBid]);

  const onFinish = async (values: any) => {
    await editForm.validateFields();
    try {
      let fetch = modifyCustomer;
      if (values.customerExpand && Object.keys(values.customerExpand).length) {
        values.customerExpand.projectBid = projectBid;
      } else {
        values.customerExpand = {};
        values.customerExpand.projectBid = projectBid;
      }
      if (values.propertyRelList && values.propertyRelList.length) {
        values.propertyRelList.map((item: any) => {
          let items: any = {};
          if (item.propertyType === 'HOUSE') {
            items = houseList.find((i: any) => i.bid === item.propertyBid);
          } else {
            items = carList.find((i: any) => i.bid === item.propertyBid);
          }
          if (items) {
            item.propertyName = items?.name;
          }
          // item.propertyType = item.propertyType === 1 ? items?.propertyType : items.propertyRight;
        });
      }
      if (location.query.isEdit === 'false') {
        fetch = createCustomer;
      } else {
        values.bid = bid;
        values.customerExpand.expandBid = expandBid;
        values.customerExpand.name = values.name;
        values.customerExpand.mobile = values.mobile;
        values.customerExpand.identityType = values.identityType;
        values.customerExpand.identityCard = values.identityCard;
      }
      // if (!values.customerExpand) {
      //   values.customerExpand = {};
      //   values.customerExpand.projectBid = projectBid;
      // }
      const res = await fetch(values);
      if (res.code === 'SUCCESS') {
        message.success('提交成功');
        history.goBack();
      }
    } catch {
      // console.log
    }
  };

  const handleRest = () => {
    form.setFieldsValue(detail ?? {});
    editForm.resetFields();
  };

  const columns: ProColumns<housePropertyListType>[] = [
    {
      title: '产权类型',
      key: 'propertyType',
      dataIndex: 'propertyType',
      valueType: 'select',
      params: { pathname: location.pathname },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      request: async () => {
        const res = await getPropertyTypeEnums();
        return res.data.map((i) => ({
          value: i.code,
          label: i.codeName,
        }));
      },
    },
    {
      title: '关联产权',
      dataIndex: 'propertyBid',
      key: 'propertyBid',
      params: { pathname: location.pathname },
      valueType: 'select',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      valueEnum: (row) => {
        return row.propertyType ? (row.propertyType === 'HOUSE' ? houseMap : carMap) : {};
      },
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '客户身份',
      key: 'role',
      dataIndex: 'role',
      valueType: 'select',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      request: async () => {
        const res = await getCustomerRoleEnums();
        return res.data.map((i) => ({
          value: i.code,
          label: i.codeName,
        }));
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            // setPropertyType(record.propertyType);
            action?.startEditable?.(record.id as any);
          }}
        >
          编辑
        </a>,
        // <a
        //   key="delete"
        //   onClick={() => {
        //     // setDataSource(dataSource.filter((item) => item.id !== record.id));
        //   }}
        // >
        //   删除
        // </a>,
      ],
    },
  ];

  const routes = [
    {
      path: '/base-center',
      breadcrumbName: '资源中心',
    },
    {
      path: '/base-center/customer-management',
      breadcrumbName: '客户管理',
    },
    {
      path: '/base-center/customer-management/personage/add',
      breadcrumbName: location.query.isEdit === 'true' ? '编辑个人客户' : '新建个人客户',
    },
  ];

  return (
    <ProForm
      form={form}
      layout="vertical"
      submitter={{
        render: (props) => {
          return (
            <FooterToolbar>
              <Button type="default" onClick={handleRest}>
                重置
              </Button>
              <Button type="primary" onClick={() => props.form?.submit?.()}>
                提交
              </Button>
            </FooterToolbar>
          );
        },
      }}
      onFinish={onFinish}
    >
      <PageContainer
        header={{
          // title: location.query.isEdit === 'true' ? '编辑个人客户' : '新建个人客户',
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
            return history.goBack();
          },
        }}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入客户名称' },
                  {
                    max: 30,
                    message: '字符长度不可超过30',
                  },
                ]}
                placeholder="请输入客户名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.mobile}
                name="mobile"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请选择手机号' },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误',
                  },
                ]}
                placeholder="请选择手机号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.gender}
                name="gender"
                placeholder="请选择"
                rules={[{ required: true, message: '请选择性别' }]}
                request={async () => {
                  const res = await getGenderEnum();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.identityType}
                name="identityType"
                placeholder="请选择"
                request={async () => {
                  const res = await getIdCardTypeEnums();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.identityCard}
                name="identityCard"
                placeholder="请输入证件号码"
                validateTrigger="onBlur"
                rules={[
                  {
                    validator(rule, value, callback) {
                      if (form.getFieldValue('identityType') === 'id_card') {
                        const reg =
                          /^\d{6}((((((19|20)\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(((19|20)\d{2})(0[13578]|1[02])31)|((19|20)\d{2})02(0[1-9]|1\d|2[0-8])|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))0229))\d{3})|((((\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|((\d{2})(0[13578]|1[02])31)|((\d{2})02(0[1-9]|1\d|2[0-8]))|(([13579][26]|[2468][048]|0[048])0229))\d{2}))(\d|X|x)$/;
                        if (value && !reg.test(value)) {
                          callback('请输入正确的证件号码');
                        }
                        callback();
                      }
                      callback();
                    },
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="更多信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.culture}
                name={['customerExpand', 'culture']}
                placeholder="请选择"
                request={async () => {
                  const res = await getCultureEnums();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.nativePlace}
                name={['customerExpand', 'nativePlace']}
                placeholder="请输入籍贯"
                validateTrigger="onBlur"
                rules={[
                  {
                    max: 30,
                    message: '字符长度不可超过30',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.occupation}
                name={['customerExpand', 'occupation']}
                placeholder="请输入职员"
                validateTrigger="onBlur"
                rules={[
                  {
                    max: 30,
                    message: '字符长度不可超过30',
                  },
                ]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormDatePicker
                width="xl"
                label={fieldLabels.birthday}
                name={['customerExpand', 'birthday']}
                placeholder="请选择"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.politicsStatus}
                name={['customerExpand', 'politicsStatus']}
                placeholder="请选择"
                request={async () => {
                  const res = await getPoliticsStatusEnums();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.maritalStatus}
                name={['customerExpand', 'maritalStatus']}
                placeholder="请选择"
                request={async () => {
                  const res = await getMaritalStatusEnums();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="房产信息" className={styles.card} bordered={false}>
          <ProForm.Item
            name="propertyRelList"
            trigger="onValuesChange"
            rules={[
              {
                validator: async () => {
                  try {
                    const result = await editForm.validateFields();
                    if (result) {
                      editForm.validateFields();
                      return Promise.resolve(true);
                    } else {
                      return Promise.reject(false);
                    }
                  } catch {
                    return Promise.reject(false);
                  }
                },
              },
            ]}
          >
            <EditableProTable<housePropertyListType>
              actionRef={actionRef}
              rowKey="id"
              toolBarRender={false}
              columns={columns}
              recordCreatorProps={{
                newRecordType: 'dataSource',
                position: 'bottom',
                record: () => ({
                  id: Date.now(),
                  projectBid: projectBid ?? '',
                }),
              }}
              editable={{
                type: 'multiple',
                form: editForm,
                editableKeys,
                onChange: setEditableRowKeys,
                actionRender: (row, _, dom) => {
                  return [form.getFieldsValue().propertyRelList.length > 1 ? dom.delete : ''];
                },
              }}
            />
          </ProForm.Item>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default PersonageForm;
