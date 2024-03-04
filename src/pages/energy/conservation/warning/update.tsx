import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import ModalForm from '@/components/ModalForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';

export type CreateWarningFormProps = Partial<Pick<EnergyWarningEventType, 'cnName'>> & {
  insType?: string;
  monitorTypeId?: string;
};

export const CreateWarningForm = ModalForm<CreateWarningFormProps>(
  () => {
    const { monitorTypeMap, insTypeMap } = useInitState<EnergyState>('useEnergy', [
      'monitorTypeMap',
      'insTypeMap',
    ]);
    return (
      <>
        <ProFormText
          name="cnName"
          label="任务名称"
          fieldProps={{
            maxLength: 20,
          }}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="insType"
          label="仪表类型"
          valueEnum={insTypeMap.value}
          fieldProps={{
            allowClear: false,
            loading: insTypeMap.loading,
          }}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="monitorTypeId"
          label="预警类别"
          valueEnum={monitorTypeMap.value}
          fieldProps={{
            loading: monitorTypeMap.loading,
          }}
        />
      </>
    );
  },
  { width: 400, title: '创建预警任务' },
);

export type UpdateWarningFormProps = Pick<EnergyWarningEventType, 'id' | 'cnName'> & {
  insType?: string;
  monitorTypeId?: string;
};
export const UpdateWarningForm = ModalForm<UpdateWarningFormProps>(
  () => {
    const { monitorTypeMap, insTypeMap } = useInitState<EnergyState>('useEnergy', [
      'monitorTypeMap',
      'insTypeMap',
    ]);
    return (
      <>
        <ProFormText name="id" hidden />
        <ProFormText
          name="cnName"
          label="任务名称"
          fieldProps={{
            maxLength: 20,
          }}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="insType"
          label="仪表类型"
          valueEnum={insTypeMap.value}
          fieldProps={{
            allowClear: false,
            loading: insTypeMap.loading,
          }}
          disabled
        />
        <ProFormSelect
          name="monitorTypeId"
          label="预警类别"
          valueEnum={monitorTypeMap.value}
          fieldProps={{
            loading: monitorTypeMap.loading,
          }}
          disabled
        />
      </>
    );
  },
  { width: 400, title: '编辑预警任务' },
);
