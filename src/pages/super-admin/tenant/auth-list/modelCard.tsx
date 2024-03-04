import { getModuleAllList, updateBatch } from '@/services/wps';
import { ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import { Input, Button, Drawer, Tree, Modal, message, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './style.less';

const { confirm } = Modal;

type IProps = {
  modalVisit: boolean;
  code: string;
  tenantId: string;
  onOpenChange: () => void;
};

let dataList: { key: React.Key; title: string }[] = [];

const ModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, tenantId, code } = props;
  const [defaultData, setDefaultData] = useState<ApplicationItemType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  let keys: React.Key[] = [];
  let expandedList: React.Key[] = [];

  const generateList = (data: ApplicationItemType[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      expandedList.push(node.id);
      if (node.parentBid !== '0') {
        node.checkable = true;
      } else {
        node.checkable = false;
      }
      if (node.state === 'NORMAL' && node.parentBid !== '0') {
        keys.push(node.id);
        node.disabled = true;
      }
      const { id } = node;
      dataList.push({ key: id, title: node.text });
      if (node.children) {
        generateList(node.children);
      }
    }
  };

  const gdcTree = async () => {
    const res = await getModuleAllList({ tenantId: code });
    if (res.code === 'SUCCESS') {
      generateList(res.data);
      setDefaultData(res.data);
      setCheckedKeys(keys);
      // setExpandedKeys(expandedList);
    }
  };

  useEffect(() => {
    if (code) gdcTree();
  }, [code]);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checked: any) => {
    console.log(checked);
    setCheckedKeys(checked);
  };

  const getParentKey = (key: React.Key, tree: ApplicationItemType[]): React.Key => {
    let parentKey: React.Key;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey!;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value) {
      const newExpandedKeys = dataList
        .map((item) => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, defaultData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setSearchValue(value);
      setAutoExpandParent(true);
    } else {
      setExpandedKeys([]);
      setSearchValue(value);
      setAutoExpandParent(false);
    }
  };

  const treeData = useMemo(() => {
    const loop = (data: ApplicationItemType[]): any =>
      data.map((item: ApplicationItemType) => {
        const strText = item.text as string;
        const index = strText.indexOf(searchValue);
        const beforeStr = strText.substring(0, index);
        const afterStr = strText.slice(index + searchValue.length);
        const text =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className={styles.siteTreeSearchValue}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strText}</span>
          );
        if (item.children) {
          return { ...item, text, id: item.id, children: loop(item.children) };
        }

        return {
          ...item,
          text,
          id: item.id,
        };
      });

    return loop(defaultData);
  }, [searchValue, defaultData]);

  const onFinish = async () => {
    try {
      confirm({
        icon: <ExclamationCircleFilled />,
        title: '开通应用',
        content: <p>提交后，该租户的应用授权即刻生效，请谨慎操作</p>,
        okText: '确认提交',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          const paramsList: { state: string; tenantId: string; id: number }[] = [];
          checkedKeys.forEach((i) => {
            // 只提交打开的数据
            paramsList.push({ state: 'NORMAL', tenantId: tenantId, id: i as any });
          });
          const res = await updateBatch(paramsList);
          if (res.code === 'SUCCESS') {
            message.success('提交成功');
            dataList = [];
            expandedList = [];
            keys = [];
            gdcTree();
            onOpenChange();
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } catch {
      // console.log
    }
  };

  return (
    <Drawer
      onClose={onOpenChange}
      title="批量授权"
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            key="back"
            onClick={() => {
              onOpenChange();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            key="ok"
            onClick={() => {
              onFinish();
            }}
          >
            提交
          </Button>
        </Space>
      }
      open={modalVisit}
      width={500}
    >
      <Input
        style={{ marginBottom: 8 }}
        placeholder="请输入关键字"
        suffix={<SearchOutlined />}
        onChange={onChange}
      />
      <Tree
        checkable
        className={styles.customTree}
        onExpand={onExpand}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
        showLine
        fieldNames={{ title: 'text', key: 'id', children: 'children' }}
      />
    </Drawer>
  );
};

export default ModelForm;
