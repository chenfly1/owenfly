import DrawerForm from '@/components/DrawerForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { ProFormDigit, ProFormItem, ProFormRadio, ProFormText } from '@ant-design/pro-components';

export interface LimitFormProps {
  ids?: number[];
  periodType: string;
  limitSize?: number;
  unit?: string;
}

const Content = ({ source }: { source?: LimitFormProps }) => {
  const { monitorPointPeriodTypeMap } = useInitState<EnergyState>('useEnergy', [
    'monitorPointPeriodTypeMap',
  ]);
  return (
    <>
      <ProFormText name="ids" hidden />
      <ProFormRadio.Group
        radioType="button"
        name="periodType"
        label="周期"
        required={true}
        valueEnum={monitorPointPeriodTypeMap.value}
        fieldProps={{
          optionType: 'button',
          buttonStyle: 'solid',
        }}
      />
      {
        <ProFormItem noStyle shouldUpdate>
          {(form) => {
            const period = monitorPointPeriodTypeMap.value?.[form.getFieldValue('periodType')];
            return (
              <ProFormDigit
                name="limitSize"
                label="用量上限"
                required={true}
                fieldProps={{
                  max: 999999999,
                  precision: 2,
                  addonAfter: `${source?.unit}${period ? `/${period}` : ''}`,
                }}
              />
            );
          }}
        </ProFormItem>
      }
    </>
  );
};

export default DrawerForm<LimitFormProps>(Content, { title: '设置用量上限' });
