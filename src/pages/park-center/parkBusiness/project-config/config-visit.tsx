import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import type { ProFormInstance, PageContainerProps } from '@ant-design/pro-components';
import { Button, Card, Col, Form, Row, Tag, TreeSelect, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  buildingList,
  businessRuleVisitor,
  getVisitorConfig,
  parkAreaTree,
  parkYardListByPage,
} from '@/services/park';
import { getProjectBid } from '@/utils/project';
import { DeleteOutlined } from '@ant-design/icons';
import style from './config-visit.less';

const ConfigCharge: React.FC<PageContainerProps> = forwardRef((props, ref) => {
  const chargeRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const projectId = getProjectBid();
  const [maxLength] = useState<number>(50);
  const [parkScopes, setParkScopes] = useState<Record<string, any>[]>([]);
  const [buildsScopes, setBuildsScopes] = useState<Record<string, any>[]>([]);

  const queryAreaData = async (para: any) => {
    if (para.parkId) {
      const res = await parkAreaTree(para.parkId);
      return res.data;
    } else {
      return [];
    }
  };
  const getDetail = async () => {
    const res = await getVisitorConfig({ projectId });
    if (res.code === 'SUCCESS') {
      const passType = res.data.passType || 1;
      form.setFieldsValue({
        passFlag: res.data?.passFlag === 1 ? true : false,
        otherPayFlag: res.data?.otherPayFlag === 1 ? true : false,
        passScope: res.data.passScope,
        passType,
      });
      if (passType === 1) {
        setBuildsScopes([]);
        setParkScopes(res.data.passScope);
      } else {
        setBuildsScopes(res.data.passScope);
        setParkScopes([]);
      }
    }
  };

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: projectId,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  // 楼栋数据
  const queryBuildData = async () => {
    const res = await buildingList({
      projectId: projectId,
    });
    return (res.data || []).map((item: any) => ({
      label: item.name,
      value: item.bid,
    }));
  };

  useEffect(() => {
    queryParkList();
    getDetail();
    // form.resetFields();

    // if (parkId.length) {
    //   const currentParkRow =
    //     (data?.passScope || []).find((item: any) => item?.parkId === parkId) || {};
    //   form.setFieldsValue({
    //     passFlag: data?.passFlag === 1 ? true : false,
    //     otherPayFlag: data?.otherPayFlag === 1 ? true : false,
    //     // passScope: currentParkRow.channelId || [],
    //   });
    // }

    // queryAreaData(props);
  }, []);

  const onEditBtn = (callback?: any) => {
    if (disable) {
      setDisable(false);
    } else {
      setOnSaving(true);
      chargeRef.current?.validateFields().then((values) => {
        const params = {
          projectId: projectId,
          passFlag: values.passFlag ? 1 : 0,
          otherPayFlag: values.otherPayFlag ? 1 : 0,
          passScope: values.passScope,
          passType: values.passType,
        };
        businessRuleVisitor(params)
          .then((res) => {
            setOnSaving(false);
            if (res.code == 'SUCCESS') {
              // 保存成功
              setDisable(true);
              form.setFieldsValue(values);
              message.success(res.message);
              if (typeof callback === 'function') {
                callback();
              }
            } else {
              message.error(res.message);
            }
          })
          .catch(() => {
            setOnSaving(false);
            message.error('操作失败，请重试');
          });
      });
    }
  };

  useImperativeHandle(ref, () => {
    return {
      onEditBtn,
      disable,
    };
  });

  return (
    <PageContainer header={{ title: null }}>
      <div
        className={style.cusCard}
        style={{
          display: 'flex',
          alignItems: 'self-start',
          justifyContent: 'space-between',
          margin: '10px 21px',
        }}
      >
        <ProForm
          key="1"
          layout="horizontal"
          formRef={chargeRef}
          form={form}
          disabled={disable}
          colon={false}
          style={{ width: '100%' }}
          submitter={false}
          validateTrigger="onBlur"
        >
          <Card bordered={false} style={{ margin: '7px 21px' }}>
            <ProFormCheckbox name="passFlag" extra={'开启后访客可以自动入场，收取临停费用'}>
              允许访客通行
            </ProFormCheckbox>
            {/* <ProFormSwitch name="otherPayFlag" label="访客订单代缴" /> */}
            <ProFormRadio.Group
              name="passType"
              options={[
                {
                  label: '按照车场开通',
                  value: 1,
                },
                {
                  label: '按照楼栋开通',
                  value: 2,
                },
              ]}
              fieldProps={{
                onChange: (e) => {
                  // 解决切换时，数据显示异常问题
                  const values = chargeRef.current?.getFieldsValue();
                  if (e.target.value === 1) {
                    setBuildsScopes(values.passScope);
                    if (parkScopes.length > 0) {
                      chargeRef.current?.setFieldValue('passScope', parkScopes);
                    } else {
                      chargeRef.current?.setFieldValue('passScope', []);
                    }
                  } else {
                    setParkScopes(values.passScope);
                    if (buildsScopes.length > 0) {
                      chargeRef.current?.setFieldValue('passScope', buildsScopes);
                    } else {
                      chargeRef.current?.setFieldValue('passScope', []);
                    }
                  }
                },
              }}
            />
            <ProFormDependency name={['passType']}>
              {({ passType }) => {
                if (passType === 1) {
                  return (
                    <ProFormList
                      name="passScope"
                      deleteIconProps={{
                        Icon: (_) => {
                          if (disable) {
                            return null;
                          }
                          return <DeleteOutlined {..._} style={{ color: 'red' }} />;
                        },
                      }}
                      creatorButtonProps={{
                        creatorButtonText: '新增权限',
                      }}
                      min={1}
                      max={maxLength}
                      copyIconProps={false}
                      itemRender={({ listDom, action }, { index }) => (
                        <Card
                          bordered
                          style={{ marginBlockEnd: 8 }}
                          title={maxLength > 1 ? `通行权限${index + 1}` : false}
                          extra={action}
                          bodyStyle={{ paddingBlockEnd: 0 }}
                        >
                          {listDom}
                        </Card>
                      )}
                    >
                      {(f, index, action) => {
                        return (
                          <Row>
                            <Col span={7} offset={1}>
                              <ProFormSelect
                                name="parkId"
                                label="车场名称"
                                allowClear={false}
                                rules={[{ required: true }]}
                                fieldProps={{
                                  showSearch: true,
                                  onChange: () => {
                                    action.setCurrentRowData({
                                      channelId: [],
                                    });
                                  },
                                }}
                                request={queryParkList}
                              />
                            </Col>
                            <Col span={7} offset={1}>
                              <ProFormTreeSelect
                                name="channelId"
                                width={300}
                                dependencies={['parkId']}
                                label={'通行范围'}
                                request={queryAreaData}
                                fieldProps={{
                                  multiple: true,
                                  treeDefaultExpandAll: true,
                                  treeNodeFilterProp: 'name',
                                  treeCheckable: true,
                                  treeLine: true,
                                  showCheckedStrategy: TreeSelect.SHOW_PARENT,
                                  placeholder: '请选择',
                                  fieldNames: {
                                    label: 'name',
                                    value: 'id',
                                    children: 'child',
                                  },
                                }}
                                rules={[{ required: true, message: '请选择通行范围' }]}
                              />
                            </Col>
                          </Row>
                        );
                      }}
                    </ProFormList>
                  );
                } else {
                  return (
                    <ProFormList
                      name="passScope"
                      deleteIconProps={{
                        Icon: (_) => {
                          if (disable) {
                            return null;
                          }
                          return <DeleteOutlined {..._} style={{ color: 'red' }} />;
                        },
                      }}
                      creatorButtonProps={{
                        creatorButtonText: '新增权限',
                      }}
                      min={1}
                      max={maxLength}
                      copyIconProps={false}
                      itemRender={({ listDom, action }, { index }) => (
                        <Card
                          bordered
                          style={{ marginBlockEnd: 8 }}
                          title={maxLength > 1 ? `通行权限${index + 1}` : false}
                          extra={action}
                          bodyStyle={{ paddingBlockEnd: 0 }}
                        >
                          {listDom}
                        </Card>
                      )}
                    >
                      {(f, index, action) => {
                        return (
                          <Row>
                            <Col span={7} offset={1}>
                              <ProFormSelect
                                name="parkId"
                                label="车场名称"
                                allowClear={false}
                                rules={[{ required: true }]}
                                fieldProps={{
                                  showSearch: true,
                                  onChange: () => {
                                    action.setCurrentRowData({
                                      channelId: [],
                                    });
                                  },
                                }}
                                request={queryParkList}
                              />
                            </Col>
                            <Col span={7} offset={1}>
                              <ProFormSelect
                                name="channelId"
                                mode="multiple"
                                width={300}
                                rules={[{ required: true, message: '请选择楼栋' }]}
                                label={'楼栋'}
                                request={queryBuildData}
                              />
                            </Col>
                          </Row>
                        );
                      }}
                    </ProFormList>
                  );
                }
              }}
            </ProFormDependency>
          </Card>
        </ProForm>

        <Button
          type="primary"
          onClick={onEditBtn}
          loading={onSave}
          style={{ position: 'relative', top: '7px', right: ' 20px' }}
        >
          {disable ? '编辑' : '保存'}
        </Button>
      </div>
    </PageContainer>
  );
});

export default ConfigCharge;
