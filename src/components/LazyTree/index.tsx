import { Tree } from 'antd';
import { useState, useRef, useEffect } from 'react';
import Style from './index.less';
import { TreeProps } from 'antd/es/tree';
import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { isFunction } from 'lodash';

export interface LazyTreeNodeType<T> {
  key: string;
  title: string;
  data: T;
  children?: LazyTreeNodeType<T>[];
  loaded?: boolean;
  isLeaf?: boolean;
  checkable?: boolean;
}

export const RootNode = {
  key: '0',
  title: 'root',
  isLeaf: false,
  children: [],
};

export type LazyTreeRef<T> = {
  initSource: (
    treeData: T[],
    cb?: (mapValues: Record<string, LazyTreeNodeType<T>>) => void,
  ) => void;
  updateSource: (
    func: (
      mapValues: Record<string, LazyTreeNodeType<T>>,
      done: (newMapValues: Record<string, LazyTreeNodeType<T>>) => void,
    ) => void,
  ) => void;
  updateExpandedKeys: (keys: string[]) => void;
  updateSelectedKey: (key: string) => void;
};

export type LazyTreeProps<T> = {
  request: (node: LazyTreeNodeType<T>) => Promise<T[]>;
  defaultSelectedKey?: string;
  defaultExpandedKeys?: string[];
  defaultCheckedKeys?: string[];
  rootNode?: { key: string; title: string };
  loading?: boolean;
  fieldNames?: TreeProps['fieldNames'] & {
    isLeaf?: string;
    checkable?: string | ((node: LazyTreeNodeType<T>) => boolean);
  };
  checkable?: boolean;
  extraAction?: (node: LazyTreeNodeType<T>) => React.ReactNode;
  onCheck?: (value: string[], info: { checkedNodes: LazyTreeNodeType<T>[] }) => void;
  onSelect?: (value: LazyTreeNodeType<T>) => void;
  showRootNode?: boolean;
  rootStyle?: React.CSSProperties;
};

