import {
  appConfigDetail,
  appConfigEdit,
  packageOptions,
  parkYardListByPage,
} from '@/services/park';
import type { ProFormInstance, FormListActionType } from '@ant-design/pro-components';
import {
  ProFormList,
  ProFormDependency,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  PageContainer,
  ProForm,
} from '@ant-design/pro-components';
import { Button, Card, Col, Row, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Access, useAccess } from 'umi';
import type { pProps } from './data.d';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './bus.less';

const ConfigPass: React.FC<pProps> = forwardRef((props, ref) => {
  const { loading } = props;
  const busRef = useRef<ProFormInstance>();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const access = useAccess();
  const actionRef = useRef<FormListActionType>();
  const [maxLength] = useState<number>(50);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const getDetail = async () => {
    const res = await appConfigDetail({
      // projectId: project.bid,
    });
    if (res.code === 'SUCCESS') {
      let monthlyRentPackageList = (res.data?.monthlyRentPackageList || []).map((item: any) => ({
        parkId: item.parkInfo.id,
        packageId: item.packageInfo.id,
        packageCount: item.packageCount,
      }));
      if (monthlyRentPackageList.length === 0) {
        monthlyRentPackageList = [
          {
            parkId: '',
            packageId: '',
            packageCount: 1,
          },
        ];
      }
      busRef.current?.setFieldsValue({
        ...res.data,
        monthlyRentPackageList,
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      getDetail();
      busRef.current?.setFieldsValue({
        monthlyRentPackageList: [{}],
      });
    }
  }, [loading]);

  const onEditBtn = (callback?: any) => {
    if (disable) {
      setDisable(false);
    } else {
      setOnSaving(true);
      busRef.current?.validateFields().then((values) => {
        values.propertyRightAuthEnable = values.propertyRightAuthEnable ? 1 : 0;
        values.monthlyRentAuthEnable = values.monthlyRentAuthEnable ? 1 : 0;
        values.monthlyRentAuthNeedApply = values.monthlyRentAuthNeedApply ? 1 : 0;
        appConfigEdit({ ...values })
          .then((res) => {
            setOnSaving(false);
            if (res.code == 'SUCCESS') {
              // 保存成功
              setDisable(true);
              busRef.current?.setFieldsValue(values);
              message.success('保存成功');
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

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  return (
    <PageContainer loading={loading} header={{ title: null }}>
      <div style={{ display: 'flex', alignItems: 'self-start', justifyContent: 'space-between' }}>
        <ProForm
          key="2"
          layout="horizontal"
          style={{ width: '100%' }}
          labelCol={{
            flex: '0 0 200px',
          }}
          formRef={busRef}
          colon={false}
          disabled={disable}
          className={styles.busConfig}
          submitter={false}
        >
          <Card style={{ margin: '7px 21px' }}>
            <ProFormSwitch name="propertyRightAuthEnable" label="产权办理" />
            <ProFormSwitch name="monthlyRentAuthEnable" label="月租办理" />
            <ProFormDependency name={['monthlyRentAuthEnable']}>
              {({ monthlyRentAuthEnable }) => {
                if (monthlyRentAuthEnable) {
                  return (
                    <>
                      <ProFormSwitch name="monthlyRentAuthNeedApply" label="月租办理是否需要申请" />
                      <ProFormDigit
                        name="monthlyRentHandleDay"
                        label={'申请后处理工作日'}
                        max={1000}
                        min={0}
                        width={200}
                        addonAfter="天"
                        fieldProps={{
                          controls: false,
                        }}
                      />
                      <ProFormDigit
                        name="monthlyRentPayLimitTime"
                        label={'支付逾期时间'}
                        max={1000}
                        width={200}
                        min={0}
                        addonAfter="小时"
                        fieldProps={{
                          controls: false,
                        }}
                      />
                      {/* <Card title="支持办理套餐" style={{ margin: '7px 21px' }}> */}
                      <ProFormList
                        actionRef={actionRef}
                        name="monthlyRentPackageList"
                        deleteIconProps={{
                          Icon: (_) => {
                            if (disable) {
                              return null;
                            }
                            return <DeleteOutlined {..._} style={{ color: 'red' }} />;
                          },
                        }}
                        creatorButtonProps={{
                          creatorButtonText: '新增套餐',
                        }}
                        min={1}
                        max={maxLength}
                        copyIconProps={false}
                        itemRender={({ listDom, action }, { index }) => (
                          <Card
                            bordered
                            style={{ marginBlockEnd: 8 }}
                            title={maxLength > 1 ? `套餐${index + 1}` : false}
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
                                  fieldProps={{
                                    showSearch: true,
                                    onChange: () => {
                                      action.setCurrentRowData({
                                        packageId: '',
                                      });
                                    },
                                  }}
                                  request={queryParkList}
                                />
                              </Col>
                              <Col span={7} offset={1}>
                                <ProFormSelect
                                  name="packageId"
                                  label="车辆套餐"
                                  dependencies={['parkId']}
                                  fieldProps={{
                                    allowClear: false,
                                    showSearch: true,
                                    placeholder: '请选择',
                                  }}
                                  request={async (values: { parkId: string }) => {
                                    if (values.parkId) {
                                      const res = await packageOptions({ ...values, type: '2' });
                                      return res.data.map((item: any) => {
                                        return {
                                          label: item.name,
                                          value: item.id,
                                        };
                                      });
                                    } else {
                                      return [];
                                    }
                                  }}
                                />
                              </Col>
                              <Col span={7} offset={1}>
                                <ProFormDigit
                                  name="packageCount"
                                  label={'套餐数量'}
                                  max={1000}
                                  min={0}
                                  width={180}
                                  addonAfter="个"
                                  fieldProps={{
                                    controls: false,
                                  }}
                                />
                              </Col>
                            </Row>
                          );
                        }}
                      </ProFormList>
                    </>
                  );
                } else {
                  return null;
                }
              }}
            </ProFormDependency>
          </Card>
          {/* </Card> */}
        </ProForm>

        <Access accessible={access.functionAccess('alitaParking_editBusinessRule')}>
          <Button
            type="primary"
            style={{ position: 'relative', top: '7px', right: ' 20px' }}
            onClick={onEditBtn}
            loading={onSave}
          >
            {disable ? '编辑' : '保存'}
          </Button>
        </Access>
      </div>
    </PageContainer>
  );
});

export default ConfigPass;
