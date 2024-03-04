import {
  ProFormItem,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import ModalForm from '@/components/ModalForm';
import { getTotoalSource } from '@/services/energy';
import { useState } from 'react';
import { isUndefined } from 'lodash';

export type CategorizMeterFormProps = {
  idList: string[];
  syncIdList: string[];
} & Partial<Pick<MeterItemType, 'insTagId' | 'insType'>>;

export default ModalForm<CategorizMeterFormProps>(
  (props) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState({});
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
        <ProFormItem noStyle shouldUpdate>
          {() => {
            const type = props.source?.insType;
            if (!loading && !isUndefined(type) && !categories?.[type]) {
              setLoading(true);
              getTotoalSource('TAG', { param: { insType: Number(type) } })
                .then((res) => {
                  setCategories((prev) => ({ ...prev, [type]: res }));
                })
                .finally(() => setLoading(false));
            }
            return (
              <ProFormSelect
                name="insTagId"
                label="能耗分项"
                valueEnum={type !== undefined ? categories?.[type] : {}}
                fieldProps={{
                  loading,
                }}
              />
            );
          }}
        </ProFormItem>
      </>
    );
  },
  {
    width: 500,
    title: '关联能耗分项',
  },
);
