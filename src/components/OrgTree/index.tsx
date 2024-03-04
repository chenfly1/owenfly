import React, { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import { Input, Tree } from 'antd';
import type { IProps } from './data';
import type { TreeProps } from 'antd/es/tree';
import './style.less';
import { getTreeData } from './service';
import type { TreeNodeType } from './data';
import { useModel } from 'umi';
import { ProCard } from '@ant-design/pro-components';

const { Search } = Input;

const dataList: { id: React.Key; name: string }[] = [];
const generateList = (data: TreeNodeType[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { id, name } = node;
    dataList.push({ id, name });
    if (node.children) {
      generateList(node.children as TreeNodeType[]);
    }
  }
};

const getParentKey = (id: React.Key, tree: OrgListType[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.id === id)) {
        parentKey = node.id;
      } else if (getParentKey(id, node.children)) {
        parentKey = getParentKey(id, node.children);
      }
    }
  }
  return parentKey!;
};

let treeList: TreeNodeType[] = [];
const LingdongTree: React.FC<IProps & TreeProps> = forwardRef(({ onAfterLoad, ...rest }, ref) => {
  const [treeData, setTreeData] = useState<OrgListType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState<boolean>(true);

  const getTreeList = () => {
    const params = { orgBids: initialState?.currentUser?.orgBidList };
    // 获取项目权限列表
    getTreeData({ params }).then((res) => {
      treeList = res.data || [];
      generateList(treeList);
      setTreeData(treeList);
      setLoading(false);
      if (onAfterLoad) {
        onAfterLoad();
      }
      // const expandedKeysa: React.Key[] = dataList
      //   .map((item) => {
      //     return getParentKey(item.id, treeList);
      //   })
      //   .filter((item, i, self) => item && self.indexOf(item) === i);
      // setExpandedKeys(expandedKeysa);
    });
  };

  useEffect(() => {
    getTreeList();
  }, []);
  useImperativeHandle(ref, () => {
    return {
      getTreeList,
    };
  });

  const treeDatas = useMemo(() => {
    const loop = (data: OrgListType[]): any =>
      data.map((item) => {
        const strName = item.name as string;
        const indexL = strName.indexOf(searchValue.toLowerCase());
        const indexH = strName.indexOf(searchValue.toUpperCase());
        const index = indexL > -1 ? indexL : indexH;
        const beforeStr = strName.substring(0, index);
        const afterStr = strName.slice(index + searchValue.length);
        const orgChar = strName.substring(index, index + searchValue.length);

        const name =
          index > -1 && searchValue.length ? (
            <span>
              {beforeStr}
              <span className="site-tree-search-value">{orgChar}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strName}</span>
          );
        if (item.children) {
          return {
            name,
            key: item.id,
            id: item.id,
            bid: item.bid,
            parentBid: item.parentBid,
            parentName: item.parentName,
            children: loop(item.children),
          };
        }

        return {
          name,
          key: item.id,
          id: item.id,
          bid: item.bid,
          parentBid: item.parentBid,
          parentName: item.parentName,
        };
      });
    console.log(loop(treeData || []));
    return loop(treeData || []);
  }, [searchValue, treeData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // console.log(dataList);
    if (!value.length) {
      setExpandedKeys([]);
      setSearchValue('');
      setAutoExpandParent(false);
      return;
    }

    const newExpandedKeys = dataList
      .map((item) => {
        if (
          item.name.indexOf(value.toLocaleLowerCase()) > -1 ||
          item.name.indexOf(value.toUpperCase()) > -1
        ) {
          return getParentKey(item.id, treeList);
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
      <Search style={{ marginBottom: 8 }} placeholder="请输入关键字" onChange={onChange} />
      <Tree
        treeData={treeDatas}
        showLine
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        autoExpandParent={autoExpandParent}
        fieldNames={{
          title: 'name',
          key: 'id',
          children: 'children',
        }}
        {...rest}
      />
    </ProCard>
  );
});

export default LingdongTree;
