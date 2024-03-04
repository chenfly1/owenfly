import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Card, Col, Row, message, Form, Button } from 'antd';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  getCustomerRoleEnums,
  getEnterpriseCertificateEnums,
  getIndustryEnums,
  getCompanyScaleEnums,
  enterpriseDetail,
  modifyEnterprise,
  createEnterprise,
  getBuildingHouseList,
  getParkingQueryByPage,
  getPropertyTypeEnums,
} from '@/services/mda';
import { history, useLocation } from 'umi';
import { storageSy } from '@/utils/Setting';
import styles from './style.less';

const fieldLabels = {
  name: '客户名称',
  managerName: '企业管理员',
  managerPhone: '管理员手机号',
  identityType: '证件类型',
  identityCard: '证件号码',
  industry: '所属行业',
  legalPerson: '企业法人',
  legalIdCard: '法人身份证号码',
  companyScale: '公司规模',
  establishDate: '成立日期',
  registeredCapital: '注册资金',
};

const EnterPriseForm: FC<Record<string, any>> = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>();
  const [projectBid, setProjectBid] = useState<string>();
  const location: any = useLocation();
  // 业务主键
  const [bid, setBid] = useState<string>('');
  // 企业基础记录BID
  const [, setExpandBid] = useState<string>('');
  // 企业客户拓展信息
  const [enterpriseExpandBid, setenterpriseExpandBid] = useState<string>('');
  const [houseList, setHouseList] = useState<BuildingHouseListType[]>([]);
  const [houseMap, setHouseMap] = useState<BuildingHouseListType>({} as BuildingHouseListType);
  const [carList, setCarList] = useState<ParkingPlaceListType[]>([]);
  const [carMap, setCarMap] = useState<ParkingPlaceListType>({} as ParkingPlaceListType);
  // const [propertyType, setPropertyType] = useState<string>();
  const [detail, setDetail] = useState<EnterpriseType>();

  const getEnterpriseDetail = async (val: string) => {
    const res = await enterpriseDetail({
      bid: val,
    });
    if (res.code === 'SUCCESS') {
      form.setFieldsValue(res.data);
      setDetail(res.data);
      setBid(res.data.bid);
      if (res.data.enterpriseExpand) {
        setExpandBid(res.data.enterpriseExpand.enterpriseBid);
        setenterpriseExpandBid(res.data.enterpriseExpand.bid);
      }
    }
  };

  const getHouseList = async () => {
    const res = await getBuildingHouseList({ projectBid });
    const map: any = {};
    if (res.code === 'SUCCESS') {
      setHouseList(res.data.items ?? []);
      const arr =
        res.data.items &&
        res.data.items.map((i) => {
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

  const getCarList = async () => {
    const res = await getParkingQueryByPage({ projectBid, pageNo: 1, pageSize: 20 });
    const map: any = {};
    if (res.code === 'SUCCESS') {
      setCarList(res.data.items ?? []);
      const arr =
        res.data.items &&
        res.data.items.map((i) => {
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
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    if (project) {
      setProjectBid(project.bid);
    }
    if (location.query.isEdit === 'true') {
      getEnterpriseDetail(location.query.bid);
    }
    if (location.query.isEdit === 'false' && projectBid) {
      actionRef.current?.addEditRecord(
        { id: Date.now(), projectBid: projectBid ?? '' },
        { newRecordType: 'dataSource' },
      );
    }
    if (projectBid) {
      getHouseList();
      getCarList();
    }
  }, [location.query, projectBid]);

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
      // fieldProps: {
      //   onChange: (value: any) => {
      //     // setPropertyType(value);
      //   },
      // },
    },
    {
      title: '关联产权',
      key: 'propertyBid',
      dataIndex: 'propertyBid',
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

  const onFinish = async (values: Record<string, any>) => {
    try {
      let fetch = modifyEnterprise;
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
          item.enterpriseBid = bid;
        });
      }
      if (location.query.isEdit === 'false') {
        fetch = createEnterprise;
      } else {
        values.bid = bid;
        if (!values.enterpriseExpand) {
          values.enterpriseExpand = {};
        }
        values.enterpriseExpand.enterpriseBid = bid;
        values.enterpriseExpand.bid = enterpriseExpandBid;
        values.enterpriseExpand.name = values.name;
        values.enterpriseExpand.mobile = values.mobile;
        values.enterpriseExpand.identityType = values.identityType;
        values.enterpriseExpand.identityCard = values.identityCard;
      }
      values.projectBid = projectBid;
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
      validateTrigger="onBlur"
    >
      <PageContainer
        header={{
          // title: location.query.isEdit === 'true' ? '编辑企业客户' : '新建企业客户',
          title: null,

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
                label={fieldLabels.managerName}
                name="managerName"
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: '请输入企业管理员姓名' },
                  {
                    max: 30,
                    message: '字符长度不可超过30',
                  },
                ]}
                placeholder="请输入企业管理员姓名"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.managerPhone}
                validateTrigger="onBlur"
                name="managerPhone"
                rules={[
                  { required: true, message: '请输入企业管理员手机号码' },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误',
                  },
                ]}
                placeholder="请输入企业管理员手机号码"
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                initialValue={'usci'}
                label={fieldLabels.identityType}
                name="identityType"
                placeholder="请选择证件类型"
                request={async () => {
                  const res = await getEnterpriseCertificateEnums();
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
                  { required: true },
                  {
                    validator(rule, value, callback) {
                      const reg = /^(([0-9A-Z]{18}))$/;
                      if (value && !reg.test(value)) {
                        callback('请输入正确的证件号码');
                      }
                      callback();
                    },
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.industry}
                name="industry"
                placeholder="请选择所属行业"
                request={async () => {
                  const res = await getIndustryEnums();
                  return res.data.map((i, index) => ({
                    value: i.code,
                    label: i.codeName,
                    key: i.code + index,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="更多信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.legalPerson}
                name={['enterpriseExpand', 'legalPerson']}
                placeholder="请输入企业法人"
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
                label={fieldLabels.legalIdCard}
                name={['enterpriseExpand', 'legalIdCard']}
                placeholder="请输入法人证件号码"
                validateTrigger="onBlur"
                rules={[
                  {
                    validator(rule, value, callback) {
                      const reg = /^(([0-9A-Za-z]{15})|([0-9A-Za-z]{18})|([0-9A-Za-z]{20}))$/;
                      if (value && !reg.test(value)) {
                        callback('请输入正确的证件号码');
                      }
                      callback();
                    },
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.companyScale}
                name={['enterpriseExpand', 'companyScale']}
                placeholder="请选择公司规模"
                request={async () => {
                  const res = await getCompanyScaleEnums();
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.codeName,
                  }));
                }}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormDatePicker
                width="md"
                label={fieldLabels.establishDate}
                name={['enterpriseExpand', 'establishDate']}
                placeholder="请选择成立日期"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                width="sm"
                label={fieldLabels.registeredCapital}
                name={['enterpriseExpand', 'registeredCapital']}
                addonAfter="万元"
                placeholder="请输入注册资金"
                validateTrigger="onBlur"
                rules={[
                  {
                    validator(rule, value, callback) {
                      const reg = /^\d+(\.\d+)?$/;
                      if (value && !reg.test(value)) {
                        callback('请输入正确金额');
                      }
                      callback();
                    },
                  },
                ]}
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
                  return [dom.delete];
                },
              }}
            />
          </ProForm.Item>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default EnterPriseForm;
