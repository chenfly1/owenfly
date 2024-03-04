import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Button, Empty, Input, Tree } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { IProps, TreeNodeType } from './data.d';
import type { TreeProps } from 'antd/es/tree';
import styles from './style.less';
import { getStaffTree } from './service';
import { ProCard } from '@ant-design/pro-components';

// 利用递归，获取当前节点及父子点
export const getParentList = (id: React.Key, tree: TreeNodeType[]) => {
  let nodes: any[] = [];
  function getParentNodes(_id: React.Key, _tree: TreeNodeType[]) {
    _getParentNodes([], _id, _tree);
    return nodes;
  }

  function _getParentNodes(his: TreeNodeType[], targetId: React.Key, treeData: TreeNodeType[]) {
    treeData.some((list) => {
      const children = list.children || [];
      if (list.id === targetId) {
        nodes = his;
        nodes.push(list);
        return true;
      } else if (children.length > 0) {
        const history = [...his];
        history.push(list);
        return _getParentNodes(history, targetId, children);
      }
    });
  }
  return getParentNodes(id, tree);
};

export const getParentKey = (id: React.Key, tree: TreeNodeType[]): React.Key => {
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

// 利用递归，将tree转化成数组结构来操作
export function getPathById(tree: TreeNodeType[], id: React.Key, path: string[]): any {
  const trees: TreeNodeType[] = Array.isArray(tree) ? tree : [tree];
  let paths = path;
  if (!path) {
    paths = [];
  }
  for (let i = 0, len = trees.length; i < len; i++) {
    const tempPath = [...paths];
    tempPath.push(trees[i].name);
    if (trees[i].id === id) {
      return tempPath;
    }
    if (trees[i].children) {
      return getPathById(trees[i].children, id, tempPath);
    }
  }
}

let dataList: { id: React.Key; name: string; spaceType: string }[] = [];

// 垂类项目数据
const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

const SpaceTree: React.FC<IProps & TreeProps> = forwardRef(
  (
    {
      projectBid = project?.bid,
      onSelectChange,
      cardProps,
      mode,
      treeLoadComplate,
      onAddClick,
      ...rest
    },
    ref,
  ) => {
    const bodyStyle = cardProps?.bodyStyle || { padding: '0' };
    const [treeData, setTreeData] = useState<TreeNodeType[]>();
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [sltedKeys, setSltKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [loading, setLoading] = useState<boolean>(false);

    const generateList = (data: TreeNodeType[]) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const { id, name, spaceType } = node;
        dataList.push({ id, name, spaceType });
        if (node.children) {
          generateList(node.children);
        }
      }
    };

    const getTreeList = () => {
      if (projectBid) {
        setLoading(true);
        dataList = [];
        getStaffTree({
          // projectId: projectBid,
        }).then((res) => {
          if (res.code === 'SUCCESS') {
            if (treeLoadComplate) {
              treeLoadComplate!(res.data);
            }
            generateList(res.data);
            setTreeData(res.data);
            if (expandedKeys.length > 0) {
              setExpandedKeys(expandedKeys);
            } else {
              // 默认展开一个
              setExpandedKeys(res.data && res.data.length ? [res.data[0].id] : []);
            }
          }
          setLoading(false);
        });
      }
    };

    useImperativeHandle(ref, () => {
      return {
        getTreeList,
        treeData: treeData,
        dataList: dataList,
        getParentList: (id: any) => getParentList(id, treeData as any),
        setselectedKeys: (key: string) => {
          setSltKeys([key]);
        },
      };
    });

    //获取树列表
    useEffect(() => {
      getTreeList();
    }, [projectBid]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const newExpandedKeys = dataList
        .map((item) => {
          if (item.name.indexOf(value) > -1) {
            console.log(getParentKey(item.id, treeData as any));
            return getParentKey(item.id, treeData as any);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      console.log(newExpandedKeys);
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setSearchValue(value);
      setAutoExpandParent(true);
    };

    const onExpand = (newExpandedKeys: React.Key[]) => {
      setExpandedKeys(newExpandedKeys);
      setAutoExpandParent(false);
    };

    const treeDatas = useMemo(() => {
      const loop = (data: TreeNodeType[]): any =>
        data.map((item) => {
          const strName = item.name as string;
          const index = strName.indexOf(searchValue);
          const beforeStr = strName.substring(0, index);
          const afterStr = strName.slice(index + searchValue.length);
          const name =
            index > -1 ? (
              <span>
                {beforeStr}
                <span className={styles['site-tree-search-value']}>{searchValue}</span>
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
              spaceType: item.spaceType,
              parentId: item.parentId,
              strName,
              children: loop(item.children),
            };
          }

          return {
            name,
            key: item.id,
            id: item.id,
            strName,
            spaceType: item.spaceType,
            parentId: item.parentId,
          };
        });
      return loop(treeData || []);
    }, [searchValue, treeData]);

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
      setSltKeys(selectedKeys);
      const path = getPathById(treeData || [], selectedKeys[0], []);
      if (onSelectChange) onSelectChange(selectedKeys, info, path);
    };

    return (
      <ProCard
        bordered={false}
        bodyStyle={bodyStyle}
        className={styles.LingdongTree}
        loading={loading}
        {...cardProps}
      >
        <Input
          style={{ marginBottom: 8 }}
          suffix={<SearchOutlined />}
          placeholder="请输入关键字"
          onChange={onChange}
        />
        {treeDatas.length !== 0 && (
          <Tree
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            className={styles.tree}
            fieldNames={{
              key: 'id',
              title: 'name',
              children: 'children',
            }}
            showLine
            treeData={treeDatas}
            selectedKeys={sltedKeys}
            onSelect={onSelect}
            {...rest}
          />
        )}
        {treeDatas.length === 0 && (
          <>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无数据'} />
            {onAddClick && (
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={onAddClick}>
                  新增部门根节点
                </Button>
              </div>
            )}
          </>
        )}
      </ProCard>
    );
  },
);

export default SpaceTree;
