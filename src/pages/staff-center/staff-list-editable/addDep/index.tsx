import { addStaffOrg, updateStaffOrg } from '@/services/base';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: any;
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
  const [title, setTitle] = useState('新建部门');
  const [parentId, setParentId] = useState<string>();
  useEffect(() => {
    if (open === true) {
      formRef.current?.resetFields();
      if (data.type === 'add') {
        setTitle('新建部门');
        formRef?.current?.setFieldsValue({
          parentName: data.name,
        });
        setParentId(data.id);
      } else if (data.type === 'edit') {
        setTitle('编辑部门');
        formRef?.current?.setFieldsValue({
          name: data.strName,
        });
      } else if (data.type === 'addParent') {
        setTitle('新建根节点名称');
      }
    }
  }, [open]);
  const onFinish = async (formData: OrgListPageType) => {
    let res: any;
    if (data.type === 'add') {
      res = await addStaffOrg({ orgName: formData.name, parentId, source: 1 });
    } else if (data.type === 'edit') {
      res = await updateStaffOrg({ orgName: formData.name, id: data.id });
    } else if (data.type === 'addParent') {
      res = await addStaffOrg({ orgName: formData.name, source: 1 });
    }

    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      onSubmit();
    }
  };
  return (
    <ModalForm
      labelCol={{ flex: data?.type === 'addParent' ? '130px' : '100px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={620}
      title={title}
      colon={false}
      open={open}
      onFinish={onFinish}
      {...rest}
    >
      {data?.type === 'add' && <ProFormText readonly={true} name="parentName" label="上级部门" />}
      <ProFormText
        readonly={readonly}
        name="name"
        label={data?.type === 'addParent' ? '部门根节点名称' : '节点名称'}
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请输入名称"
      />
      {data?.type === 'addParent' && (
        <div style={{ color: '#767676' }}>部门根节点是指最上级节点，一般是公司/集团名称</div>
      )}
    </ModalForm>
  );
};

export default Add;
