import React, { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import { Input, Tree } from 'antd';
import type { TreeProps } from 'antd/es/tree';
import './style.less';
import { resourceTree } from '@/services/auth';
import { SearchOutlined } from '@ant-design/icons';
// import { useModel } from 'umi';
import { ProCard } from '@ant-design/pro-components';

export type IProps = {
  ref?: any;
  onAfterLoad?: () => void;
};

const dataList: { bid: React.Key; text: string; type: string }[] = [];
const generateList = (data: ResourceTreeItemType[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { bid, text, type } = node;
    dataList.push({ bid, text, type });
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (bid: React.Key, tree: ResourceTreeItemType[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.bid === bid)) {
        parentKey = node.bid;
      } else if (getParentKey(bid, node.children)) {
        parentKey = getParentKey(bid, node.children);
      }
    }
  }
  return parentKey!;
};

let treeList: ResourceTreeItemType[] = [];
const ResourceTree: React.FC<IProps & TreeProps> = forwardRef(({ onAfterLoad, ...rest }, ref) => {
  const [treeData, setTreeData] = useState<ResourceTreeItemType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const expandByKeys = (keys: React.Key[]) => {
    const expandedKeysa: any[] = dataList
      .map((item) => {
        if (keys.includes(item.bid)) {
          return getParentKey(item.bid, treeList);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(expandedKeysa);
  };

  const getTreeList = () => {
    // 获取项目权限列表
    resourceTree().then((res) => {
      treeList = res.data || [];
      generateList(treeList);
      setTreeData(treeList);
      setLoading(false);
      if (onAfterLoad) {
        onAfterLoad();
      }
    });
  };

  useEffect(() => {
    getTreeList();
  }, []);
  useImperativeHandle(ref, () => {
    return {
      getTreeList,
      getDataList: () => dataList,
      getParentKey,
      expandByKeys,
    };
  });

  const treeDatas = useMemo(() => {
    const loop = (data: ResourceTreeItemType[]): any =>
      data.map((item) => {
        const strName = item.text as string;
        const index = strName.indexOf(searchValue);
        const beforeStr = strName.substring(0, index);
        const afterStr = strName.slice(index + searchValue.length);
        const text =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strName}</span>
          );
        if (item.children) {
          return {
            text,
            key: item.bid,
            bid: item.bid,
            parentBid: item.parentBid,
            children: loop(item.children),
          };
        }

        return {
          text,
          key: item.bid,
          bid: item.bid,
          parentBid: item.parentBid,
        };
      });
    console.log(loop(treeData || []));
    return loop(treeData || []);
  }, [searchValue, treeData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // console.log(dataList);

    const newExpandedKeys = dataList
      .map((item) => {
        if (item.text.indexOf(value) > -1) {
          return getParentKey(item.bid, treeList);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys as React.Key[]);
    setSearchValue(value);

    setAutoExpandParent(true);
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  return (
    <ProCard loading={loading} className="LingdongTree" bodyStyle={{ padding: 0 }}>
      <Input
        style={{ marginBottom: 8 }}
        placeholder="请输入关键字"
        suffix={<SearchOutlined />}
        onChange={onChange}
      />
      <Tree
        showLine
        checkable
        treeData={treeDatas}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        autoExpandParent={autoExpandParent}
        fieldNames={{
          title: 'text',
          key: 'bid',
          children: 'children',
        }}
        {...rest}
      />
    </ProCard>
  );
});

export default ResourceTree;
