/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { TreeNode } from '@designable/core';
import { useSelected, useTree } from '@designable/react';
import { TreeSelectProps, TreeSelect } from 'antd';

export const useSelectedNode = (workspaceId?: string) => {
  const selected = useSelected(workspaceId);
  const tree = useTree(workspaceId);
  return tree?.findById?.(selected[0]);
};

export interface IPathSelectorProps extends Omit<TreeSelectProps<any>, 'onChange'> {
  value?: string;
  onChange?: (value: string, node: TreeNode) => void;
  style?: React.CSSProperties;
  className?: string;
}

const transformDataSource = (node: TreeNode) => {
  const currentNode = node;
  const dots = (count: number) => {
    let dot = '';
    for (let i = 0; i < count; i++) {
      dot += '.';
    }
    return dot;
  };
  const targetPath = (parentNode: TreeNode, targetNode: TreeNode) => {
    const path: any[] = [];
    const transform = (node: TreeNode) => {
      if (node && node !== parentNode) {
        path.push(node.props?.name || node.id);
      } else {
        transform(node.parent);
      }
    };
    transform(targetNode);
    return path.reverse().join('.');
  };
  const hasNoVoidChildren = (node: TreeNode): any => {
    return node.children?.some((node: any) => {
      if (node.props.type !== 'void' && node !== currentNode) return true;
      return hasNoVoidChildren(node);
    });
  };
  const findRoot = (node: TreeNode): TreeNode => {
    if (!node?.parent) return node;
    if (node?.parent?.componentName !== node.componentName) return node.parent;
    return findRoot(node.parent);
  };
  const root = findRoot(node);
  const findArrayParent = (node: TreeNode): any => {
    if (!node?.parent) return;
    if (node.parent.props?.type === 'array') return node.parent;
    if (node.parent === root) return;
    return findArrayParent(node.parent);
  };
  const transformRelativePath = (arrayNode: TreeNode, targetNode: TreeNode) => {
    if (targetNode.depth === currentNode.depth)
      return `.${targetNode.props?.name || targetNode.id}`;
    return `${dots(currentNode.depth - arrayNode.depth)}[].${targetPath(arrayNode, targetNode)}`;
  };
  const transformChildren = (children: TreeNode[], path = []): any => {
    return children.reduce((buf, node) => {
      if (node === currentNode) return buf;
      if (node.props?.type === 'array' && !node.contains(currentNode)) return buf;
      if (node.props?.type === 'void' && !hasNoVoidChildren(node)) return buf;
      const currentPath = path.concat(node.props?.name || node.id);
      const arrayNode = findArrayParent(node);
      const label =
        node.props?.title ||
        node.props?.['x-component-props']?.title ||
        node.props?.name ||
        node.designerProps.title ||
        '容器层';
      const value = arrayNode ? transformRelativePath(arrayNode, node) : currentPath.join('.');
      return buf.concat({
        label,
        value,
        node,
        children: transformChildren(node.children, currentPath),
      } as any);
    }, []);
  };
  if (root) {
    return transformChildren(root.children);
  }
  return [];
};

export const PathSelector: React.FC<IPathSelectorProps> = (props) => {
  const baseNode = useSelectedNode();
  const dataSource = transformDataSource(baseNode);
  const findNode = (dataSource: any[], value: string): any => {
    for (let i = 0; i < dataSource.length; i++) {
      const item = dataSource[i];
      if (item.value === value) return item.node;
      if (item.children?.length) {
        const fondedChild = findNode(item.children, value);
        if (fondedChild) return fondedChild;
      }
    }
  };
  return (
    <TreeSelect
      {...props}
      treeCheckable={true}
      onChange={(value) => {
        props.onChange?.(value, findNode(dataSource, value));
      }}
      treeDefaultExpandAll
      treeData={dataSource}
    />
  );
};
