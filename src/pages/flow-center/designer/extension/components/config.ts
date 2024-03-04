import { ISchema } from '@formily/react';
import { ValidatorSetter } from '@designable/formily-setters/lib/components';
import { DefaultValueSetter } from '../setters/DefaultValueSetter/index';
import { GlobalRegistry } from '@designable/core';
import { EnumSetter } from '../setters/EnumSetter';
import { EnumSetterV2 } from '../setters/EnumSetterV2';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    settings: {
      'x-custom-default': '默认内容',
    },
  },
});

export const fieldPropertyWithEnum: ISchema['properties'] = {
  name: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
  },
  title: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    required: true,
  },
  description: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input.TextArea',
  },
  'x-custom-enum': {
    'x-decorator': 'FormItem',
    'x-component': EnumSetter,
  },
  'x-validator': {
    type: 'array',
    'x-component': ValidatorSetter,
  },
  required: {
    type: 'boolean',
    'x-decorator': 'FormItem',
    'x-component': 'Switch',
  },
};

export const fieldPropertyWithEnumV2: ISchema['properties'] = {
  name: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
  },
  title: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    required: true,
  },
  description: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input.TextArea',
  },
  'x-custom-enum-v2': {
    'x-decorator': 'FormItem',
    'x-component': EnumSetterV2,
  },
  'x-validator': {
    type: 'array',
    'x-component': ValidatorSetter,
  },
  required: {
    type: 'boolean',
    'x-decorator': 'FormItem',
    'x-component': 'Switch',
  },
};

export const fieldPropertyWithDefault: ISchema['properties'] = {
  name: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
  },
  title: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    required: true,
  },
  description: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input.TextArea',
  },
  'x-custom-default': {
    'x-decorator': 'FormItem',
    'x-component': DefaultValueSetter,
  },
  'x-validator': {
    type: 'array',
    'x-component': ValidatorSetter,
  },
  required: {
    type: 'boolean',
    'x-decorator': 'FormItem',
    'x-component': 'Switch',
  },
};

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
    required: true,
  },
  description: {
    type: 'string',
    'x-decorator': 'FormItem',
    'x-component': 'Input.TextArea',
  },
  default: {
    'x-decorator': 'FormItem',
    'x-component': 'ValueInput',
  },
  'x-validator': {
    type: 'array',
    'x-component': ValidatorSetter,
  },
  required: {
    type: 'boolean',
    'x-decorator': 'FormItem',
    'x-component': 'Switch',
  },
};
