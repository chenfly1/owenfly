import { Spin } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-components';
import { useInitState } from '@/hooks/useInitState';
import { FlowSource } from '@/models/useFlow';
import ModalForm from '@/components/ModalForm';

export type UpdateTenantSettingFormProps = Partial<
  Pick<TenantSettingItemType, 'id' | 'tenantId' | 'serverAddress' | 'tag' | 'type'>
>;
const FormContent = () => {
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);

  return (
    <>
      <Spin wrapperClassName="w-100" spinning={tenants.loading}>
        <ProFormText name="id" hidden />
        <ProFormSelect
          name="tenantId"
          label="租户名称"
          rules={[{ required: true }]}
          valueEnum={(tenants.value || []).reduce(
            (prev: Record<string, any>, curr: FlowSource['tenants']['value'][number]) => ({
              ...prev,
              [curr.value]: curr.label,
            }),
            {},
          )}
        />
        <ProFormRadio.Group
          name="type"
          label="租户类型"
          rules={[{ required: true }]}
          valueEnum={{
            inner: '内部系统',
            outer: '外部系统',
          }}
        />
        <ProFormDependency name={['type']}>
          {({ type }) => {
            if (type === 'inner') {
              return (
                <ProFormText
                  label="组合名称"
                  name="tenantId"
                  disabled
                  rules={[{ required: true }]}
                  fieldProps={{
                    placeholder: '请先选择租户名称',
                  }}
                />
              );
            } else if (type === 'outer') {
              return (
                <>
                  <ProFormText name="serverAddress" label="接口 URL" rules={[{ required: true }]} />
                  <ProFormText name="tag" label="回调凭证" rules={[{ required: true }]} />
                </>
              );
            } else {
              return null;
            }
          }}
        </ProFormDependency>
      </Spin>
    </>
  );
};

export const Update = ModalForm<UpdateTenantSettingFormProps>(FormContent, { title: '编辑配置' });
export const Add = ModalForm<UpdateTenantSettingFormProps>(FormContent, { title: '新增配置' });
