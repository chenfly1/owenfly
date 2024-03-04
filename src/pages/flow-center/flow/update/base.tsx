import { useInitState } from '@/hooks/useInitState';
import { FlowSource } from '@/models/useFlow';
import { getTotalPageSource } from '@/services/energy';
import { getFormList } from '@/services/flow';
import { ProFormSelect, ProFormText, ProFormItem } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { FlowUpdateProps } from '.';
import { useModel } from 'umi';

export default ({ source }: { source?: FlowUpdateProps['baseForm'] }) => {
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);
  const flowSource = useModel('useFlow');
  const existForm = source?.modelKey ? [{ label: source.formName, value: source.modelKey }] : [];
  const [forms, setForms] = useState({
    loading: false,
    list: [] as { label: string; value: string; schema: string }[],
  });
  useEffect(() => {
    flowSource.updateState('__person__', false, {
      tenantId: source?.tenantId,
    });
    setForms((prev) => ({ ...prev, loading: true }));
    getTotalPageSource(getFormList, { pageNo: 1, pageSize: 2000, linked: 0 })
      .then((res) => {
        const list = res.items.map(({ code, name, formJson }) => ({
          label: name,
          value: code,
          schema: formJson,
        }));
        setForms({
          loading: false,
          list,
        });
      })
      .catch(() => {
        setForms({
          loading: false,
          list: [],
        });
      });
  }, []);
  return (
    <>
      <ProFormText name="id" hidden />
      <ProFormText name="modelId" hidden />
      <ProFormText name="modelXml" hidden />
      <ProFormText name="formSchema" hidden />
      <ProFormText name="formName" hidden />
      <ProFormSelect
        name="tenantId"
        label="所属租户"
        placeholder="请选择所属租户"
        rules={[{ required: true }]}
        fieldProps={{
          options: tenants.value,
          loading: tenants.loading,
          showSearch: true,
          filterOption: (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            flowSource.updateState('__person__', false, {
              tenantId: value,
            });
          },
        }}
      />
      <ProFormText name="name" label="流程名称" rules={[{ required: true }]} />
      <ProFormItem noStyle shouldUpdate>
        {(form) => {
          return (
            <ProFormSelect
              name="modelKey"
              label="关联表单"
              rules={[{ required: true }]}
              fieldProps={{
                options: existForm.concat(forms.list),
                loading: forms.loading,
                showSearch: true,
                onChange: (value) => {
                  const match = forms.list.find((item) => item.value === value);
                  form.setFieldValue('formSchema', match?.schema ? JSON.parse(match.schema) : {});
                },
                filterOption: (input: string, option: any) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
              }}
            />
          );
        }}
      </ProFormItem>
      <ProFormSelect
        label="流程负责人"
        name="director"
        fieldProps={{
          loading: flowSource.__person__.loading,
          options: flowSource.__person__.value,
          showSearch: true,
          filterOption: (input: string, option?: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }}
      />
    </>
  );
};
