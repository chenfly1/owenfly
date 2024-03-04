import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Transfer, Tree } from 'antd';
import styles from './style.less';

// import { getTreeData } from '@/components/OrgTree/service';
import { parkAreaTree } from '@/services/park';

type listType = { direction: 'left' | 'right' };

const dataList: { id: React.Key; name: string }[] = [];
const generateList = (data: ParkAreaTreeType[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { id, name } = node;
    dataList.push({ id, name });
    if (node.child) {
      generateList(node.child);
    }
  }
};

const getParentKey = (id: React.Key, tree: ParkAreaTreeType[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.child) {
      if (node.child.some((item) => item.id === id)) {
        parentKey = node.id;
      } else if (getParentKey(id, node.child)) {
        parentKey = getParentKey(id, node.child);
      }
    }
  }
  return parentKey!;
};
let treeList: ParkAreaTreeType[] = [];
type Iprops = {
  parkId: string;
};
const AreaTree: React.FC<Iprops> = forwardRef(({ parkId }) => {
  const [treeData, setTreeData] = useState<ParkAreaTreeType[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  const treeDatas = useMemo(() => {
    try {
      const loop = (data: ParkAreaTreeType[]): any =>
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
          if (item.child) {
            return {
              disabled: true,
              name,
              key: item.id,
              id: item.id,
              children: loop(item.child),
            };
          }

          return {
            name,
            disabled: true,
            key: item.id,
            id: item.id,
          };
        });
      console.log(loop(treeData || []));
      return loop(treeData || []);
    } catch (error) {
      return [];
    }
  }, [searchValue, treeData]);

  const getTreeList = () => {
    // 获取项目权限列表
    parkAreaTree(parkId).then((res) => {
      treeList = res.data || [];
      generateList(treeList);
      setTreeData(treeList);
      // const expandedKeysa: React.Key[] = dataList
      //   .map((item) => {
      //     return getParentKey(item.id, treeList);
      //   })
      //   .filter((item, i, self) => item && self.indexOf(item) === i);
      // setExpandedKeys(expandedKeysa);
    });
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onSearch = (_: 'left' | 'right', value: string) => {
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

  const transferDataSource: ParkAreaTreeType[] = [];
  function flatten(list: ParkAreaTreeType[] = []) {
    list.forEach((item) => {
      transferDataSource.push(item as ParkAreaTreeType);
      flatten(item.child);
    });
  }
  flatten(treeDatas);

  const onSelectChange = (keys: string[]) => {
    setSelectedKey(keys);
  };

  useEffect(() => {
    getTreeList();
  }, []);

  return (
    <Transfer
      dataSource={transferDataSource}
      className={styles.areaTree}
      showSearch
      onSearch={onSearch}
      onSelectChange={onSelectChange}
      selectedKeys={selectedKey}
      // selectAllLabels={[<div />]}
      operationStyle={{
        display: 'none',
      }}
      listStyle={(e: listType) => {
        if (e.direction === 'right') {
          return {
            display: 'none',
          };
        } else {
          return {
            width: '100%',
            height: '400px',
          };
        }
      }}
    >
      {({ direction }) => {
        if (direction === 'left') {
          return (
            <Tree
              treeData={treeDatas}
              checkedKeys={selectedKey}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              autoExpandParent={autoExpandParent}
              checkable
              showLine
              fieldNames={{
                title: 'name',
                key: 'id',
              }}
              onCheck={(keys, { node: {} }) => {
                setSelectedKey(keys as string[]);
              }}
              onSelect={(keys, { node: {} }) => {
                setSelectedKey(keys as string[]);
              }}
            />
          );
        }
      }}
    </Transfer>
  );
});

export default AreaTree;
