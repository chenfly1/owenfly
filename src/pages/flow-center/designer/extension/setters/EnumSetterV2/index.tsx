/* eslint-disable react-hooks/rules-of-hooks */
import { GlobalRegistry } from '@designable/core';
import { Form } from 'antd';
import {
  ProColumns,
  ProForm,
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import EditableTable from './editableTable';
import { useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { useInitState } from '@/hooks/useInitState';
import { FlowSource } from '@/models/useFlow';
import { useModel } from 'umi';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    settings: {
      'x-custom-enum-v2': '选项内容',
    },
  },
});

export type OptionItem = { label: string; value: string };
type StaticFieldItem = { _id: string; _check: string[] } & OptionItem;
export interface Options extends OptionItem {
  children?: Options[];
}

export interface IEnumValue {
  valueType: 'static' | 'dynamic'; // 值类型
  staticField?: StaticFieldItem[]; // 静态资源字段
  staticDefault?: string[]; // 静态默认值
  dynamicSource?: string; // 动态资源
  dynamicField?: OptionItem[]; // 动态资源字段
  dynamicDefault?: string[]; // 动态默认值
}

export interface IEnumValueSetterProps {
  value?: IEnumValue;
  onChange?: (value: IEnumValue) => void;
}

enum ValueTypeEnum {
  static = 'static',
  dynamic = 'dynamic',
}

const ValueTypeOptions = [
  {
    label: '自定义',
    value: ValueTypeEnum.static,
  },
  {
    label: '关联已有数据',
    value: ValueTypeEnum.dynamic,
  },
];

export const getEnum = (config: IEnumValue) => {
  return (
    (config?.valueType === ValueTypeEnum.static ? config?.staticField : config?.dynamicField) ?? ''
  );
};

export const getDefault = (config: IEnumValue) => {
  return (
    (config?.valueType === ValueTypeEnum.static ? config?.staticDefault : config?.dynamicDefault) ??
    ''
  );
};

export const filterDefaultOptions = (options: Options[], defaultValues: string[]) => {
  const res: Options[] = [];
  if (!defaultValues?.length) return res;
  options.forEach(({ children, ...rest }) => {
    if (defaultValues.includes(rest.value)) {
      const item: Options = rest;
      if (children?.length) {
        item.children = filterDefaultOptions(children, defaultValues);
      }
      res.push(item);
    }
  });
  return res;
};

export const EnumSetterV2: React.FC<IEnumValueSetterProps> = (props) => {
  const [form] = Form.useForm();
  const { source } = useInitState<FlowSource>('useFlow', ['source']);
  const flowSource = useModel('useFlow');

  const getStaticInfo = (values?: StaticFieldItem[]) => {
    const checked: string[] = [];
    const labels: string[] = [];
    const list: StaticFieldItem[] = [];
    (values || []).forEach(({ _check, _id, label }) => {
      if (!labels.includes(label)) {
        labels.push(label);
        list.push({
          label,
          value: label,
          _check,
          _id,
        });
        if (_check?.length) checked.push(label);
      }
    });
    return {
      staticField: list,
      staticDefault: checked,
    };
  };

  const changeHandler = (values: IEnumValue) => {
    const { valueType, staticField, dynamicSource, dynamicDefault, ...rest } = values;
    let dynamicField: Options[] = [];
    if (valueType === ValueTypeEnum.dynamic && dynamicDefault) {
      const options = dynamicSource ? flowSource?.[dynamicSource]?.value ?? [] : [];
      dynamicField = filterDefaultOptions(options, dynamicDefault);
    }
    props.onChange?.({
      ...rest,
      ...getStaticInfo(staticField),
      valueType,
      dynamicSource,
      dynamicDefault,
      dynamicField,
    });
  };

  useEffect(() => {
    // 设置默认内容初始值
    if (
      props.value?.valueType === undefined ||
      (props.value?.valueType === ValueTypeEnum.static && !props.value?.staticField?.length)
    ) {
      const values = {
        valueType: ValueTypeEnum.static,
        staticField: [
          { _id: '1', _check: [], label: '选项1', value: 'options_1' },
          { _id: '2', _check: [], label: '选项2', value: 'options_2' },
        ],
      };
      form.setFieldsValue(values);
      changeHandler(values);
    } else {
      form.setFieldsValue(props.value);
    }
  }, []);

  const columns: ProColumns<StaticFieldItem>[] = [
    {
      title: '是否选择',
      key: '_check',
      width: 20,
      dataIndex: '_check',
      valueType: 'checkbox',
      valueEnum: { '1': ' ' },
    },
    {
      title: '选项内容',
      key: 'label',
      width: 150,
      dataIndex: 'label',
      valueType: 'text',
      fieldProps: {
        allowClear: false,
      },
    },
    {
      title: 'action',
      editable: false,
      width: 20,
      render: (_, row) => {
        return (
          <DeleteOutlined
            onClick={() => {
              const values = form.getFieldValue('staticField');
              form.setFieldValue(
                'staticField',
                values.filter((item: any) => item._id !== row._id),
              );
            }}
          />
        );
      },
    },
  ];

  return (
    <ProForm
      form={form}
      style={{ width: '100%' }}
      submitter={false}
      onValuesChange={(_, values) => {
        changeHandler(values);
      }}
    >
      <ProFormSelect
        formItemProps={{
          style: { margin: '5px 0 5px 38px', width: '165px' },
        }}
        name="valueType"
        options={ValueTypeOptions}
      />
      <ProFormItem noStyle shouldUpdate>
        {(formInstance: ProFormInstance) => {
          const valueType = formInstance.getFieldValue('valueType');
          if (valueType === ValueTypeEnum.static)
            return (
              <ProFormItem name="staticField">
                <EditableTable rowKey="_id" columns={columns} />
              </ProFormItem>
            );
          return null;
        }}
      </ProFormItem>
      <ProFormItem noStyle shouldUpdate>
        {(formInstance: ProFormInstance) => {
          const valueType = formInstance.getFieldValue('valueType');
          if (valueType === ValueTypeEnum.dynamic)
            return (
              <ProFormSelect
                name="dynamicSource"
                formItemProps={{
                  style: {
                    margin: '5px 0 5px 38px',
                    width: '165px',
                  },
                }}
                fieldProps={{
                  loading: source.loading,
                  options: [{ label: '人员列表', value: '__person__' }].concat(source.value || []),
                }}
              />
            );
          return null;
        }}
      </ProFormItem>
      <ProFormItem noStyle shouldUpdate>
        {(formInstance: ProFormInstance) => {
          const sourceField = formInstance.getFieldValue('dynamicSource');
          if (!sourceField) return null;
          if (!flowSource?.[sourceField]?.inited) {
            flowSource.updateState(sourceField, true, {
              typeCode: sourceField,
              tenantId: flowSource.flowState.tenantId,
            });
          }
          return (
            <ProFormSelect
              name="dynamicDefault"
              formItemProps={{
                style: {
                  margin: '5px 0 5px 38px',
                  width: '165px',
                },
              }}
              fieldProps={{
                mode: 'multiple',
                placeholder: '选择默认值',
                loading: flowSource?.[sourceField]?.loading,
                options: flowSource?.[sourceField]?.value || [],
              }}
            />
          );
          return null;
        }}
      </ProFormItem>
    </ProForm>
  );
};
