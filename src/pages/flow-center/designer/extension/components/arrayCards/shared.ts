import { TreeNode, Engine } from '@designable/core';
import { ISchema } from '@formily/react';
import { AllSchemas } from '@designable/formily-antd';
import { ReactionsSetter, DataSourceSetter, ValidatorSetter } from '@designable/formily-setters';
import { FormItemSwitcher } from './formItemSwitcher';

export type ComponentNameMatcher =
  | string
  | string[]
  | ((name: string, node: TreeNode, context?: any) => boolean);

export const matchComponent = (node: TreeNode, name: ComponentNameMatcher, context?: any) => {
  if (name === '*') return true;
  const componentName = node?.props?.['x-component'];
  if (typeof name === 'function') return name(componentName || '', node, context);
  if (Array.isArray(name)) return name.includes(componentName);
  return componentName === name;
};

export const matchChildComponent = (node: TreeNode, name: ComponentNameMatcher, context?: any) => {
  if (name === '*') return true;
  const componentName = node?.props?.['x-component'];
  if (!componentName) return false;
  if (typeof name === 'function') return name(componentName || '', node, context);
  if (Array.isArray(name)) return name.includes(componentName);
  return componentName.indexOf(`${name}.`) > -1;
};

export const includesComponent = (
  node: TreeNode,
  names: ComponentNameMatcher[],
  target?: TreeNode,
) => {
  return names.some((name) => matchComponent(node, name, target));
};

export const queryNodesByComponentPath = (
  node: TreeNode,
  path: ComponentNameMatcher[],
): TreeNode[] => {
  if (path?.length === 0) return [];
  if (path?.length === 1) {
    if (matchComponent(node, path[0])) {
      return [node];
    }
  }
  return matchComponent(node, path[0])
    ? node.children.reduce((buf: any, child) => {
        return buf.concat(queryNodesByComponentPath(child, path.slice(1)));
      }, [])
    : [];
};

export const findNodeByComponentPath = (
  node: TreeNode,
  path: ComponentNameMatcher[],
): TreeNode | undefined => {
  if (path?.length === 0) return;
  if (path?.length === 1) {
    if (matchComponent(node, path[0])) {
      return node;
    }
  }
  if (matchComponent(node, path[0])) {
    for (let i = 0; i < node.children.length; i++) {
      const next = findNodeByComponentPath(node.children[i], path.slice(1));
      if (next) {
        return next;
      }
    }
  }
};

export const hasNodeByComponentPath = (node: TreeNode, path: ComponentNameMatcher[]) =>
  !!findNodeByComponentPath(node, path);

export const matchArrayItemsNode = (node: TreeNode) => {
  return node?.parent?.props?.type === 'array' && node?.parent?.children?.[0] === node;
};

export const createNodeId = (designer: Engine, id: string) => {
  return {
    [designer.props.nodeIdAttrName as any]: id,
  };
};

export const createEnsureTypeItemsNode = (type: string) => (node: TreeNode) => {
  const objectNode = node.children.find((child) => child.props?.['type'] === type);
  if (objectNode) {
    return objectNode;
  } else {
    const newObjectNode = new TreeNode({
      componentName: 'Field',
      props: {
        type,
      },
    });
    node.prepend(newObjectNode);
    return newObjectNode;
  }
};

export const createComponentSchema = (component: ISchema, decorator: ISchema) => {
  return {
    'component-group': component && {
      type: 'void',
      'x-component': 'CollapseItem',
      'x-reactions': {
        fulfill: {
          state: {
            visible: '{{!!$form.values["x-component"]}}',
          },
        },
      },
      properties: {
        'x-component-props': component,
      },
    },
    'decorator-group': decorator && {
      type: 'void',
      'x-component': 'CollapseItem',
      'x-component-props': { defaultExpand: false },
      'x-reactions': {
        fulfill: {
          state: {
            visible: '{{!!$form.values["x-decorator"]}}',
          },
        },
      },
      properties: {
        'x-decorator-props': decorator,
      },
    },
    'component-style-group': {
      type: 'void',
      'x-component': 'CollapseItem',
      'x-component-props': { defaultExpand: false },
      'x-reactions': {
        fulfill: {
          state: {
            visible: '{{!!$form.values["x-component"]}}',
          },
        },
      },
      properties: {
        'x-component-props.style': AllSchemas.CSSStyle,
      },
    },
    'decorator-style-group': {
      type: 'void',
      'x-component': 'CollapseItem',
      'x-component-props': { defaultExpand: false },
      'x-reactions': {
        fulfill: {
          state: {
            visible: '{{!!$form.values["x-decorator"]}}',
          },
        },
      },
      properties: {
        'x-decorator-props.style': AllSchemas.CSSStyle,
      },
    },
  };
};

export const createFieldSchema = (
  component?: ISchema,
  decorator: ISchema = AllSchemas.FormItem,
): ISchema => {
  return {
    type: 'object',
    properties: {
      'field-group': {
        type: 'void',
        'x-component': 'CollapseItem',
        properties: {
          name: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          title: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          description: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
          },
          'x-display': {
            type: 'string',
            enum: ['visible', 'hidden', 'none', ''],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              defaultValue: 'visible',
            },
          },
          'x-pattern': {
            type: 'string',
            enum: ['editable', 'disabled', 'readOnly', 'readPretty', ''],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              defaultValue: 'editable',
            },
          },
          default: {
            'x-decorator': 'FormItem',
            'x-component': 'ValueInput',
          },
          enum: {
            'x-decorator': 'FormItem',
            'x-component': DataSourceSetter,
          },
          'x-reactions': {
            'x-decorator': 'FormItem',
            'x-component': ReactionsSetter,
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
        },
      },
      ...createComponentSchema(component, decorator),
    },
  };
};

export const createVoidFieldSchema = (
  component?: ISchema,
  decorator: ISchema = AllSchemas.FormItem,
) => {
  return {
    type: 'object',
    properties: {
      'field-group': {
        type: 'void',
        'x-component': 'CollapseItem',
        properties: {
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
          'x-display': {
            type: 'string',
            enum: ['visible', 'hidden', 'none', ''],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              defaultValue: 'visible',
            },
          },
          'x-pattern': {
            type: 'string',
            enum: ['editable', 'disabled', 'readOnly', 'readPretty', ''],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              defaultValue: 'editable',
            },
          },
          'x-reactions': {
            'x-decorator': 'FormItem',
            'x-component': ReactionsSetter,
          },
          'x-decorator': {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': FormItemSwitcher,
          },
        },
      },
      ...createComponentSchema(component, decorator),
    },
  };
};
