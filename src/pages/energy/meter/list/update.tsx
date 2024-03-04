import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';
import ModelForm from '@/components/ModalForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';

/** 更新仪表信息表单 */
export type UpdateMeterFormProps = Partial<
  Pick<
    MeterItemType,
    'id' | 'syncId' | 'cnName' | 'syncAddress' | 'meterSpaceId' | 'installationSpaceName'
  >
> & { publicType?: string };

export default DrawerForm<UpdateMeterFormProps>(
  () => {
    const { measureTree, publicTypeMap } = useInitState<EnergyState>('useEnergy', [
      'measureTree',
      'publicTypeMap',
    ]);
    return (
      <>
        <ProFormText name="id" hidden />
        <ProFormText name="syncId" label="仪表编号" disabled />
        <ProFormText name="cnName" label="仪表名称" rules={[{ required: true }]} />
        <ProFormText name="syncAddress" label="仪表地址" disabled />
        <ProFormSelect
          name="publicType"
          label="公区类型"
          valueEnum={publicTypeMap.value}
          rules={[{ required: true }]}
          fieldProps={{
            allowClear: false,
            loading: publicTypeMap.loading,
          }}
        />
        <ProFormTreeSelect
          name="meterSpaceId"
          label="计量位置"
          rules={[{ required: true }]}
          fieldProps={{
            treeData: measureTree.value,
            loading: measureTree.loading,
            fieldNames: {
              label: 'title',
              value: 'key',
            },
          }}
        />
        <ProFormText name="installationSpaceName" label="安装位置" disabled />
      </>
    );
  },
  {
    title: '仪表编辑',
  },
);

/** 更新公区类型表单 */
export type PublicMeterFormProps = {
  idList: string[];
  syncIdList: string[];
} & Partial<Pick<MeterItemType, 'publicType'>>;

export const PublicMeter = ModelForm<PublicMeterFormProps>(
  () => {
    const { publicTypeMap } = useInitState<EnergyState>('useEnergy', ['publicTypeMap']);
    return (
      <>
        <ProFormText name="idList" hidden />
        <ProFormTextArea
          name="syncIdList"
          label="仪表编号"
          disabled
          fieldProps={{
            autoSize: { minRows: 1, maxRows: 6 },
          }}
        />
        <ProFormSelect
          name="publicType"
          label="公区类型"
          valueEnum={publicTypeMap.value}
          fieldProps={{
            loading: publicTypeMap.loading,
          }}
          rules={[{ required: true }]}
        />
      </>
    );
  },
  {
    title: '关联公区类型',
    width: 500,
  },
);

/** 更新计量位置表单 */
export type MeasureMeterFormProps = {
  idList: string[];
  syncIdList: string[];
} & Partial<Pick<MeterItemType, 'meterSpaceId'>>;

export const MeasureMeter = ModelForm<MeasureMeterFormProps>(
  () => {
    const { measureTree } = useInitState('useEnergy', ['measureTree']);
    return (
      <>
        <ProFormText name="idList" hidden />
        <ProFormTextArea
          name="syncIdList"
          label="仪表编号"
          disabled
          fieldProps={{
            autoSize: { minRows: 1, maxRows: 6 },
          }}
        />
        <ProFormTreeSelect
          name="meterSpaceId"
          label="计量位置"
          fieldProps={{
            treeData: measureTree.value,
            loading: measureTree.loading,
            fieldNames: {
              value: 'key',
              label: 'title',
            },
          }}
          rules={[{ required: true }]}
        />
      </>
    );
  },
  {
    title: '关联计量位置',
    width: 500,
  },
);
