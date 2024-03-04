import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Input, Tree } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { IProps, TreeNodeType } from './data.d';
import type { TreeProps } from 'antd/es/tree';
import styles from './style.less';
import { getPhysicalSpaceTree } from './service';
import { ProCard } from '@ant-design/pro-components';
import { storageSy } from '@/utils/Setting';

// 利用递归，获取当前节点及父子点
const getParentList = (id: React.Key, tree: TreeNodeType[]) => {
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

const SpaceTree: React.FC<IProps & TreeProps> = forwardRef(
  ({ onSelectChange, cardProps, deviceType = '', ...rest }, ref) => {
    // deviceType [entrance：门口机；indoor_unit：室内机；central_management：中心机]
    // 门口机：安装位置只允许选择【区】【幢】【单元】空间节点实例
    // 室内机：安装位置只允许选择【室】空间节点实例
    // 中心机不限制
    const spaceTypeEnt = ['PROJECT_STAGE', 'BUILDING', 'UNIT'];
    const spaceTypeUnit = ['ROOM'];
    const bodyStyle = cardProps?.bodyStyle || {
      padding: '25px 10px',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      marginLeft: '77px',
    };
    const [treeData, setTreeData] = useState<TreeNodeType[]>();
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const projectInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
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
      setLoading(true);
      console.log(projectInfo);
      getPhysicalSpaceTree({
        projectBid: projectInfo?.bid,
      }).then((res) => {
        if (res.code === 'SUCCESS') {
          generateList(res.data);
          setTreeData(res.data);
          const expandedKeysa: React.Key[] = dataList
            .filter((item) => item.spaceType === 'BUILDING')
            .map((item) => {
              return getParentKey(item.id, res.data);
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
          setExpandedKeys(expandedKeysa);
        }
        setLoading(false);
      });
    };

    useImperativeHandle(ref, () => {
      return {
        getTreeList,
        getParentList: (id: any) => getParentList(id, treeData as any),
        treeData: treeData,
      };
    });

    //获取树列表
    useEffect(() => {
      // dataList = []
      getTreeList();
    }, [deviceType]);

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
          const disabled = false;
          // if (
          //   (deviceType === 'entrance' && spaceTypeEnt.includes(item.spaceType)) ||
          //   (deviceType === 'indoor_unit' && spaceTypeUnit.includes(item.spaceType))
          // ) {
          //   disabled = false;
          // } else {
          //   disabled = true;
          // }
          // if (deviceType === 'central_management' || deviceType === '') disabled = false;
          if (item.children) {
            return {
              name,
              key: item.id,
              id: item.id,
              spaceType: item.spaceType,
              disabled,
              parentId: item.parentId,
              children: loop(item.children),
            };
          }

          return {
            name,
            key: item.id,
            id: item.id,
            disabled,
            spaceType: item.spaceType,
            parentId: item.parentId,
          };
        });
      return loop(treeData || []);
    }, [searchValue, treeData]);

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
      console.log('selected', selectedKeys, info);
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
        <Tree
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          style={{ height: '540px', overflowY: 'auto' }}
          fieldNames={{
            key: 'id',
            title: 'name',
            children: 'children',
          }}
          showLine
          checkable
          treeData={treeDatas}
          onSelect={onSelect}
          {...rest}
        />
      </ProCard>
    );
  },
);

export default SpaceTree;
