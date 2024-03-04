import React from 'react';
import { DatePicker as FormilyDatePicker } from '@formily/antd';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { createFieldSchema } from '../../shared';
import { fieldProperty } from '../config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';
import { omit } from 'lodash';

export const DatePicker: DnFC<React.ComponentProps<typeof FormilyDatePicker>> = FormilyDatePicker;

DatePicker.Behavior = createBehavior(
  {
    name: 'DatePicker',
    extends: ['Field'],
    selector: (node: any) => node.props['x-component'] === 'DatePicker',
    designerProps: {
      propsSchema: createFieldSchema(omit(fieldProperty, ['x-validator']) as any)(
        AllSchemas.DatePicker,
      ),
    },
    designerLocales: AllLocales.DatePicker,
  },
  {
    name: 'DatePicker.RangePicker',
    extends: ['Field'],
    selector: (node: any) => node.props['x-component'] === 'DatePicker.RangePicker',
    designerProps: {
      propsSchema: createFieldSchema(omit(fieldProperty, ['x-validator']) as any)(
        AllSchemas.DatePicker.RangePicker,
      ),
    },
    designerLocales: AllLocales.DateRangePicker,
  },
);

DatePicker.Resource = createResource(
  {
    icon: 'DatePickerSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          type: 'string',
          title: 'DatePicker',
          'x-decorator': 'FormItem',
          'x-component': 'DatePicker',
        },
      },
    ],
  },
  {
    icon: 'DateRangePickerSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          type: 'string[]',
          title: 'DateRangePicker',
          'x-decorator': 'FormItem',
          'x-component': 'DatePicker.RangePicker',
        },
      },
    ],
  },
);
