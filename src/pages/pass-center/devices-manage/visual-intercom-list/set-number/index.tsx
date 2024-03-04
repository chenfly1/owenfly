import {
  ModalForm,
  ProFormDependency,
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import { updateDeviceCode } from '@/services/auth';
type IProps = {
  modalVisit: boolean;
  data: any;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const SetNumber: React.FC<IProps & Record<string, any>> = ({
  modalVisit,
  data,
  onSubmit,
  onOpenChange,
}) => {
  const formRef = useRef<ProFormInstance>();
  const [disabled, setDisabled] = useState<boolean>(true);
  const onFinish = async (values: Record<string, any>) => {
    const res = await updateDeviceCode({
      id: data?.id,
      locationType: values?.locationType,
      locationNumber: [
        values.PROJECT_STAGE,
        values.BUILDING,
        values.UNIT,
        values.FLOOR,
        values.ROOM,
        values.DEVICE,
      ]
        .map((i) => {
          if (i) {
            return i;
          } else {
            return '00';
          }
        })
        .join('.'),
    });
    if (res.code === 'SUCCESS') {
      message.success('更新成功');
      onSubmit();
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      setDisabled(true);
      let PROJECT_STAGE: any, BUILDING: any, UNIT: any, FLOOR: any, ROOM: any, DEVICE: any;
      if (data?.locationNumber) {
        [PROJECT_STAGE, BUILDING, UNIT, FLOOR, ROOM, DEVICE] = data?.locationNumber.split('.');
        if (Number(UNIT || 0)) {
          setDisabled(false);
        }
      }
      formRef?.current?.setFieldsValue({
        ...data,
        umitSeitch: Number(UNIT || 0) ? true : false,
        PROJECT_STAGE,
        BUILDING,
        UNIT,
        FLOOR,
        ROOM,
        DEVICE,
      });
    }
  }, [modalVisit]);

  return (
    <ModalForm<Record<string, any>>
      layout="horizontal"
      formRef={formRef}
      onOpenChange={onOpenChange}
      width={700}
      colon={false}
      title="设备编号编辑"
      labelAlign="left"
      labelCol={{
        flex: '100px',
      }}
      open={modalVisit}
      modalProps={{
        centered: true,
      }}
      onFinish={onFinish}
    >
      <ProFormText label="设备号（DID）" disabled placeholder="请输入设备号（DID）" name="did" />
      <ProFormSelect
        label="设备类型"
        placeholder="请选择设备类型"
        disabled
        name="typeCode"
        options={[
          {
            value: 'central_management',
            label: '中心管理机',
          },
          {
            value: 'entrance',
            label: '门口机',
          },
          {
            value: 'indoor_unit',
            label: '室内机',
          },
        ]}
      />
      <ProFormDependency name={['typeCode']}>
        {({ typeCode }) => {
          return typeCode === 'entrance' ? (
            <ProFormSelect
              label="安装位置"
              placeholder="请选择安装位置"
              name="locationType"
              rules={[{ required: true, message: '请选择安装位置' }]}
              options={[
                {
                  value: 1,
                  label: '区口',
                },
                {
                  value: 2,
                  label: '梯口',
                },
              ]}
            />
          ) : null;
        }}
      </ProFormDependency>
      <ProFormDependency name={['typeCode', 'locationType']}>
        {({ typeCode, locationType }) => {
          if (typeCode === 'indoor_unit') {
            return (
              <ProFormItem label="设备编号" labelCol={{ span: 24 }} className={styles.formItem}>
                <Space>
                  <ProFormText
                    name="PROJECT_STAGE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    style={{ textAlign: 'center' }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="BUILDING"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="UNIT"
                    disabled={disabled}
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: !disabled, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="FLOOR"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="ROOM"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="DEVICE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                </Space>
                <div className={styles.flexBox}>
                  <div className={styles.box}>区</div>
                  <div className={styles.box}>楼栋</div>
                  <div className={styles.box}>单元</div>
                  <div className={styles.box}>层</div>
                  <div className={styles.box}>房</div>
                  <div className={styles.box}>设备</div>
                </div>
                <div className={styles.flexBox}>
                  <div className={styles.box} />
                  <div className={styles.box} />
                  <div className={styles.box}>
                    <ProFormSwitch
                      name="umitSeitch"
                      fieldProps={{
                        onChange: (value) => {
                          if (value) {
                            setDisabled(false);
                          } else {
                            setDisabled(true);
                            formRef?.current?.setFieldsValue({
                              UNIT: '',
                            });
                          }
                        },
                      }}
                    />
                  </div>
                  <div className={styles.box} />
                  <div className={styles.box} />
                  <div className={styles.box} />
                </div>
              </ProFormItem>
            );
          }
          if (typeCode === 'entrance' && locationType === 2) {
            return (
              <ProFormItem label="设备编号" labelCol={{ span: 24 }} className={styles.formItem}>
                <Space>
                  <ProFormText
                    name="PROJECT_STAGE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="BUILDING"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="UNIT"
                    disabled={disabled}
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: !disabled, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="DEVICE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                </Space>
                <div className={styles.flexBox}>
                  <div className={styles.box}>区</div>
                  <div className={styles.box}>楼栋</div>
                  <div className={styles.box}>单元</div>
                  <div className={styles.box}>设备</div>
                </div>
                <div className={styles.flexBox}>
                  <div className={styles.box} />
                  <div className={styles.box} />
                  <div className={styles.box}>
                    <ProFormSwitch
                      name="umitSeitch"
                      fieldProps={{
                        onChange: (value) => {
                          if (value) {
                            setDisabled(false);
                          } else {
                            setDisabled(true);
                            formRef?.current?.setFieldsValue({
                              UNIT: '',
                            });
                          }
                        },
                      }}
                    />
                  </div>
                  <div className={styles.box} />
                </div>
              </ProFormItem>
            );
          }
          if (typeCode === 'entrance' && locationType === 1) {
            return (
              <ProFormItem label="设备编号" labelCol={{ span: 24 }} className={styles.formItem}>
                <Space>
                  <ProFormText
                    name="PROJECT_STAGE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    width={'md'}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                  <ProFormText
                    name="DEVICE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    width={'md'}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                </Space>
                <div className={styles.flexBox}>
                  <div className={styles.box}>区</div>
                  <div className={styles.box}>设备</div>
                </div>
              </ProFormItem>
            );
          }
          if (typeCode === 'central_management') {
            return (
              <ProFormItem label="设备编号" labelCol={{ span: 24 }} className={styles.formItem}>
                <Space>
                  <ProFormText
                    name="DEVICE"
                    fieldProps={{
                      size: 'large',
                      maxLength: 2,
                    }}
                    width={652}
                    rules={[
                      { required: true, message: '请输入数字' },
                      { pattern: /^\d+$/, message: '请输入数字' },
                    ]}
                  />
                </Space>
                <div className={styles.flexBox}>
                  <div className={styles.box}>设备</div>
                </div>
              </ProFormItem>
            );
          }
        }}
      </ProFormDependency>
    </ModalForm>
  );
};

export default SetNumber;
