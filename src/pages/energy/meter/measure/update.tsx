import { ProFormText } from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';

export interface CreateMeasureFormProps {
  id: string;
  name: string;
  meterSpaceName?: string;
}
export const Create = DrawerForm<CreateMeasureFormProps>(
  () => {
    return (
      <>
        <ProFormText name="id" hidden />
        <ProFormText name="name" label="上级节点" disabled />
        <ProFormText
          name="meterSpaceName"
          label="空间名称"
          fieldProps={{
            maxLength: 20,
          }}
          rules={[{ required: true }]}
        />
      </>
    );
  },
  { title: '新增下级节点' },
);

export interface UpdateMeasureFormProps {
  id: string;
  meterSpaceName?: string;
}
export const Update = DrawerForm<UpdateMeasureFormProps>(
  () => {
    return (
      <>
        <ProFormText name="id" hidden />
        <ProFormText
          name="meterSpaceName"
          label="空间名称"
          fieldProps={{
            maxLength: 20,
          }}
          rules={[{ required: true }]}
        />
      </>
    );
  },
  { title: '编辑节点' },
);
