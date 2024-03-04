import React, { useEffect, useRef } from 'react';
import { DrawerForm, ProFormText, ProFormItem, ProFormSelect } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import OssImage from '@/components/OssImage';
import { staffBusiness } from '@/components/FileUpload/business';
import { history } from 'umi';
import { getStaffDetails } from '@/services/base';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (open) {
      getStaffDetails(data?.id).then((res) => {
        formRef?.current?.setFieldsValue({
          ...res.data,
        });
      });
    }
  }, [open]);

  return (
    <DrawerForm
      labelCol={{ flex: '80px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      title="员工详情"
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
      <ProFormText name="name" label="员工姓名" />
      <ProFormText name="id" label="员工ID" />
      <ProFormSelect
        label="性别"
        name="sex"
        options={[
          {
            value: 1,
            label: '男',
          },
          {
            value: 2,
            label: '女',
          },
        ]}
      />
      <ProFormText label="所属部门" name="orgName" />
      <ProFormText label="手机号" name="mobile" />
      <ProFormText label="邮箱" name="workEmail" />
      <ProFormText label="工号" name="empNo" />
      <ProFormSelect
        label="在离职状态"
        name="status"
        options={[
          {
            value: 1,
            label: '在职',
          },
          {
            value: 2,
            label: '离职',
          },
          {
            value: 3,
            label: '未入职',
          },
          {
            value: 4,
            label: '未知',
          },
        ]}
      />
      <ProFormText label="数据来源" name="sourceStr" />
      <ProFormText label="证件类型" name="idTypeStr" />
      <ProFormText label="证件号码" name="idNo" />
      <ProFormText label="创建时间" name="createTime" />
      <ProFormItem shouldUpdate>
        {(form) => {
          console.log(form);
          const faceUri = form?.getFieldValue('headPortrait');
          return (
            <ProFormItem label="员工头像" labelCol={{ flex: '80px' }} name="headPortrait">
              <OssImage
                business={staffBusiness.id}
                objectId={faceUri}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
    </DrawerForm>
  );
};

export default Add;
