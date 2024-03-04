import React from 'react';
import { Select as FormilySelect } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { AllLocales } from '@designable/formily-antd/lib/locales';
import { createFieldSchema } from '../../shared';
import { fieldProperty } from './config';
import { AllSchemas } from '@designable/formily-antd';

export const Select: DnFC<React.ComponentProps<typeof FormilySelect>> = FormilySelect;

Select.Behavior = createBehavior({
  name: 'Select',
  extends: ['Field'],
  selector: (node: any) => node.props['x-component'] === 'Select',
  designerProps: {
    propsSchema: createFieldSchema(fieldProperty)(AllSchemas.Select),
  },
  designerLocales: AllLocales.Select,
});

Select.Resource = createResource({
  icon: 'SelectSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        title: 'Select',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
      },
    },
  ],
});
