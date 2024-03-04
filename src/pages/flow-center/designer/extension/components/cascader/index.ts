import React from 'react';
import { Cascader as FormilyCascader } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { createFieldSchema } from '../../shared';
import { fieldPropertyWithEnum } from '../config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';

export const Cascader: DnFC<React.ComponentProps<typeof FormilyCascader>> = FormilyCascader;

Cascader.Behavior = createBehavior({
  name: 'Cascader',
  extends: ['Field'],
  selector: (node: any) => node.props['x-component'] === 'Cascader',
  designerProps: {
    propsSchema: createFieldSchema(fieldPropertyWithEnum)(AllSchemas.Cascader),
  },
  designerLocales: AllLocales.Cascader,
});

Cascader.Resource = createResource({
  icon: 'CascaderSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        title: 'Cascader',
        'x-decorator': 'FormItem',
        'x-component': 'Cascader',
      },
    },
  ],
});
