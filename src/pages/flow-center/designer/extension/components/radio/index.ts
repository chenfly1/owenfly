import React from 'react';
import { Radio as FormilyRadio } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { createFieldSchema } from '../../shared';
import { fieldPropertyWithEnumV2 } from '../config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';
import { omit } from 'lodash';

export const Radio: DnFC<React.ComponentProps<typeof FormilyRadio>> = FormilyRadio;

Radio.Behavior = createBehavior({
  name: 'Radio.Group',
  extends: ['Field'],
  selector: (node: any) => node.props['x-component'] === 'Radio.Group',
  designerProps: {
    propsSchema: createFieldSchema(omit(fieldPropertyWithEnumV2, ['x-validator']) as any)(
      AllSchemas.Radio.Group,
    ),
  },
  designerLocales: AllLocales.RadioGroup,
});

Radio.Resource = createResource({
  icon: 'RadioGroupSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'string | number',
        title: 'Radio Group',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: [
          { label: '选项1', value: 1 },
          { label: '选项2', value: 2 },
        ],
      },
    },
  ],
});