export default <T extends Record<string, any>>(
  props: LazyTreeProps<T> & { getRef?: (ref: LazyTreeRef<T> | null) => void },
) => {
  const [source, setSource] = useState<LazyTreeNodeType<T>[]>();
  const [selectedKey, setSelectedKey] = useState<string>(props.defaultSelectedKey || '');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(props.defaultExpandedKeys || []);
  const [checkedKeys, setCheckedKeys] = useState<string[]>(props.defaultCheckedKeys || []);
  const cacheRef = useRef<{
    sourceMap: Record<string, LazyTreeNodeType<T>>;
    checkedNodes: LazyTreeNodeType<T>[];
  }>({
    sourceMap: {},
    checkedNodes: [],
  });
  const key = props.fieldNames?.key || 'key';
  const children = props.fieldNames?.children || 'children';
  const title = props.fieldNames?.title || 'title';
  const isLeaf = props.fieldNames?.isLeaf || 'isLeaf';
  const checkable = props.fieldNames?.checkable ?? 'checkable';
  const rootNode = props.rootNode || RootNode;

  const updateSource = (values: LazyTreeNodeType<T>[]) => {
    if (props.showRootNode) {
      setSource(values || []);
    } else {
      setSource(values?.[0]?.children || []);
    }
  };

  const generateTree = (k: string = rootNode.key) => {
    const match = cacheRef.current.sourceMap[k];
    if (match?.children?.length) {
      match.children = match.children.map((item) => {
        return generateTree(item[key] ?? item.key) || item;
      });
    }
    return match;
  };

  const transformSourceToMap = (treeData: T[]) => {
    treeData.forEach((node) => {
      cacheRef.current.sourceMap[node[key]] = {
        key: `${node[key]}`,
        title: node[title],
        children: node[children] || [],
        isLeaf: node[isLeaf],
        loaded: node.loaded,
        data: node,
      };
      // 设置可选配置
      cacheRef.current.sourceMap[node[key]].checkable = isFunction(checkable)
        ? checkable(cacheRef.current.sourceMap[node[key]])
        : node[checkable];
      transformSourceToMap(node[children] || []);
    });
  };

  const checkHandler = (
    checkedKeysValue:
      | React.Key[]
      | {
          checked: React.Key[];
          halfChecked: React.Key[];
        },
    info: { checkedNodes: LazyTreeNodeType<T>[] },
  ) => {
    if (Array.isArray(checkedKeysValue)) {
      setCheckedKeys(checkedKeysValue as string[]);
      cacheRef.current.checkedNodes = info.checkedNodes;
      props.onCheck?.(checkedKeysValue as string[], info);
    }
  };

  const appendData = async (node: LazyTreeNodeType<T>) => {
    const { children: existChild = [], loaded } = cacheRef.current.sourceMap[node.key] || {};
    if (loaded) return;
    try {
      const data = await props.request(node);
      const nestChild = existChild.concat(
        data.map((item) => {
          const nestItem: LazyTreeNodeType<T> = {
            data: item,
            key: item[key],
            title: item[title],
            isLeaf: item[isLeaf],
            children: [],
          };
          nestItem.checkable = isFunction(checkable) ? checkable(nestItem) : node[checkable];
          return nestItem;
        }),
      );
      cacheRef.current.sourceMap[node.key] = {
        ...node,
        loaded: true,
        children: nestChild,
      };
      // 设置可选配置
      cacheRef.current.sourceMap[node.key].checkable = isFunction(checkable)
        ? checkable(cacheRef.current.sourceMap[node.key])
        : node[checkable];
      updateSource([generateTree()]);
      if (props.checkable && checkedKeys.includes(`${node?.data?.data?.parentId ?? ''}`)) {
        const checkableItem = nestChild.filter((item) => item.checkable);
        checkHandler(
          checkedKeys.concat(
            node.key,
            checkableItem.map((item) => item.key),
          ),
          { checkedNodes: cacheRef.current.checkedNodes.concat(checkableItem) },
        );
      }
      if (node.key === selectedKey) {
        props?.onSelect?.(cacheRef.current.sourceMap[node.key]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateExpandedKeys = (keys: string[]) => {
    const res = keys.reduce((prev, curr) => {
      return expandedKeys.includes(curr)
        ? prev.filter((item) => item !== curr)
        : [curr].concat(prev);
    }, expandedKeys);
    setExpandedKeys(res);
  };

  const selectHandler = (k: string) => {
    updateExpandedKeys([k]);
    setSelectedKey(k);
    props?.onSelect?.(cacheRef.current.sourceMap[k]);
  };

  useEffect(() => {
    if (props.getRef) {
      props.getRef({
        initSource: (treeData: T[], cb) => {
          cacheRef.current.sourceMap = {};
          transformSourceToMap(treeData);
          const treeMapValues = generateTree();
          updateSource([treeMapValues]);
          if (cb) cb(cacheRef.current.sourceMap);
        },
        updateSource: (func) => {
          func(cacheRef.current.sourceMap, (values) => {
            cacheRef.current.sourceMap = values;
            updateSource([generateTree()]);
          });
        },
        updateSelectedKey: selectHandler,
        updateExpandedKeys,
      });
    }
  }, []);

  return (
    <ProCard className="pro--no-padding" loading={props.loading}>
      <Tree<LazyTreeNodeType<T>>
        treeData={source}
        titleRender={(node) => {
          return (
            <div className={Style.lazy_tree_title}>
              <span style={{ flex: 1 }}>{node.title}</span>
              {props.extraAction?.(node)}
            </div>
          );
        }}
        defaultExpandAll
        blockNode={true}
        showLine={true}
        selectedKeys={[selectedKey]}
        expandedKeys={expandedKeys}
        checkedKeys={checkedKeys}
        checkable={props.checkable}
        loadData={appendData}
        rootStyle={props.rootStyle}
        onSelect={(_, { node }) => {
          selectHandler(node.key);
        }}
        onExpand={(_, { node }) => {
          updateExpandedKeys([node.key]);
        }}
        onCheck={checkHandler}
      />
    </ProCard>
  );
};
