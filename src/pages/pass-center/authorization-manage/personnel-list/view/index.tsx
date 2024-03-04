import React, { useEffect, useRef, useState } from 'react';
import { ProFormText, ProFormSelect, ProFormItem, ProFormSwitch } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { getPassingAreaDetails } from '@/services/door';
import OssImage from '@/components/OssImage';
import { face } from '@/components/FileUpload/business';
import styles from './style.less';
import { history } from 'umi';
import { ProFormDependency } from '@ant-design/pro-form';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const View: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const formRef = useRef<ProFormInstance>();
  const [buildingNums, setBuildingNums] = useState<any[]>([]);

  useEffect(() => {
    if (open === true) {
      formRef?.current?.resetFields();
      getPassingAreaDetails(data.id).then((res) => {
        if (res.code === 'SUCCESS') {
          if (res.data.buildingNums)
            setBuildingNums(
              res.data.buildingNums.map((i) => ({
                ...i,
                floorNumber:
                  i.floorNumber &&
                  i.floorNumber
                    .split(',')
                    .map((j: any) => `${j}层`)
                    .join(','),
              })),
            );
          formRef?.current?.setFieldsValue({
            ...res.data,
            icCardClass: res.data?.icCard?.cardClass,
            idCardClass: res.data?.idCard?.cardClass,
            passingArea: data.passingArea,
            dateRange: res.data.authStart ? `${res.data.authStart}至${res.data.authEnd}` : '',
          });
        }
      });
    }
  }, [open]);

  return (
    <DrawerForm
      labelCol={{ flex: '112px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={480}
      className={styles.formItem}
      title="查看人员详情"
      labelAlign="left"
      open={open}
      readonly
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
      }}
      onReset={() => history.goBack()}
    >
      <h3 style={{ fontWeight: 'bold' }}>授权信息</h3>
      <ProFormText name="name" label="姓名" />
      <ProFormText name="phone" label="手机号" />
      <ProFormSelect
        label="人员类型"
        placeholder="请选择"
        name="type"
        options={[
          {
            value: '01',
            label: '员工',
          },
          {
            value: '02',
            label: '客户',
          },
          {
            value: '03',
            label: '保洁人员',
          },
          {
            value: '04',
            label: '安防人员',
          },
          {
            value: '05',
            label: '快递人员',
          },
          {
            value: '06',
            label: '施工人员',
          },
          {
            value: '99',
            label: '其他',
          },
        ]}
      />
      <ProFormText label="所属部门" name="org" />
      <ProFormText label="房产信息" name="house" />
      <ProFormText name="dateRange" label="授权期限" />
      <ProFormText label="通行区域" name="passingArea" />
      <ProFormSwitch
        fieldProps={{ checkedChildren: '有', unCheckedChildren: '无' }}
        name="elevator"
        label="梯控权限"
      />
      <ProFormDependency name={['elevator']}>
        {({ elevator }) => {
          return elevator ? (
            <ProFormItem
              label="通行楼层"
              name="passingAreaIds"
              className={styles.timePicker}
              labelCol={{
                flex: '112px',
              }}
            >
              {buildingNums.map((i) => (
                <div key={i.deviceName} style={{ lineHeight: '32px' }}>
                  {i.deviceName}：{i.floorNumber}
                </div>
              ))}
            </ProFormItem>
          ) : null;
        }}
      </ProFormDependency>
      <h3 style={{ fontWeight: 'bold' }}>通行凭证</h3>
      <ProFormItem shouldUpdate>
        {(form) => {
          console.log(form);
          const faceUri = form?.getFieldValue('faceUri') || '';
          return (
            <div className={styles.formFaceItem}>
              <ProFormItem label="人脸照片" labelCol={{ flex: '112px' }} name="faceUri">
                <OssImage
                  business={face.id}
                  objectId={faceUri}
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              </ProFormItem>
            </div>
          );
        }}
      </ProFormItem>
      <ProFormText label="ID卡号" name="idCardNum" />
      <ProFormSelect
        label="ID卡类型"
        placeholder="请选择"
        name="idCardClass"
        options={[
          {
            value: 1,
            label: '管理卡',
          },
          {
            value: 2,
            label: '业主卡',
          },
        ]}
      />
      <ProFormText label="IC卡号" name="icCardNum" />
      <ProFormSelect
        label="IC卡类型"
        placeholder="请选择"
        name="icCardClass"
        options={[
          {
            value: 1,
            label: '管理卡',
          },
          {
            value: 2,
            label: '业主卡',
          },
        ]}
      />
    </DrawerForm>
  );
};

export default View;
