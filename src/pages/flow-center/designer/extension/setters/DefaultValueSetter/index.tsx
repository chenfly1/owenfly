import { Field, FormPathPattern, LifeCycleTypes, createForm, onFieldReact } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { clone } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { Form, Input, Select } from '@formily/antd';
import { action } from '@formily/reactive';
import { getDicItems, getDicTypes } from '@/services/flow';

export interface IDefaultValue {
  valueType: 'static' | 'dynamic'; // 值类型
  staticValue?: string; // 静态默认值
  dynamicSource?: string; // 动态资源
  dynamicValue?: string[]; // 动态默认值
}

export interface IDefaultValueSetterProps {
  value?: IDefaultValue;
  onChange?: (value: IDefaultValue) => void;
}

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
  },
});

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

export const getDefaultValue = (config: IDefaultValue) => {
  return (
    (config.valueType === ValueTypeEnum.static ? config?.staticValue : config?.dynamicValue) ?? ''
  );
};

const getAsyncDataSource = (
  pattern: FormPathPattern,
  service: (field: Field) => Promise<{ label: string; value: any }[]>,
) => {
  onFieldReact(pattern, (field: any) => {
    field.loading = true;
    service(field).then(
      action.bound?.((data) => {
        field.dataSource = data;
        field.loading = false;
      }),
    );
  });
};

export const DefaultValueSetter: React.FC<IDefaultValueSetterProps> = (props) => {
  const cacheRef = useRef<any>({});
  const form = useMemo(() => {
    return createForm({
      values: clone(props.value),
      effects: () => {
        getAsyncDataSource('dynamicSource', async (field) => {
          try {
            const valueType = field.query('valueType').get('value');
            if (valueType !== ValueTypeEnum.dynamic) return [];
            if (cacheRef.current.source) return cacheRef.current.source;
            const res = await getDicTypes();
            cacheRef.current.source = res.map((item) => ({
              label: item.name,
              value: item.code,
            }));
            return cacheRef.current.source;
          } catch (err) {
            return [];
          }
        });
        getAsyncDataSource('dynamicValue', async (field) => {
          try {
            const source = field.query('dynamicSource').get('value');
            if (!source) return [];
            if (cacheRef.current?.[source]?.value) return cacheRef.current[source].value;
            if (cacheRef.current?.[source]?.request) return cacheRef.current?.[source]?.request;
            cacheRef.current[source] = {
              request: new Promise((resolve) => {
                getDicItems({ typeCode: source }).then((res) => {
                  const options = res.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }));
                  cacheRef.current[source] = {
                    request: undefined,
                    value: options,
                  };
                  resolve(options);
                });
              }),
            };
            return cacheRef.current[source].request;
          } catch (err) {
            return [];
          }
        });
      },
    });
  }, [props.value]);

  // 监听表单值变化
  form.subscribe(({ type, payload }) => {
    if (type === LifeCycleTypes.ON_FORM_VALUES_CHANGE) {
      props.onChange?.({
        ...payload.values,
      });
    }
  });

  useEffect(() => {
    // 设置默认内容初始值
    if (props.value?.valueType === undefined) {
      form.setFieldState('valueType', (state) => {
        state.value = ValueTypeEnum.static;
      });
    }
  }, []);

  return (
    <Form form={form}>
      <SchemaField>
        <SchemaField.String
          name="valueType"
          title="默认内容"
          required
          x-decorator="FormItem"
          x-component="Select"
          enum={ValueTypeOptions}
        />
        <SchemaField.String
          name="staticValue"
          x-decorator="FormItem"
          x-component="Input"
          x-component-props={{
            placeholder: '请输入默认内容',
          }}
          x-reactions={[
            {
              dependencies: ['.valueType#value'],
              fulfill: {
                state: {
                  hidden: `{{$deps[0] !== "${ValueTypeEnum.static}"}}`,
                },
              },
            },
          ]}
        />
        <SchemaField.Void
          x-reactions={[
            {
              dependencies: ['.valueType#value'],
              fulfill: {
                state: {
                  hidden: `{{$deps[0] !== "${ValueTypeEnum.dynamic}"}}`,
                },
              },
            },
          ]}
        >
          <SchemaField.String
            name="dynamicSource"
            x-decorator="FormItem"
            x-component="Select"
            x-component-props={{
              placeholder: '请选择关联应用',
              onChange: () => {
                form.setValuesIn('dynamicField', undefined);
              },
            }}
          />
          <SchemaField.String name="dynamicValue" x-decorator="FormItem" x-component="Select" />
        </SchemaField.Void>
      </SchemaField>
    </Form>
  );
};
