import React, { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Input, Tree, message, Form, Row, Col } from 'antd';
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import {
  getMenu,
  // getMenuDetail,
  getResourceDetail,
  updateResource,
  updateMenu,
  sortAuthResource,
  sortAuthSystem,
} from '@/services/auth';
import style from './style.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';

export default () => {
  const { Search } = Input;
  const [form] = Form.useForm();
  const [defaultData, setDefaultData] = useState<ResourceTreeItemType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [treeDetail, setTreeDetail] = useState<ResourceTreeItemType>();
  const dataList: { id: React.Key; name: string }[] = [];
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [systemApp, setSystemApp] = useState<boolean>(true);
  const [systemAppId, setSystemAppId] = useState<number>(0);

  const gdcTree = async () => {
    const res = await getMenu();
    if (res.code === 'SUCCESS') {
      setDefaultData(res.data);
      setLoading(false);
    }
  };

  const resourceDetail = async (id: number) => {
    const res = await getResourceDetail(id);
    if (res.code === 'SUCCESS') {
      form.setFieldsValue(res.data);
      setTreeDetail(res.data);
    }
  };

  const updateResourceFn = async (values: any) => {
    const res = await updateResource(treeDetail!.id, { ...values });
    if (res.code === 'SUCCESS') {
      message.success(res.message);
      gdcTree();
      resourceDetail(treeDetail!.id);
    }
  };

  const updateMenuFn = async (values: any) => {
    const res = await updateMenu(systemAppId, { ...values });
    if (res.code === 'SUCCESS') {
      message.success(res.message);
      gdcTree();
    }
  };

  const onFinish = async (values: any) => {
    if (systemApp) {
      updateMenuFn(values);
    } else {
      updateResourceFn(values);
    }
  };

  const onExpand = (newExpandedKeys: React.Key[], { node }: any) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
    if (node.systemApp) {
      setTreeDetail(node);
      form.setFieldsValue(node);
      setSystemAppId(node.id);
    } else {
      resourceDetail(node.id);
    }
  };

  const onSelect = (selectedKeys: React.Key[], { node }: any) => {
    setSystemApp(node.systemApp ?? false);
    if (node.systemApp) {
      setTreeDetail(node);
      form.setFieldsValue(node);
      setSystemAppId(node.id);
    } else {
      setTitle(`编辑资源 - ${node.text}`);
      resourceDetail(node.id);
    }
  };

  const getParentKey = (id: React.Key, tree: ResourceTreeItemType[]): React.Key => {
    let parentKey: React.Key;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.id === id)) {
          parentKey = node.id;
        } else if (getParentKey(id, node.children)) {
          parentKey = getParentKey(id, node.children);
        }
      }
    }
    return parentKey!;
  };

  const generateList = (data: ResourceTreeItemType[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { id, text } = node;
      dataList.push({ id, name: text });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(defaultData);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value) {
      const newExpandedKeys = dataList
        .map((item) => {
          if (item.name.indexOf(value) > -1) {
            return getParentKey(item.id, defaultData);
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

  const onSearch = (value: string) => {
    if (value) {
      const newExpandedKeys = dataList
        .map((item) => {
          if (item.name.indexOf(value) > -1) {
            return getParentKey(item.id, defaultData);
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

  useEffect(() => {
    gdcTree();
  }, []);

  const treeData = useMemo(() => {
    const loop = (data: any[]): any[] =>
      data.map((item) => {
        const strTitle = item.text;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const name =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className={style.siteTreeSearchValue}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );
        if (item.children) {
          return {
            ...item,
            name,
            id: item.id,
            key: item.id,
            children: loop(item.children),
            parentBid: item.parentBid,
          };
        }

        return {
          ...item,
          name,
          id: item.id,
          key: item.id,
          parentBid: item.parentBid,
        };
      });
    return loop(defaultData);
  }, [searchValue, defaultData]);

  const onDrop = (info: any) => {
    console.log('info', info);
    const dragNode = info.dragNode;
    const dropNode = info.node;
    console.log(dragNode, dropNode);
    const isSameLevel = (a: any, b: any) => {
      const aLevel = a.props.pos.split('-').length;
      const bLevel = b.props.pos.split('-').length;
      return aLevel === bLevel;
    };

    const isSameParent = (a: any, b: any) => {
      const aLevel = a.props.pos.split('-');
      const bLevel = b.props.pos.split('-');
      aLevel.pop();
      bLevel.pop();
      return aLevel.join('') === bLevel.join('');
    };
    console.log('dragNode, dropNode: ', dragNode, dropNode);

    const canDrop =
      isSameParent(dragNode, dropNode) && isSameLevel(dragNode, dropNode) && info.dropToGap;

    if (!canDrop) {
      return;
    }

    const sameLevel = isSameLevel(dragNode, dropNode);
    const sameParent = isSameParent(dragNode, dropNode);
    if (sameParent && sameLevel) {
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;
      const dropPosition = info.dropPosition;
      const loop = (data: any, key: any, callback: any) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children, key, callback);
          }
        }
      };
      const getNodeByParentBid = (
        data: ResourceTreeItemType[],
        parentBid: string,
        callback: (result: ResourceTreeItemType) => void,
      ) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].parentBid == parentBid) {
            callback(data[i]);
          }
          if (data[i].children) {
            getNodeByParentBid(data[i].children!, parentBid, callback);
          }
        }
      };
      const data = [...treeData];

      // Find dragObject
      let dragObj: ResourceTreeItemType;
      loop(data, dragKey, (item: any, index: any, arr: []) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (info.dropToGap) {
        let ar: any[] = [];
        let i: any;
        loop(data, dropKey, (item: any, index: any, arr: []) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj!);
        } else {
          ar.splice(i + 1, 0, dragObj!);
        }
      }
      const nodeList: ResourceTreeItemType[] = [];
      getNodeByParentBid(data, info.node.parentBid, (result) => {
        nodeList.push(result);
      });
      const ids = nodeList.map((node) => {
        return { id: node.id };
      });
      if (info.node.parentBid === '0') {
        sortAuthSystem(ids);
      } else {
        sortAuthResource(ids);
      }
      setDefaultData(data);
    }
  };
  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <ProCard
            bordered
            className={style.content}
            loading={loading}
            style={{ paddingTop: '4px' }}
          >
            <Search
              style={{ marginBottom: 8 }}
              placeholder="请输入节点名称"
              onSearch={onSearch}
              onChange={onChange}
            />
            <Tree
              draggable
              onDrop={onDrop}
              className={style.customTree}
              onExpand={onExpand}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              treeData={treeData}
              showLine
              fieldNames={{ title: 'name', key: 'id', children: 'children' }}
              titleRender={(node) => {
                return (
                  <div className={style.flexBox}>
                    <div className={style.nodeWrapper}>
                      {node.icon && (
                        <svg className={style.icon} aria-hidden="true">
                          <use xlinkHref={'#' + node.icon} />
                        </svg>
                      )}
                      <span>{node.name}</span>
                    </div>
                  </div>
                );
              }}
            />
          </ProCard>
        </Pane>
        <Pane>
          <ProCard colSpan={17} title={title}>
            {treeDetail && !treeDetail.systemApp ? (
              <ProForm<ResourceTreeItemType>
                form={form}
                className={style.customForm}
                layout="horizontal"
                labelCol={{ flex: '110px' }}
                submitter={{}}
                onFinish={onFinish}
                params={{}}
              >
                <Row>
                  <Col span={12}>
                    <ProFormText
                      width="md"
                      name="cnName"
                      label="中文名称"
                      placeholder="请输入名称"
                      rules={[{ required: true }]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      width="md"
                      name="enName"
                      label="英文名称"
                      placeholder="请输入名称"
                      rules={[{ required: true }]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText name="url" width="md" label="URL" placeholder="请输入名称" />
                  </Col>
                  <Col span={12}>
                    <ProFormText name="icon" width="md" label="图标" placeholder="请输入名称" />
                  </Col>
                </Row>
              </ProForm>
            ) : (
              ''
            )}
          </ProCard>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};
