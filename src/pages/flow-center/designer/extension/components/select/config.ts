import { ISchema } from '@formily/react';
import { ValidatorSetter } from '@designable/formily-setters/lib/components';
import { EnumSetterV2 } from '../../setters/EnumSetterV2';
import { GlobalRegistry } from '@designable/core';
import { LinkageSetter } from '../../setters/LinkageSetter';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    settings: {
      // mode: '模式',
      mode: {
        title: '模式',
        dataSource: ['多选', '标签', '单选'],
      },
      'x-custom-enum-v2': '选项内容',
      'x-custom-search': '支持搜索',
      'x-custom-linkage': '逻辑表单',
    },
  },
});

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
  // mode: {
  //   type: 'string',
  //   enum: ['multiple', 'tags', null] as any,
  //   'x-decorator': 'FormItem',
  //   'x-component': 'Radio.Group',
  //   'x-component-props': {
  //     defaultValue: null,
  //     optionType: 'button',
  //   },
  // },
  'x-custom-search': {
    'x-decorator': 'FormItem',
    'x-component': 'Switch',
  },
  // default: {
  //   'x-decorator': 'FormItem',
  //   'x-component': 'ValueInput',
  // },
  'x-custom-enum-v2': {
    'x-decorator': 'FormItem',
    'x-component': EnumSetterV2,
  },
  'x-custom-linkage': {
    'x-decorator': 'FormItem',
    'x-component': LinkageSetter,
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
