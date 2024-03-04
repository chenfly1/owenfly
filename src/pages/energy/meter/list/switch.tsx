/* eslint-disable @typescript-eslint/no-shadow */
import { useEffect, useState } from 'react';
import { Form, Spin } from 'antd';
import { FormInstance } from 'antd/es/form';
import { ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';
import { getMeterList, getMeterRecord, getTotalPageSource } from '@/services/energy';
import { debounce, isUndefined } from 'lodash';
import { meterTypeEnum } from '../../config';
import Style from './index.less';
import { LoadingOutlined } from '@ant-design/icons';

export enum switchTypeEnum {
  position = 0,
  meter = 1,
}

export interface SwitchFormProps {
  base: Partial<MeterItemType>;
  target: Partial<MeterItemType & { initRecord?: number }>;
  exchangeType: switchTypeEnum;
}

const meterUnit = (type: number) => {
  return type === meterTypeEnum.electric ? 'kW·h' : 'm³';
};

enum FormType {
  base = 'base',
  target = 'target',
}

const SwitchForm = ({
  form,
  visible,
  source,
}: {
  form: FormInstance;
  visible: boolean;
  source?: SwitchFormProps;
}) => {
  const [record, setRecord] = useState<{ loading: boolean; disabled: boolean }>({
    loading: false,
    disabled: true,
  });
  const [meterMap, setMeterMap] = useState<{
    base: Record<string, Partial<MeterItemType>>;
    target: Record<string, Partial<MeterItemType> & { initRecord?: number }>;
  }>({
    base: {},
    target: {},
  });

  const changeMeter = (value: string, type: FormType) => {
    if (type === FormType.target) {
      // 获取初始值
      setRecord({ loading: true, disabled: true });
      getMeterRecord(value)
        .then((res) => {
          form.setFieldValue([FormType.target, 'initRecord'], res);
          setRecord({ loading: false, disabled: !isUndefined(res) });
        })
        .catch(() => {
          form.setFieldValue([FormType.target, 'initRecord'], undefined);
          setRecord({ loading: false, disabled: true });
        });
    }
    const values = meterMap[type][value];
    form.setFieldsValue({
      [type]: {
        cnName: values.cnName,
        meterSpaceFullName: values.meterSpaceFullName,
        installationSpaceName: values.installationSpaceName,
      },
    });
  };

  const search = (key: string, type: FormType) => {
    if (key) {
      const { insType } = form.getFieldValue('base');
      getTotalPageSource(getMeterList, {
        syncId: key,
        pageNo: 0,
        pageSize: 999,
        insType: type === FormType.target ? insType : undefined,
      }).then((res) => {
        setMeterMap((prevState) => ({
          ...prevState,
          [type]: res.items.reduce((prev, curr) => ({ ...prev, [curr.syncId]: curr }), {}),
        }));
      });
    }
  };

  useEffect(() => {
    if (visible) {
      setRecord({ loading: false, disabled: true });
      setMeterMap({
        base: source?.base?.syncId
          ? {
              [source.base.syncId]: source?.base,
            }
          : {},
        target: {},
      });
    }
  }, [visible]);

  return (
    <>
      <h3 className={Style.meter_switch_title}>仪表1信息</h3>
      <ProFormText name={[FormType.base, 'id']} hidden />
      <ProFormText name={[FormType.base, 'insType']} hidden />
      <ProFormSelect
        label="仪表1编号"
        name={[FormType.base, 'syncId']}
        fieldProps={{
          allowClear: false,
          showSearch: true,
          placeholder: '请输入关键字搜索',
          onSearch: debounce((key) => search(key, FormType.base), 300),
          options: Object.keys(meterMap.base).map((value) => ({ label: value, value })),
          onChange(value: string) {
            changeMeter(value, FormType.base);
          },
        }}
      />
      <ProFormText label="仪表1名称" name={[FormType.base, 'cnName']} disabled />
      <ProFormText label="计量位置" name={[FormType.base, 'meterSpaceFullName']} disabled />
      <ProFormText name={[FormType.base, 'installationSpaceName']} label="安装位置" disabled />
      <h3 className={Style.meter_switch_title}>仪表2信息</h3>
      <ProFormRadio.Group
        radioType="button"
        name="exchangeType"
        label="更换类型"
        fieldProps={{ buttonStyle: 'solid' }}
        options={[
          {
            label: '位置互换',
            value: switchTypeEnum.position,
          },
          {
            label: '新表替换',
            value: switchTypeEnum.meter,
          },
        ]}
      />
      <ProFormSelect
        label="仪表2编号"
        name={[FormType.target, 'syncId']}
        fieldProps={{
          showSearch: true,
          placeholder: '请输入关键字搜索',
          onSearch: debounce((key) => search(key, FormType.target), 300),
          options: Object.keys(meterMap.target).map((value) => ({ label: value, value })),
          onChange(value: string) {
            changeMeter(value, FormType.target);
          },
        }}
      />
      <ProFormText label="仪表2名称" name={[FormType.target, 'cnName']} disabled />
      <ProFormText label="计量位置" name={[FormType.target, 'meterSpaceFullName']} disabled />
      <ProFormText label="安装位置" name={[FormType.target, 'installationSpaceName']} disabled />
      <Form.Item noStyle shouldUpdate>
        {(form) => {
          const { exchangeType, base } = form.getFieldsValue(['exchangeType', 'base', 'target']);
          if (exchangeType === switchTypeEnum.position) return;
          return (
            <ProFormText
              label="初始值"
              disabled={record.disabled}
              name={[FormType.target, 'initRecord']}
              fieldProps={{
                addonAfter: record.loading ? (
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                ) : (
                  meterUnit(base?.insType)
                ),
              }}
            />
          );
        }}
      </Form.Item>
    </>
  );
};

export default DrawerForm<SwitchFormProps>(SwitchForm, {
  title: '换表',
  destroyOnClose: true,
});
