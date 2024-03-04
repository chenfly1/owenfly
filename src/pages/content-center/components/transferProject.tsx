import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Transfer, Tree } from 'antd';
import styles from './style.less';
import type { DataNode } from 'antd/es/tree';
import type { TransferDirection, TransferItem } from 'antd/es/transfer';
import type { TreeNodeType } from '@/components/OrgTree/data';
import { projectTreeList } from '@/services/security';

let dataList: { projectBid: React.Key; name: string; orgType: string }[] = [];
const generateList = (data: TreeNodeType[]) => {
  for (let i = 0; i < data.length; i++) {
    if (!data[i].projectBid) data[i].projectBid = data[i].id + '';
    const node = data[i];
    const { projectBid, name, orgType } = node;
    dataList.push({ projectBid, name, orgType });
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (projectBid: React.Key, tree: TreeNodeType[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.projectBid === projectBid)) {
        parentKey = node.projectBid;
      } else if (getParentKey(projectBid, node.children)) {
        parentKey = getParentKey(projectBid, node.children);
      }
    }
  }
  return parentKey!;
};

type Props = {
  projectBids: string[];
  filterProjectBids?: string[];
  setProjectBids: (keys: string[], list?: any) => void;
};

const App: React.FC<Props> = (props) => {
  const { projectBids, setProjectBids, filterProjectBids } = props;
  const [treeData, setTreeData] = useState<TreeNodeType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const treeList = useRef<TreeNodeType[]>([]);
  let isUnmount: boolean = false;
  const getTreeList = () => {
    // 获取项目权限列表
    projectTreeList({ projectBids: filterProjectBids }).then((res) => {
      if (res.code === 'SUCCESS') {
        generateList(res.data);
        treeList.current = res.data || [];
        if (!isUnmount) {
          setTreeData(res.data);
        }
      }
    });
  };

  useEffect(() => {
    isUnmount = false;
    getTreeList();
    return () => {
      dataList = [];
      isUnmount = true;
    };
  }, [filterProjectBids]);

  const treeDatas = useMemo(() => {
    const loop = (data: TreeNodeType[]): any =>
      data.map((item) => {
        const strName = item.name as string;
        const index = strName.indexOf(searchValue);
        const beforeStr = strName.substring(0, index);
        const afterStr = strName.slice(index + searchValue.length);

        const name =
          index > -1 && searchValue.length ? (
            <span>
              {beforeStr}
              <span className={styles.siteTreeSearchValue}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strName}</span>
          );
        if (item.children) {
          return {
            name,
            key: item.projectBid,
            projectBid: item.projectBid,
            orgType: item.orgType,
            bid: item.bid,
            parentBid: item.parentBid,
            parentName: item.parentName,
            children: loop(item.children),
          };
        }

        return {
          name,
          key: item.projectBid,
          projectBid: item.projectBid,
          orgType: item.orgType,
          bid: item.bid,
          parentBid: item.parentBid,
          parentName: item.parentName,
        };
      });
    console.log(loop(treeData || []));
    return loop(treeData || []);
  }, [searchValue, treeData]);

  const onChange = (value: string) => {
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
          return getParentKey(item.projectBid, treeList.current);
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

  const handleSearch = (dir: TransferDirection, value: string) => {
    console.log('search:', dir, value);
    setSearchValue(value);
    onChange(value);
  };

  const transferDataSource: TransferItem[] = [];
  function flatten(list: DataNode[] = []) {
    list.forEach((item) => {
      if ((item as any).orgType === 'project') transferDataSource.push(item as TransferItem);
      flatten(item.children);
    });
  }
  flatten(treeDatas);

  const onSelectChange = (keys: string[]) => {
    console.log(keys);
    setProjectBids(keys, keys);
  };

  return (
    <Transfer
      dataSource={transferDataSource}
      showSearch
      className={styles.customTransfer}
      onSearch={handleSearch}
      selectedKeys={transferDataSource
        .map((item) => item.projectBid)
        .filter((i) => (projectBids || []).indexOf(i) > -1)}
      onSelectChange={onSelectChange}
      listStyle={{ width: 400, height: 400 }}
      render={(item) => `${item.name}`}
    >
      {({ direction }) => {
        if (direction === 'left') {
          return (
            <Tree
              checkable
              blockNode
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              autoExpandParent={autoExpandParent}
              checkedKeys={projectBids}
              treeData={treeDatas}
              fieldNames={{
                title: 'name',
                key: 'projectBid',
                children: 'children',
              }}
              onCheck={(keys) => {
                setProjectBids(
                  keys as any,
                  transferDataSource
                    .map((item) => item.projectBid)
                    .filter((i) => (keys as any).indexOf(i) > -1),
                );
                // 过滤项目id
                // setProjectBids(
                //   (keys as any).filter((i: any) =>
                //     dataList.some((j: any) => j.orgType === 'project' && i == j.id),
                //   ),
                // );
              }}
              onSelect={(keys) => {
                setProjectBids(
                  keys as any,
                  transferDataSource
                    .map((item) => item.projectBid)
                    .filter((i) => (keys || []).indexOf(i) > -1),
                );
              }}
            />
          );
        }
      }}
    </Transfer>
  );
};

export default App;
