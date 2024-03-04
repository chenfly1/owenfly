import { Engine } from '@designable/core';
import { transformToSchema, transformToTreeNode } from '@designable/formily-transformer';
import { message } from 'antd';

export const saveSchema = (designer: Engine) => {
  localStorage.setItem(
    'formily-schema',
    JSON.stringify(transformToSchema(designer.getCurrentTree())),
  );
  // localStorage.setItem('formily-schema', JSON.stringify(designer.getCurrentTree()));
  message.success('Save Success');
};

export const loadInitialSchema = (designer: Engine) => {
  try {
    designer.setCurrentTree(
      transformToTreeNode(JSON.parse(localStorage.getItem('formily-schema'))),
    );
    // designer.setCurrentTree(JSON.parse(localStorage.getItem('formily-schema')));
  } catch {}
};
