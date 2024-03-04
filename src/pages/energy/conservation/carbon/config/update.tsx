import DrawerForm from '@/components/DrawerForm';
import { ProFormDigit, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { isUndefined } from 'lodash';

export type CarbonUpdateFormProps = Partial<
  Pick<CarbonConfigType, 'energyTypeName' | 'carbon' | 'carbonDioxide' | 'co2'>
>;
const content = ({ source, form }: { source?: CarbonUpdateFormProps; form: ProFormInstance }) => {
  return (
    <>
      <ProFormText label="能源" name="energyTypeName" disabled />
      <ProFormDigit
        label="碳排放"
        name="carbon"
        fieldProps={{
          addonAfter: 'kg',
          onChange: (value) => {
            form.setFieldValue(
              'carbonDioxide',
              value && !isUndefined(source?.co2) ? value * Number(source?.co2) : '',
            );
          },
          max: 999999999,
          precision: 2,
        }}
        rules={[{ required: true }]}
      />
      <ProFormText
        label="二氧化碳排放"
        name="carbonDioxide"
        disabled
        fieldProps={{
          addonAfter: 'kg',
        }}
      />
    </>
  );
};

export default DrawerForm<CarbonUpdateFormProps>(content, {
  title: '折碳配置',
  labelCol: { flex: '100px' },
});
