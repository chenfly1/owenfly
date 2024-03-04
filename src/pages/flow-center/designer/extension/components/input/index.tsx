import React from 'react';
import { Input as FormilyInput } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { createFieldSchema } from '../../shared';
import { fieldPropertyWithDefault } from '../config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';

export const Input: DnFC<React.ComponentProps<typeof FormilyInput>> = FormilyInput;

Input.Behavior = createBehavior(
  {
    name: 'Input',
    extends: ['Field'],
    selector: (node: any) => node.props['x-component'] === 'Input',
    designerProps: {
      propsSchema: createFieldSchema(fieldPropertyWithDefault)(AllSchemas.Input),
    },
    designerLocales: AllLocales.Input,
  },
  {
    name: 'Input.TextArea',
    extends: ['Field'],
    selector: (node: any) => node.props['x-component'] === 'Input.TextArea',
    designerProps: {
      propsSchema: createFieldSchema(fieldPropertyWithDefault)(AllSchemas.Input.TextArea),
    },
    designerLocales: AllLocales.TextArea,
  },
);

Input.Resource = createResource(
  {
    icon: 'InputSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          type: 'string',
          title: 'Input',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
        },
      },
    ],
  },
  {
    icon: 'TextAreaSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          type: 'string',
          title: 'TextArea',
          'x-decorator': 'FormItem',
          'x-component': 'Input.TextArea',
        },
      },
    ],
  },
);
