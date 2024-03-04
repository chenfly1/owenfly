import {
  createTradeAccount,
  tradeAccountDetail,
  tradeCategoryList,
  updateTradeAccount,
} from '@/services/payment';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormCheckbox } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const id = data?.id;
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const getDetail = async () => {
    const res = await tradeAccountDetail({ id });
    if (res.code === 'SUCCESS') {
      formRef?.current?.setFieldsValue({
        ...res.data,
        categoryIds: res.data.categoryList.map((item: any) => item.id + ''),
      });
    }
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('新建收款账户');
      if (id) {
        setTitle('编辑收款账户');
        getDetail();
      }
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    Modal.confirm({
      title: '是否确认保存？',
      content: '商户一经保存立即生效，请确认信息准确',
      onOk: async () => {
        const params = {
          projectId: project.bid,
          ...formData,
        };
        const res = id
          ? await updateTradeAccount({ id, ...params })
          : await createTradeAccount(params);
        if (res.code === 'SUCCESS') {
          message.success('创建成功');
          onSubmit();
          return true;
        } else {
          return false;
        }
      },
    });
  };

  return (
    <>
      <DrawerForm
        colon={false}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        submitter={undefined}
        onFinish={onFinish}
      >
        <ProFormText
          label="商户名称"
          name="accountName"
          width={300}
          placeholder="请输入商户名称"
          fieldProps={{
            maxLength: 20,
            showCount: true,
          }}
          rules={[{ required: true }]}
        />
        <ProFormText
          label="商户号"
          name="accountNumber"
          readonly={id}
          width={300}
          placeholder="请输入商户号"
          rules={[{ required: true }]}
        />
        <ProFormText
          label="APPID"
          readonly={id}
          name="appId"
          width={300}
          placeholder="请输入APPID"
          rules={[{ required: true }]}
        />
        <ProFormCheckbox.Group
          name="categoryIds"
          label="收费项"
          rules={[{ required: true }]}
          // options={[
          //   {
          //     label: '水费',
          //     value: '1',
          //   },
          //   {
          //     label: '电费',
          //     value: '2',
          //   },
          //   {
          //     label: '物业费',
          //     value: '3',
          //   },
          // ]}
          request={async () => {
            const res = await tradeCategoryList();
            return res.data.map((item: any) => ({
              label: item.name,
              value: item.id + '',
            }));
          }}
        />
      </DrawerForm>
    </>
  );
};

export default Add;
