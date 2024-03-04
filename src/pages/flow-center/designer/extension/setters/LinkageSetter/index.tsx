import { Form as FormType, createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { clone } from 'lodash';
import { useMemo, useState } from 'react';
import { GlobalRegistry } from '@designable/core';
import { Button, Modal } from 'antd';
import { Form, ArrayTable, Input, Select, FormItem } from '@formily/antd';
import { PathSelector } from './pathSelector';
import { useCurrentNode } from '@designable/react';
import { ValueTypeEnum, transformData } from '../EnumSetter';
import { IEnumValue } from '../EnumSetterV2';
import { getDicItems, getMemberList } from '@/services/flow';
import { Options } from 'ahooks/lib/useExternal';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    settings: {
      'x-custom-linkage': '逻辑表单',
    },
  },
});

export type ILinkageValue = {
  enum: { value: any; display: string[] }[];
};

export interface ILinkageSetterProps {
  onChange: (value: ILinkageValue) => void;
  value: ILinkageValue;
  effects?: (form: FormType<any>) => void;
}

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    FormItem,
    ArrayTable,
    PathSelector,
  },
});

export const LinkageSetter: React.FC<ILinkageSetterProps> = (props) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<Options[]>([]);
  const currNodeEnum: IEnumValue = useCurrentNode().props?.['x-custom-enum-v2'];
  const form = useMemo(() => {
    const instance = createForm({
      values: clone(props.value),
    });
    instance.setFieldState('enum', async (state) => {
      let list: any = currNodeEnum.staticField;
      if (currNodeEnum.valueType === ValueTypeEnum.dynamic && currNodeEnum.dynamicSource) {
        const res =
          currNodeEnum.dynamicSource === '__person__'
            ? await getMemberList()
            : await getDicItems({ typeCode: currNodeEnum.dynamicSource });
        list = transformData(res);
      }
      setOptions(list);
      state.value = (list || []).map(({ value }: any) => {
        const match = state.value.find((item: any) => item.value === value);
        return {
          value: match?.value ?? value,
          display: match?.display ?? [],
        };
      });
    });
    return instance;
  }, [visible, props.value]);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <>
      <Button block onClick={open}>
        点击配置
      </Button>
      <Modal
        title="添加逻辑表单规则"
        width="600"
        centered
        bodyStyle={{ padding: 10 }}
        transitionName=""
        maskTransitionName=""
        visible={visible}
        onCancel={close}
        destroyOnClose
        onOk={() => {
          form.submit((values) => {
            props.onChange?.(values);
          });
          close();
        }}
      >
        <Form form={form}>
          <SchemaField>
            <SchemaField.Array name="enum" x-component="ArrayTable">
              <SchemaField.Object>
                <SchemaField.Void
                  x-component="ArrayTable.Column"
                  x-component-props={{
                    title: '选项内容',
                    width: 200,
                  }}
                >
                  <SchemaField.String
                    name="value"
                    x-decorator="FormItem"
                    x-component="Select"
                    x-pattern="readPretty"
                    enum={options}
                  />
                </SchemaField.Void>
                <SchemaField.Void
                  x-component="ArrayTable.Column"
                  x-component-props={{
                    title: '显示字段',
                    width: 400,
                  }}
                >
                  <SchemaField.String
                    name="display"
                    x-decorator="FormItem"
                    x-component="PathSelector"
                    x-component-props={{
                      multiple: true,
                      placeholder: GlobalRegistry.getDesignerMessage(
                        'SettingComponents.ReactionsSetter.pleaseSelect',
                      ),
                    }}
                  />
                </SchemaField.Void>
              </SchemaField.Object>
            </SchemaField.Array>
          </SchemaField>
        </Form>
      </Modal>
    </>
  );
};
