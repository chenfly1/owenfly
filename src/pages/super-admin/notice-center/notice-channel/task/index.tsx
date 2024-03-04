import React, { useEffect, useRef, useState } from 'react';
import { DrawerForm, ProFormItem } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { history } from 'umi';
import { message } from 'antd';
import TransferTenant from '@/pages/super-admin/components/transferTenant';
import { addNoticeTenant, detailNoticeChannel } from '@/services/notice';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const Task: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const formRef = useRef<ProFormInstance>();
  const id = data?.bid;

  const getTenantIds = async () => {
    await detailNoticeChannel({ id }).then((res) => {
      formRef.current?.setFieldsValue({
        tenantIds: (res.data?.channelTenants || []).map((item) => item.tenantId),
      });
    });
  };

  useEffect(() => {
    if (open) {
      getTenantIds();
    }
  }, [open]);

  // 提交
  const onFinish = async (values: any) => {
    const res = await addNoticeTenant({ bid: id, ...values });
    if (res.code === 'SUCCESS') {
      message.success('提交成功');
      onSubmit();
      return true;
    }
    return false;
  };

  return (
    <DrawerForm
      labelCol={{ flex: '80px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      labelAlign="left"
      title={'分配租户'}
      open={open}
      colon={false}
      onFinish={onFinish}
      onReset={() => history.goBack()}
    >
      <ProFormItem shouldUpdate>
        {(form) => {
          console.log(form);
          const tenantIds = form?.getFieldValue('tenantIds');
          return (
            <ProFormItem name="tenantIds" rules={[{ required: true, message: '请选择' }]}>
              <TransferTenant
                TenantIds={tenantIds}
                selectHandle={(keys: string[]) => {
                  form?.setFieldsValue({
                    tenantIds: keys,
                  });
                }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
    </DrawerForm>
  );
};

export default Task;
