/* eslint-disable react-hooks/exhaustive-deps */
import { ProForm, ProFormInstance, ProFormItem, ProFormSelect } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useEffect } from 'react';
import Person, { PersonTypeEnum } from './person';
import { useModel } from 'umi';
import FormAccess, { getFields } from './formAccess';
import {
  createProperties,
  createProperty,
  extractOtherExtensionList,
  extractPropertiesExtension,
  updateElementExtensions,
} from '../../util/panelUtil';

const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str.toString();
  }
};

export enum NodeTypeEnum {
  fillIn = 'fillIn', // 填写节点
  approve = 'approve', // 审批节点
}

export enum ApproveTypeEnum {
  or = 'or', // 或签
  and = 'and', // 会签
}

export enum ApproveTypeExpression {
  or = '${nrOfCompletedInstances>=1}',
  and = '${nrOfCompletedInstances==nrOfInstances}',
}

export default ({ businessObject }: { businessObject: any }) => {
  const [form] = Form.useForm();
  const { formSchema, prefix } = useModel('useFlow', (model) => ({
    formSchema: model.flowState.processFormSchema,
    prefix: model.flowState.prefix,
  }));
  const userTask = businessObject?.$type === 'bpmn:UserTask';
  const startEvent = businessObject?.$type === 'bpmn:StartEvent';

  /**
   * 更新完成条件
   * @param value
   */
  function updateLoopCondition(value?: ApproveTypeEnum) {
    let completionCondition = null;
    if (value) {
      completionCondition = window.bpmnInstance.moddle.create('bpmn:FormalExpression', {
        body: ApproveTypeExpression[value],
      });
    }
    window.bpmnInstance.modeling.updateModdleProperties(
      window.bpmnInstance.element,
      window.bpmnInstance.element.businessObject.loopCharacteristics,
      {
        completionCondition,
      },
    );
  }

  /**
   * 更新集合与元素变量
   */
  function updateLoopBase(collection: string) {
    window.bpmnInstance.modeling.updateModdleProperties(
      window.bpmnInstance.element,
      window.bpmnInstance.element.businessObject.loopCharacteristics,
      {
        collection,
        elementVariable: 'user',
      },
    );
  }

  /** 获取默认权限配置值 */
  const getDefaultAccessValue = () => {
    const fields = getFields(formSchema?.schema);
    const access = startEvent ? 'editable' : 'readonly';
    return fields.map(({ field, title }) => {
      return {
        field,
        title,
        access,
      };
    });
  };

  const updateElement = (values: any) => {
    const properties = Object.keys(values).map((key) => {
      return createProperty(prefix, {
        name: key,
        value: typeof values[key] === 'object' ? JSON.stringify(values[key]) : values[key],
      });
    });
    updateElementExtensions(
      extractOtherExtensionList(prefix, 'Properties').concat([
        createProperties(prefix, {
          properties,
        }),
      ]),
    );
    if (values.nodeType) {
      if (values.executor?.type !== PersonTypeEnum.initiator) {
        const loopCharacteristicsObject = window.bpmnInstance.moddle.create(
          'bpmn:MultiInstanceLoopCharacteristics',
          { isSequential: 'false' },
        );
        window.bpmnInstance.modeling.updateProperties(window.bpmnInstance.element, {
          loopCharacteristics: loopCharacteristicsObject,
        });
        updateLoopCondition(values.approveType);
        updateLoopBase(
          values.executor?.type === 'input'
            ? `${values.executor?.field ?? ''}`
            : `${businessObject?.id ?? ''}`,
        );
        window.bpmnInstance.modeling.updateProperties(window.bpmnInstance.element, {
          assignee: '${user}',
          formFieldValidation: 'true',
        });
      } else {
        window.bpmnInstance.modeling.updateProperties(window.bpmnInstance.element, {
          assignee: '${initiator}',
          formFieldValidation: undefined,
        });
        window.bpmnInstance.modeling.updateProperties(window.bpmnInstance.element, {
          loopCharacteristics: undefined,
        });
      }
    }
  };

  useEffect(() => {
    if (businessObject) {
      const properties: any[] = extractPropertiesExtension(prefix);
      const values = properties.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.name]: safeParse(curr.value),
        }),
        {},
      );
      form.resetFields();
      if (!values.formAccess?.length) {
        values.formAccess = getDefaultAccessValue();
        updateElement(values);
      }
      form.setFieldsValue(values);
    }
  }, [businessObject?.id]);

  return (
    <>
      <ProForm
        layout="horizontal"
        form={form}
        grid={true}
        colon={false}
        submitter={false}
        onValuesChange={(_, values) => {
          updateElement(values);
        }}
      >
        {userTask ? (
          <ProFormSelect
            label="节点类型"
            name="nodeType"
            fieldProps={{
              allowClear: false,
              options: [
                {
                  label: '填写节点',
                  value: NodeTypeEnum.fillIn,
                },
                {
                  label: '审批节点',
                  value: NodeTypeEnum.approve,
                },
              ],
            }}
          />
        ) : null}
        <ProFormItem noStyle shouldUpdate>
          {(formInstance: ProFormInstance) => {
            const type = formInstance.getFieldValue('nodeType');
            if (type === NodeTypeEnum.approve && userTask)
              return (
                <ProFormSelect
                  label="审批类型"
                  name="approveType"
                  fieldProps={{
                    allowClear: false,
                    options: [
                      {
                        label: '会签',
                        value: ApproveTypeEnum.and,
                      },
                      {
                        label: '或签',
                        value: ApproveTypeEnum.or,
                      },
                    ],
                  }}
                />
              );
            return null;
          }}
        </ProFormItem>
        <ProFormItem noStyle shouldUpdate>
          {(formInstance: ProFormInstance) => {
            const type = formInstance.getFieldValue('nodeType');
            if (type && userTask)
              return (
                <ProFormItem
                  label="节点负责人"
                  style={{ width: '100%', padding: '0 4px' }}
                  name="executor"
                >
                  <Person schema={formSchema} />
                </ProFormItem>
              );
            return null;
          }}
        </ProFormItem>
        {formSchema ? (
          <ProFormItem label="表单权限" style={{ padding: '0 4px' }} name="formAccess">
            <FormAccess schema={formSchema} />
          </ProFormItem>
        ) : null}
      </ProForm>
    </>
  );
};
