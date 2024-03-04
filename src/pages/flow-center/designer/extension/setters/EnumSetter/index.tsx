/* eslint-disable react-hooks/rules-of-hooks */
import { Field, FormPathPattern, LifeCycleTypes, createForm, onFieldReact } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { clone } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { Form, Input, Select, Cascader } from '@formily/antd';
import { GlobalRegistry } from '@designable/core';
import { DataSourceSetter } from '../DataSourceSetter';
import { getDicItems, getDicTypes, getMemberList } from '@/services/flow';
import { action } from '@formily/reactive';
import { Options, filterDefaultOptions } from '../EnumSetterV2';
import { useModel } from 'umi';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    settings: {
      'x-custom-enum': '选项内容',
    },
  },
});

export interface IEnumValue {
  valueType: 'static' | 'dynamic'; // 值类型
  staticField?: { label: string; value: string }[]; // 静态资源字段
  staticDefault?: string[]; // 静态默认值
  dynamicSource?: string; // 动态资源
  dynamicField?: Options[]; // 动态资源字段
  dynamicDefault?: string[]; // 动态默认值
}

export interface IEnumValueSetterProps {
  value?: IEnumValue;
  onChange?: (value: IEnumValue) => void;
}

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    Cascader,
    DataSourceSetter,
  },
});

export enum ValueTypeEnum {
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

// 生产选项数据
export const transformData = (data: any[]): any[] => {
  return data.map(({ code, name, children }) => {
    return {
      label: name,
      value: code,
      children: children ? transformData(children) : undefined,
    };
  });
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

export const EnumSetter: React.FC<IEnumValueSetterProps> = (props) => {
  const cacheRef = useRef<any>({});
  const flowSource = useModel('useFlow');
  const updateValues = (values: any) => {
    const { dynamicSource, valueType, dynamicDefault } = values;
    let dynamicField: Options[] = [];
    if (valueType === ValueTypeEnum.dynamic && dynamicDefault) {
      const options = cacheRef.current[dynamicSource]?.value ?? [];
      dynamicField = filterDefaultOptions(options, dynamicDefault);
    }
    props.onChange?.({
      ...values,
      dynamicField,
    });
  };

  const updateDynamicField = (values: any) => {
    if (!values.dynamicField) {
      updateValues(values);
    }
  };

  const form = useMemo(() => {
    return createForm({
      values: clone(props.value),
      effects: () => {
        getAsyncDataSource('dynamicSource', async (field) => {
          try {
            const valueType = field.query('valueType').get('value');
            if (valueType !== ValueTypeEnum.dynamic) return [];
            if (cacheRef.current.source) return cacheRef.current.source;
            const res = await getDicTypes({
              tenantId: flowSource.flowState.tenantId,
            });
            // 补充审批人员列表
            cacheRef.current.source = [{ label: '人员列表', value: '__person__' }].concat(
              res.map((item) => ({
                label: item.name,
                value: item.code,
              })),
            );
            return cacheRef.current.source;
          } catch (err) {
            return [];
          }
        });
        getAsyncDataSource('dynamicDefault', async (field) => {
          try {
            const source = field.query('dynamicSource').get('value');
            if (!source) return [];
            if (cacheRef.current?.[source]?.value) {
              updateDynamicField(form.values);
              return cacheRef.current[source].value;
            }
            if (cacheRef.current?.[source]?.request) return cacheRef.current?.[source]?.request;
            cacheRef.current[source] = {
              request: new Promise((resolve) => {
                if (source === '__person__') {
                  getMemberList({
                    tenantId: flowSource.flowState.tenantId,
                  }).then((res) => {
                    const options = transformData(res);
                    cacheRef.current[source] = {
                      request: undefined,
                      value: options,
                    };
                    updateDynamicField(form.values);
                    resolve(options);
                  });
                } else {
                  getDicItems({ typeCode: source, tenantId: flowSource.flowState.tenantId }).then(
                    (res) => {
                      const options = transformData(res);
                      cacheRef.current[source] = {
                        request: undefined,
                        value: options,
                      };
                      updateDynamicField(form.values);
                      resolve(options);
                    },
                  );
                }
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
      updateValues(payload.values);
    }
  });

  useEffect(() => {
    // 设置默认内容初始值
    if (
      props.value?.valueType === undefined ||
      (props.value?.valueType === ValueTypeEnum.static && !props.value?.staticField?.length)
    ) {
      const values = {
        valueType: ValueTypeEnum.static,
        staticField: [
          { label: '选项1', value: 'options_1' },
          { label: '选项2', value: 'options_2' },
        ],
      };
      form.setValues(values);
      props.onChange?.(values);
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
          x-component-props={{
            style: {
              margin: '5px 0',
            },
          }}
        />
        <SchemaField.String
          name="staticField"
          x-component={DataSourceSetter}
          x-component-props={{
            style: {
              margin: '5px 0',
            },
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
        <SchemaField.String
          name="staticDefault"
          x-decorator="FormItem"
          x-component="Cascader"
          x-component-props={{
            style: {
              maxWidth: '165px!important',
            },
            placeholder: '选择默认值',
          }}
          x-reactions={[
            {
              dependencies: ['.valueType#value', '.staticField#value'],
              fulfill: {
                state: {
                  hidden: `{{$deps[0] !== "${ValueTypeEnum.static}"}}`,
                  dataSource: `{{$deps[1]}}`,
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
                form.setValuesIn('dynamicDefault', undefined);
              },
            }}
          />
          <SchemaField.String
            name="dynamicDefault"
            x-decorator="FormItem"
            x-component="Cascader"
            x-component-props={{
              style: {
                maxWidth: '165px!important',
              },
              placeholder: '选择默认值',
            }}
          />
        </SchemaField.Void>
      </SchemaField>
    </Form>
  );
};
