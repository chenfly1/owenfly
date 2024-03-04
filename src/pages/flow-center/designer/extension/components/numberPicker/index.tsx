import React from 'react';
import { NumberPicker as FormilyNumberPicker } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { createFieldSchema } from '../../shared';
import { fieldProperty } from '../config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';

export const NumberPicker: DnFC<React.ComponentProps<typeof FormilyNumberPicker>> =
  FormilyNumberPicker;

NumberPicker.Behavior = createBehavior({
  name: 'NumberPicker',
  extends: ['Field'],
  selector: (node: any) => node.props['x-component'] === 'NumberPicker',
  designerProps: {
    propsSchema: createFieldSchema(fieldProperty)(AllSchemas.NumberPicker),
  },
  designerLocales: AllLocales.NumberPicker,
});

NumberPicker.Resource = createResource({
  icon: 'NumberPickerSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'number',
        title: 'NumberPicker',
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
      },
    },
  ],
});
