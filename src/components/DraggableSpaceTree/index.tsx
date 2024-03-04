import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Input, Tree, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { IProps, TreeNodeType } from './data';
import type { DataNode, TreeProps } from 'antd/es/tree';
import styles from './style.less';
import { getMonitoringSpaceTree, getPhysicalSpaceTree, updateSpaceTree } from './service';
import { ProCard } from '@ant-design/pro-components';

const getParentKey = (id: React.Key, tree: TreeNodeType[]): React.Key => {
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
function getPathById(tree: TreeNodeType[], id: React.Key, path: string[]): any {
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

const dataList: { id: React.Key; name: string; spaceType: string }[] = [];

// 垂类项目数据
const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

const SpaceTree: React.FC<IProps & TreeProps> = forwardRef(
  (
    {
      projectBid = project?.bid,
      filterSpaceTypes,
      onSelectChange,
      cardProps,
      mode,
      treeLoadComplate,
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
    const axiosByType = async function (): Promise<ResultData<TreeNodeType[]>> {
      if (mode === 'monitoring') {
        // 安防模块请求接口
        return getMonitoringSpaceTree({
          projectBid: projectBid,
          mobileUserType: 'B_SIDE',
        });
      } else {
        return getPhysicalSpaceTree({
          projectBid: projectBid,
          filterSpaceTypes: filterSpaceTypes,
        });
      }
    };

    const getTreeList = () => {
      if (projectBid) {
        setLoading(true);

        axiosByType().then((res) => {
          if (res.code === 'SUCCESS') {
            if (treeLoadComplate) {
              treeLoadComplate!(res.data);
            }
            generateList(res.data);
            setTreeData(res.data);
            if (expandedKeys.length > 0) {
              setExpandedKeys(expandedKeys);
            } else {
              const expandedKeysa: React.Key[] = dataList
                .filter((item) => item.spaceType === 'BUILDING')
                .map((item) => {
                  return getParentKey(item.id, res.data);
                })
                .filter((item, i, self) => item && self.indexOf(item) === i);
              setExpandedKeys(expandedKeysa);
            }
          }
          setLoading(false);
        });
      }
    };

    const updateTree = async (
      parentId: string,
      id: string,
      name: string,
      spaceType: string,
      updateSpaceCmds: any[],
    ) => {
      await updateSpaceTree(id, {
        parentId,
        name,
        spaceType,
        updateSpaceCmds,
        projectBid,
        isAddSpaceTypeName: false,
      });
    };

    useImperativeHandle(ref, () => {
      return {
        getTreeList,
        treeData: treeData,
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
              rowName: item.name,
              key: item.id,
              id: item.id,
              spaceType: item.spaceType,
              parentId: item.parentId,
              spaceImgUrl: item.spaceImgUrl,
              sort: item.sort,
              children: loop(item.children),
            };
          }

          return {
            name,
            key: item.id,
            id: item.id,
            spaceType: item.spaceType,
            parentId: item.parentId,
            spaceImgUrl: item.spaceImgUrl,
            sort: item.sort,
          };
        });
      console.log('updateTree', treeData);
      return loop(treeData || []);
    }, [searchValue, treeData]);

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
      setSltKeys(selectedKeys);
      const path = getPathById(treeData || [], selectedKeys[0], []);
      if (onSelectChange) onSelectChange(selectedKeys, info, path);
    };

    const levelMatch = {
      PROJECT: ['PROJECT_STAGE', 'BUILDING', 'ROOM', 'PUBLIC_AREA'],
      PROJECT_STAGE: ['BUILDING', 'ROOM', 'PUBLIC_AREA'],
      BUILDING: ['UNIT', 'FLOOR', 'ROOM', 'PUBLIC_AREA'],
      UNIT: ['FLOOR', 'ROOM', 'PUBLIC_AREA'],
      FLOOR: ['ROOM', 'PUBLIC_AREA'],
      PUBLIC_AREA: ['PUBLIC_AREA'],
    };

    const treeLoop = (
      data: any[],
      id: React.Key,
      callback: (node: any, i: number, data: any[]) => void,
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          treeLoop(data[i].children!, id, callback);
        }
      }
    };

    const isDropable = (info: any) => {
      const dragNode = info.dragNode;

      console.log('isDropableInfo', info);

      let parent: any = null;

      if (info.dropToGap) {
        treeLoop(treeData!, info.node.parentId, (item, _index, _arr) => {
          parent = item;
        });
      } else {
        treeLoop(treeData!, info.node.id, (item, _index, _arr) => {
          parent = item;
        });
      }

      // TODO: 跨级拖拽
      // if (levelMatch[parent!.spaceType]?.includes(dragNode.spaceType)) {
      //   return parent;
      // }
      // return null;

      if (dragNode.parentId === parent.id) {
        return parent;
      }
      return null;
    };

    const onDrop: TreeProps['onDrop'] = (info: any) => {
      const parentNode = isDropable(info);

      if (!parentNode) {
        message.error('不允许拖拽到该节点下');
        return;
      }

      console.log('onDropInfo', info);
      console.log('parentNode', parentNode);

      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

      const data = [...treeData!];

      let dragObj: any;
      treeLoop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        treeLoop(data, dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
        dragObj.parentId = dropKey;
      } else if (
        ((info.node as any).props.children || []).length > 0 &&
        (info.node as any).props.expanded &&
        dropPosition === 1
      ) {
        treeLoop(data, dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
        dragObj.parentId = parentNode.id;
      } else {
        let ar: DataNode[] = [];
        let i: number;
        treeLoop(data, dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i!, 0, dragObj!);
        } else {
          ar.splice(i! + 1, 0, dragObj!);
        }
        dragObj.parentId = parentNode.id;
      }

      console.log('onDropSuccess', data);

      setTreeData(data);

      updateTree(
        parentNode.id,
        dragObj.id,
        dragObj.name,
        dragObj.spaceType,
        parentNode.children.map((item: any, index: number) => ({
          id: item.id,
          name: item.name,
          sort: index,
        })),
      );
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
          // addonBefore={schemaId ? null : selectBefore}
          suffix={<SearchOutlined />}
          placeholder="请输入关键字"
          onChange={onChange}
        />
        <Tree
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          fieldNames={{
            key: 'id',
            title: 'name',
            children: 'children',
          }}
          showLine
          draggable
          blockNode
          treeData={treeDatas}
          selectedKeys={sltedKeys}
          onSelect={onSelect}
          onDrop={onDrop}
          {...rest}
        />
      </ProCard>
    );
  },
);

export default SpaceTree;
