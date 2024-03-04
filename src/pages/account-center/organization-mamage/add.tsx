import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { orgCreate, orgQueryTreeList, orgUpdate } from '@/services/auth';
import { ProFormSelect } from '@ant-design/pro-form';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: any;
};

const handlerCreate = async (params: any) => {
  try {
    const _params = {
      ...params,
    };
    const res = await orgCreate(_params);
    if (res.code === 'SUCCESS') {
      message.success('请求成功！');
      return true;
    } else {
      return false;
    }
  } catch (err) {
    message.error('请求失败，请重试！');
    return false;
  }
};
const handlerUpdate = async (params: OrgListPageType) => {
  try {
    const res = await orgUpdate(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功！');
      return true;
    }
    return false;
  } catch (err) {
    message.error('请求失败，请重试！');
    return false;
  }
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  onSubmit,
  data,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState('新建组织');
  useEffect(() => {
    if (open === true) {
      formRef.current?.resetFields();
      if (data.type === 'add') {
        setTitle('新建组织');
        orgQueryTreeList().then((res) => {
          formRef?.current?.setFieldsValue({
            parentName: (res.data || [])[0]?.name,
          });
          data.parentBid = (res.data || [])[0]?.bid;
        });
      } else if (data.type === 'addChildren') {
        setTitle('新建下级组织');
        formRef?.current?.setFieldsValue({
          parentName: data.name,
        });
        data.parentBid = data.bid;
      } else if (data.type === 'edit') {
        setTitle('编辑组织');
        formRef?.current?.setFieldsValue({
          ...data,
        });
      }
    }
  }, [open]);
  const onFinish = async (formData: OrgListPageType) => {
    let success = false;
    if (data?.type === 'add') {
      const params: OrgListPageType = {
        parentBid: data.parentBid,
        state: 'NORMAL',
        sort: data.sort,
        name: formData.name,
        source: 'user',
        orgType: 'customer',
      };
      success = await handlerCreate(params);
    } else if (data.type === 'addChildren') {
      const params: OrgListPageType = {
        parentBid: data.parentBid,
        state: 'NORMAL',
        sort: data.sort,
        name: formData.name,
        source: 'user',
        orgType: 'customer',
      };
      // 更新
      success = await handlerCreate(params);
    } else if (data.type === 'edit') {
      const params: OrgListPageType = {
        // ...data,
        id: data.id,
        bid: data?.bidId,
        parentBid: data.parentBid,
        sort: data.sort,
        source: data.source,
        useArea: data.useArea,
        systemBid: data.systemBid,
        name: formData.name,
        state: formData.state,
      };
      success = await handlerUpdate(params);
    }
    if (success) {
      onSubmit();
    }
  };
  return (
    <ModalForm
      labelCol={{ flex: '100px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={620}
      title={title}
      open={open}
      onFinish={onFinish}
      {...rest}
    >
      <ProFormText readonly={true} name="parentName" label="上级组织" />
      <ProFormText
        readonly={readonly}
        name="name"
        label="组织名称"
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请输入名称"
      />
      {data.type === 'edit' && (
        <ProFormSelect
          name="state"
          label="组织状态"
          rules={[
            {
              required: true,
            },
          ]}
          placeholder={'请选择状态'}
          options={[
            {
              label: '可用',
              value: 'NORMAL',
            },
            {
              label: '禁用',
              value: 'BAND',
            },
          ]}
        />
      )}
    </ModalForm>
  );
};

export default Add;
