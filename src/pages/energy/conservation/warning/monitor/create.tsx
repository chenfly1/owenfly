import DrawerForm from '@/components/DrawerForm';
import { monitorTypeEnum } from '@/pages/energy/config';
import { useInitState } from '@/hooks/useInitState';
import {
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { EnergyState } from '@/models/useEnergy';
import { useState } from 'react';
import { isUndefined } from 'lodash';
import { getTotoalSource } from '@/services/energy';

export interface CreateFormProps {
  pointType?: string;
  relIds?: string[];
  insType?: number;
}

export default DrawerForm(
  ({ source }: { source?: CreateFormProps }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState({});
    const { measureTree, monitorPointTypeMap } = useInitState<EnergyState>('useEnergy', [
      'measureTree',
      'monitorPointTypeMap',
    ]);

    return (
      <>
        <ProFormRadio.Group
          radioType="button"
          name="pointType"
          label="监测点类型"
          required={true}
          disabled={!!source?.pointType}
          valueEnum={monitorPointTypeMap.value}
          help="提示：选定类型进行保存后，则无法修改监测类型"
          fieldProps={{
            optionType: 'button',
            buttonStyle: 'solid',
          }}
        />
        <ProFormItem noStyle shouldUpdate>
          {(form) => {
            const type = Number(form.getFieldValue('pointType'));
            if (type === monitorTypeEnum.measure)
              return (
                <ProFormTreeSelect
                  name="relIds"
                  label="关联监测点"
                  fieldProps={{
                    treeData: measureTree.value,
                    multiple: true,
                    fieldNames: {
                      value: 'key',
                      label: 'title',
                    },
                  }}
                />
              );
            if (type === monitorTypeEnum.category) {
              const insType = source?.insType;
              if (!loading && !isUndefined(insType) && !categories?.[insType]) {
                setLoading(true);
                getTotoalSource('TAG', { param: { insType: Number(insType) } })
                  .then((res) => {
                    setCategories((prev) => ({ ...prev, [insType]: res }));
                  })
                  .finally(() => setLoading(false));
              }
              return (
                <ProFormSelect
                  name="relIds"
                  label="关联监测点"
                  valueEnum={insType !== undefined ? categories[insType] : []}
                  fieldProps={{
                    loading,
                    mode: 'multiple',
                  }}
                />
              );
            }

            return null;
          }}
        </ProFormItem>
      </>
    );
  },
  {
    title: '添加监测点',
    labelCol: { flex: '110px' },
  },
);
