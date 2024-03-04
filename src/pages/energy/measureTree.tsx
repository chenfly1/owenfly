import { ProCard, ProCardProps } from '@ant-design/pro-components';
import { Input, Tree } from 'antd';
import { useInitState } from '@/hooks/useInitState';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { EventDataNode } from 'antd/lib/tree';

export default (
  props: ProCardProps & {
    select?: (data?: MeasureTreeType) => void;
    rootStyle?: React.CSSProperties;
  },
) => {
  const [source, setSource] = useState([] as MeasureTreeType[]);
  const [selectedNode, setSelectedNode] = useState<MeasureTreeType>();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { measureTree } = useInitState('useEnergy', ['measureTree']);

  /** 获取计量位置树 */
  const getTreeData = (data: MeasureTreeType[] = [], searchKey = '') => {
    const res: MeasureTreeType[] = [];
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const { children, ...rest } = data[i];
      if (children) {
        const match = getTreeData(children, searchKey);
        if (match?.length) {
          res.push({ ...rest, children: match });
          continue;
        }
      }
      if (!searchKey || rest.title.indexOf(searchKey) > -1) {
        res.push({ ...rest, children: [] });
      }
    }
    return res;
  };

  /** 筛选数据 */
  const search = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const data = getTreeData(measureTree.value, value);
    setSource(data);
  }, 500);

  /** 获取指定树节点 */
  const matchNode = (data: MeasureTreeType[] = [], key = ''): MeasureTreeType | undefined => {
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const { children, ...rest } = data[i];
      if (rest.key === key) return data[i];
      if (children) {
        const res = matchNode(children, key);
        if (res) return res;
      }
    }
  };

  /** 设置展开节点 */
  const expendHandler = (node: EventDataNode<MeasureTreeType>) => {
    setExpandedKeys(
      expandedKeys.includes(node.key)
        ? expandedKeys.filter((item) => item !== node.key)
        : [node.key].concat(expandedKeys),
    );
  };

  useEffect(() => {
    if (!measureTree.loading) {
      setSource(measureTree.value);
      // 判断选中节点是否存在
      if (selectedNode) {
        const match = matchNode(measureTree.value, selectedNode.key);
        if (match) {
          return props.select?.(match);
        }
      }
      const node = measureTree.value?.[0];
      props.select?.(node);
      setSelectedNode(node);
      // 优化展开交互
      setTimeout(() => setExpandedKeys([node?.key]));
    }
  }, [measureTree.loading]);

  return (
    <ProCard {...props} loading={!measureTree.inited}>
      <Input
        style={{ marginBottom: 10 }}
        suffix={<SearchOutlined />}
        placeholder="请输入关键字"
        onChange={search}
      />
      <Tree
        showLine={true}
        treeData={source}
        blockNode={true}
        expandedKeys={expandedKeys}
        selectedKeys={selectedNode !== undefined ? [selectedNode.key] : []}
        onSelect={(_, { node }) => {
          expendHandler(node);
          setSelectedNode(node);
          return props.select?.(node);
        }}
        onExpand={(_: any, { node }) => {
          expendHandler(node);
        }}
        rootStyle={
          props?.rootStyle ?? {
            height: 'calc(100vh - 170px)',
            overflow: 'scroll',
          }
        }
      />
    </ProCard>
  );
};
