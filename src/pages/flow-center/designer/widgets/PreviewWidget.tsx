/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import { Form as FormProps, createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  DatePicker,
  Checkbox,
  Cascader,
  Editable,
  Input,
  NumberPicker,
  Switch,
  Password,
  PreviewText,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  FormGrid,
  FormLayout,
  FormTab,
  FormCollapse,
  ArrayTable,
  ArrayCards,
} from '@formily/antd';
import { Card, Slider, Rate } from 'antd';
import { TreeNode } from '@designable/core';
import { transformToSchema, IFormilySchema } from '@designable/formily-transformer';
import { patchSchema } from '../extension/shared';

const Text: React.FC<{
  value?: string;
  content?: string;
  mode?: 'normal' | 'h1' | 'h2' | 'h3' | 'p';
}> = ({ value, mode, content, ...props }) => {
  const tagName = mode === 'normal' || !mode ? 'div' : mode;
  return React.createElement(tagName, props, value || content);
};

const SchemaField = createSchemaField({
  components: {
    Space,
    FormGrid,
    FormLayout,
    FormTab,
    FormCollapse,
    ArrayTable,
    ArrayCards,
    FormItem,
    DatePicker,
    Checkbox,
    Cascader,
    Editable,
    Input,
    Text,
    NumberPicker,
    Switch,
    Password,
    PreviewText,
    Radio,
    Reset,
    Select,
    Submit,
    TimePicker,
    Transfer,
    TreeSelect,
    Upload,
    Card,
    Slider,
    Rate,
  },
});

export interface IPreviewWidgetProps {
  tree?: TreeNode;
  schema?: IFormilySchema;
  getForm?: (form: FormProps) => void;
}

export const PreviewWidget: React.FC<IPreviewWidgetProps> = (props) => {
  const form = useMemo(() => {
    const res = createForm();
    props.getForm?.(res);
    return res;
  }, [props.schema, props.tree]);
  const { form: formProps, schema } = props.schema || transformToSchema(props.tree!);
  const newSchema = schema ? patchSchema(schema) : schema;
  return (
    <Form {...formProps} form={form}>
      <SchemaField schema={newSchema} />
    </Form>
  );
};
