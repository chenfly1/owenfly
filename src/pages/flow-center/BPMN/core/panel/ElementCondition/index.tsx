/* eslint-disable react-hooks/exhaustive-deps */
import {
  FormListActionType,
  ProForm,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import Style from './index.less';
import { Button, Form } from 'antd';
import { useModel } from 'umi';
import {
  createProperties,
  createProperty,
  extractOtherExtensionList,
  extractPropertiesExtension,
  updateElementExtensions,
} from '../../util/panelUtil';

const OperatorEnum = {
  '==': '等于',
  '>': '大于',
  '<': '小于',
  '>=': '大于等于',
  '<=': '小于等于',
  '!=': '不等于',
};

const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str.toString();
  }
};

const getFields = (schema: any, level = 0) => {
  let res: any[] = [];
  if (schema?.properties) {
    const properties = Object.values(schema.properties);
    properties.forEach((property: any) => {
      const index = Number(`${level}${property['x-index']}`);
      if (!['void', 'array'].includes(property.type)) {
        res.push({
          ...property,
          'x-designable-id': property.name || property['x-designable-id'],
        });
      }
      if (property?.items?.properties) {
        res = res.concat(getFields(property?.items, index));
      } else if (property.properties) {
        res = res.concat(getFields(property, index));
      }
    });
  }
  return res.sort((prev, curr) => prev.index - curr.index);
};

export default ({ businessObject }: { businessObject: any }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [form] = Form.useForm();
  const { formSchema, prefix } = useModel('useFlow', (model) => ({
    formSchema: model.flowState.processFormSchema,
    prefix: model.flowState.prefix,
    getSource: model.getSource,
  }));

  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  const groupActionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  useEffect(() => {
    if (businessObject) {
      const properties: any[] = extractPropertiesExtension(prefix);
      const values = properties.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.name]: curr.value ? safeParse(curr.value) : {},
        }),
        {},
      );
      form.resetFields();
      form.setFieldsValue(values.values);
    }
  }, [businessObject?.id]);

  useEffect(() => {
    setFields(getFields(formSchema?.schema || {}));
  }, [formSchema]);

  const transformToExpression = (values: any) => {
    const orConditions = values.or || [];
    const str = orConditions
      .map((orItem: any) => {
        const and = (orItem?.and || [])
          .filter((item: any) => item?.field && item?.operator && item?.value)
          .map((item: any) => {
            return `${item?.field} ${item?.operator} "${item?.value}"`;
          })
          .join(' && ');
        return and ? `(${and})` : '';
      })
      .filter((item: any) => item)
      .join(' || ');
    return str ? '${' + str + '}' : '';
  };

  return (
    <ProForm
      layout="inline"
      form={form}
      submitter={false}
      className={Style.condition}
      onValuesChange={(_, values) => {
        const condition = window.bpmnInstance.moddle.create('bpmn:FormalExpression', {
          body: transformToExpression(values),
        });
        const element = window.bpmnInstance.element;
        window.bpmnInstance.modeling.updateProperties(element, {
          conditionExpression: condition,
        });
        updateElementExtensions(
          extractOtherExtensionList(prefix, 'Properties').concat([
            createProperties(prefix, {
              properties: [
                createProperty(prefix, {
                  name: 'values',
                  value: JSON.stringify(values),
                }),
              ],
            }),
          ]),
        );
      }}
    >
      <ProFormList
        name="or"
        initialValue={[{}]}
        min={1}
        copyIconProps={false}
        itemRender={({ listDom }, listMeta) => {
          return (
            <div className={Style.condition_or_container}>
              {listDom}
              <Button
                type="dashed"
                hidden={form?.getFieldValue('or')?.length < 2}
                danger
                className={Style.condition_or_remove}
                onClick={() => {
                  actionRef.current?.remove(listMeta.index);
                }}
              >
                移除
              </Button>
            </div>
          );
        }}
        actionRef={actionRef}
        creatorButtonProps={{
          creatorButtonText: '或条件',
        }}
        containerClassName="condition_and"
      >
        <ProFormList
          name="and"
          actionRef={groupActionRef}
          min={1}
          initialValue={[{}]}
          copyIconProps={false}
          creatorRecord={{}}
          creatorButtonProps={{
            creatorButtonText: '且条件',
          }}
          containerClassName="condition_or"
        >
          <ProFormGroup
            key="group"
            style={{
              flexWrap: 'nowrap',
            }}
          >
            <ProFormSelect
              key="field"
              name="field"
              style={{ width: '100px' }}
              placeholder="请选择表单字段"
              fieldProps={{
                options: fields.map((item) => ({
                  label: item.title,
                  value: item['x-designable-id'],
                })),
              }}
            />
            <ProFormSelect
              key="operator"
              valueEnum={OperatorEnum}
              initialValue={'=='}
              style={{ width: '90px' }}
              name="operator"
              placeholder="判断条件"
            />
            <ProFormDependency name={['field']}>
              {({ field }) => {
                const match = fields.find((item) => item['x-designable-id'] === field) || {};
                const options = match['x-custom-enum-v2'] || match['x-custom-enum'];
                if (options?.valueType) {
                  const { valueType, staticField, staticValue, dynamicField } = options;
                  // 兼容逻辑
                  const staticOptions = staticValue || staticField;
                  return (
                    <ProFormSelect
                      key="value"
                      name="value"
                      style={{ width: '100px' }}
                      fieldProps={{
                        options: (
                          (valueType === 'static' ? staticOptions : dynamicField) || []
                        ).map(({ label, value }: any) => ({
                          label,
                          value,
                        })),
                      }}
                      placeholder={'请选择'}
                    />
                  );
                }
                return (
                  <ProFormText
                    style={{ width: '100px' }}
                    key="value"
                    name="value"
                    placeholder="请输入"
                  />
                );
              }}
            </ProFormDependency>
          </ProFormGroup>
        </ProFormList>
      </ProFormList>
    </ProForm>
  );
};
