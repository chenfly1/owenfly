import React from 'react';
import { createBehavior, createResource } from '@designable/core';
import { DnFC } from '@designable/react';
import { fieldProperty } from './config';
import { AllLocales, AllSchemas } from '@designable/formily-antd';
import cls from 'classnames';
import './styles.less';
import { createFieldSchema } from '../../shared';

export interface IDesignableTextProps {
  value?: string;
  content?: string;
  mode?: 'normal' | 'h1' | 'h2' | 'h3' | 'p';
  style?: React.CSSProperties;
  className?: string;
}

export const Text: DnFC<IDesignableTextProps> = (props) => {
  const tagName = props.mode === 'normal' || !props.mode ? 'div' : props.mode;
  return React.createElement(
    tagName,
    {
      ...props,
      className: cls(props.className, 'dn-text'),
      'data-content-editable': 'x-component-props.content',
    },
    props.content,
  );
};

Text.Behavior = createBehavior({
  name: 'Text',
  extends: ['Field'],
  selector: (node: any) => node.props['x-component'] === 'Text',
  designerProps: {
    propsSchema: createFieldSchema(fieldProperty)(AllSchemas.Text),
  },
  designerLocales: AllLocales.Text,
});

Text.Resource = createResource({
  icon: 'TextSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'string',
        'x-component': 'Text',
      },
    },
  ],
});
