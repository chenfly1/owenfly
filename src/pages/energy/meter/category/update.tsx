import { Spin } from 'antd';
import {
  ProFormItem,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';

export type UpdateCategoryFormProps = Partial<
  Pick<CategoryItemType, 'id' | 'insType' | 'insTagName' | 'remark'>
>;
const FormContent = () => {
  const { insTypeMap } = useInitState<EnergyState>('useEnergy', ['insTypeMap']);

  return (
    <>
      <Spin wrapperClassName="w-100" spinning={insTypeMap.loading}>
        <ProFormText name="id" hidden />
        <ProFormItem noStyle shouldUpdate>
          {(form) => {
            return (
              <ProFormRadio.Group
                radioType="button"
                name="insType"
                label="仪表类型"
                required={true}
                fieldProps={{
                  buttonStyle: 'solid',
                }}
                disabled={form.getFieldValue('id') !== undefined}
                valueEnum={insTypeMap.value}
              />
            );
          }}
        </ProFormItem>
        <ProFormText
          name="insTagName"
          label="分项名称"
          required={true}
          fieldProps={{ maxLength: 20, allowClear: false }}
        />
        <ProFormTextArea name="remark" label="备注说明" fieldProps={{ maxLength: 200, rows: 5 }} />
      </Spin>
    </>
  );
};

export const Update = DrawerForm<UpdateCategoryFormProps>(FormContent, { title: '编辑分项' });
export const Create = DrawerForm<UpdateCategoryFormProps>(FormContent, { title: '新增分项' });
