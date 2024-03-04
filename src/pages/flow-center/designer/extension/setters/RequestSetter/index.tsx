import { Button, Modal } from 'antd';
import { TextWidget } from '@designable/react';
import { GlobalRegistry } from '@designable/core';
import { Form, FormItem, Input, Select, FormCollapse, Radio } from '@formily/antd';
import { MonacoInput } from '@designable/react-settings-form';
import { useMemo, useState } from 'react';
import { createForm } from '@formily/core';
import { clone } from 'lodash';
import { createSchemaField } from '@formily/react';

export interface IRequestValue {
  method: string;
  url: string;
  headers: string;
  params: string;
  body: string;
  successHandler: string;
  errorHandler: string;
}

export interface IRequestSetterProps {
  value?: IRequestValue;
  onChange?: (value: IRequestValue) => void;
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEADER'];
const methodEnum = methods.map((method) => ({ label: method, value: method }));

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    SettingComponents: {
      RequestSetter: {
        configureRequest: '配置请求数据',
      },
    },
  },
});

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    FormItem,
    MonacoInput,
    FormCollapse,
    Radio,
  },
});

export const RequestSetter: React.FC<IRequestSetterProps> = (props) => {
  const [visible, setVisible] = useState(false);
  const form = useMemo(() => {
    return createForm({
      values: clone(props.value),
    });
  }, [visible, props.value]);
  return (
    <>
      <Button
        block
        onClick={() => {
          setVisible(true);
        }}
      >
        <TextWidget token="SettingComponents.RequestSetter.configureRequest" />
      </Button>
      <Modal
        title={GlobalRegistry.getDesignerMessage(
          'SettingComponents.RequestSetter.configureRequest',
        )}
        width="300"
        centered
        bodyStyle={{ padding: 10 }}
        transitionName=""
        maskTransitionName=""
        visible={visible}
        onCancel={() => setVisible(false)}
        destroyOnClose
        onOk={() => {
          form.submit((values) => {
            props.onChange?.(values);
          });
          setVisible(false);
        }}
      >
        <Form form={form}>
          <SchemaField>
            <SchemaField.String
              name="method"
              title="请求方法"
              required
              x-decorator="FormItem"
              x-component="Radio.Group"
              enum={methodEnum}
              x-validator={{
                required: true,
              }}
            />
            <SchemaField.String
              name="url"
              title="请求路径"
              required
              x-decorator="FormItem"
              x-component="Input"
              x-validator={{
                required: true,
              }}
            />
            <SchemaField.String
              name="headers"
              title="请求头信息"
              required
              x-decorator="FormItem"
              x-component="Input"
              x-validator={{
                required: true,
              }}
            />
            <SchemaField.String
              name="response"
              title="响应信息"
              x-component="MonacoInput"
              x-component-props={{
                width: '100%',
                height: 400,
                language: 'typescript',
                options: {
                  minimap: {
                    enabled: false,
                  },
                },
              }}
            />
          </SchemaField>
        </Form>
      </Modal>
    </>
  );
};
