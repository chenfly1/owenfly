import { useInitState } from '@/hooks/useInitState';
import { FlowSource } from '@/models/useFlow';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useModel } from 'umi';
import { useEffect } from 'react';
import { FormUpdateProps } from '.';

export default ({ source }: { source?: FormUpdateProps['baseForm'] }) => {
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);
  const flowSource = useModel('useFlow');
  useEffect(() => {
    flowSource.handleTenant(source?.tenantId);
  }, []);
  return (
    <>
      <ProFormText name="id" hidden />
      <ProFormSelect
        name="tenantId"
        label="所属租户"
        fieldProps={{
          options: tenants.value,
          loading: tenants.loading,
          showSearch: true,
          filterOption: (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }}
        placeholder="请选择所属租户"
        rules={[{ required: true }]}
      />
      <ProFormText name="name" label="表单名称" rules={[{ required: true }]} />
      {/* <ProFormText name="thirdServerUrl" label="表单服务URL" /> */}
    </>
  );
};
