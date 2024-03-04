import { ISchema } from '@formily/react';
import { FormItemSwitcher } from './formItemSwitcher';

export const fieldProperty: ISchema['properties'] = {
  name: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
  },
  title: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    'x-reactions': {
      fulfill: {
        state: {
          hidden: '{{$form.values["x-decorator"] !== "FormItem"}}',
        },
      },
    },
  },
  description: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input.TextArea',
    'x-reactions': {
      fulfill: {
        state: {
          hidden: '{{$form.values["x-decorator"] !== "FormItem"}}',
        },
      },
    },
  },
  'x-decorator': {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': FormItemSwitcher,
  },
};
