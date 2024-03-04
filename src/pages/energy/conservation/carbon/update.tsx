import {
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';

export type CarbonIndicatorFormProps = Partial<
  Pick<CarbonIndicatorType, 'id' | 'cnName' | 'carbonLimit' | 'remark'>
> & {
  periodType?: string;
};

export const Content = () => {
  const { carbonPeriodTypeMap } = useInitState<EnergyState>('useEnergy', ['carbonPeriodTypeMap']);
  return (
    <>
      <ProFormText name="id" hidden />
      <ProFormText
        name="cnName"
        label="指标名称"
        fieldProps={{
          maxLength: 20,
        }}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="periodType"
        label="统计周期"
        valueEnum={carbonPeriodTypeMap.value}
        fieldProps={{
          loading: carbonPeriodTypeMap.loading,
        }}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="carbonLimit"
        label="碳排放目标值"
        fieldProps={{
          addonAfter: 'kg',
        }}
        rules={[{ required: true }]}
      />
      <ProFormTextArea name="remark" label="备注" fieldProps={{ maxLength: 200 }} />
    </>
  );
};

export default DrawerForm(Content, { title: '指标配置', labelCol: { flex: '100px' } });
