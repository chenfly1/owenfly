import React, { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, DeleteTwoTone, ExclamationCircleFilled } from '@ant-design/icons';
import { Input, Tree, message, Form, Row, Col, Button, Modal } from 'antd';
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import {
  getGdcAllTree,
  getGdcTreeDetail,
  updateGdcTree,
  updateResource,
  registerGdcTree,
  gdcAuthority,
  delResource,
  sortWpsSystem,
  sortWpsResource,
  delateApplication,
} from '@/services/wps';
import style from './style.less';
import { ProFormSelect } from '@ant-design/pro-form';
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';

export default () => {
  const { Search } = Input;
  const [form] = Form.useForm();
  const [defaultData, setDefaultData] = useState<ApplicationItemType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [treeDetail, setTreeDetail] = useState<ApplicationItemType>();
  const dataList: { id: React.Key; name: string }[] = [];
  const [title, setTitle] = useState<string>('');
  const [isAdd, setIsAdd] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [systemAppId, setSystemAppId] = useState<string>('');
  const [showAuthAndCode, setShowAuthAndCode] = useState<boolean>(false);

  const gdcTree = async () => {
    setLoading(true);
    const res = await getGdcAllTree();
    if (res.code === 'SUCCESS') {
      setDefaultData(res.data);
      setLoading(false);
    }
  };

  const getDetail = async (id: number) => {
    const res = await getGdcTreeDetail(id);
    if (res.code === 'SUCCESS') {
      form.setFieldsValue(res.data);
      setTreeDetail(res.data);
    }
  };

  const updateTree = async (values: any) => {
    const res = await updateGdcTree(treeDetail!.id, { ...values });
    if (res.code === 'SUCCESS') {
      message.success(res.message);
      gdcTree();
      getDetail(treeDetail!.id);
    }
  };

  const updateTreeR = async (values: any) => {
    const res = await updateResource(treeDetail!.id, { ...values });
    if (res.code === 'SUCCESS') {
      message.success(res.message);
      gdcTree();
    }
  };

  const register = async (values: any) => {
    const res = await registerGdcTree(values);
    if (res.code === 'SUCCESS') {
      message.success(res.message);
      gdcTree();
    }
  };

  const handleDel = async (node: any, e: Event) => {
    console.log('node: ', node);
    const isApplication = node.parentBid === '0';
    e.stopPropagation();
    Modal.confirm({
      title: '提示',
      content: isApplication ? '确定删除该资源吗？' : '确定删除该应用吗？',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        const res = isApplication
          ? await delateApplication({ id: node.id })
          : await delResource(node.id);
        if (res.code === 'SUCCESS') {
          message.success(res.message);
          gdcTree();
          form.resetFields();
        }
      },
    });
  };

  const getParentKey = (id: React.Key, tree: any[]): React.Key => {
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

  const getUuid = () => {
    const s: any[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 32; i++) {
      const dic = Math.floor(Math.random() * 0x10);
      s[i] = hexDigits.slice(dic, dic + 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.slice((s[19] & 0x3) | 0x8, ((s[19] & 0x3) | 0x8) + 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23];
    const uuid = s.join('');
    return uuid;
  };

  const onFinish = async (values: any) => {
    values.authority =
      typeof values.authority === 'object' ? values.authority.value : values.authority;
    if (values.type === 'menu') {
      values.authority = getUuid();
      values.code = getUuid();
    }
    if (isAdd) {
      register({
        ...values,
        systemBid: treeDetail?.systemBid,
        parentBid: treeDetail?.parentBid === '0' ? 0 : treeDetail?.bid,
      });
    } else {
      if (systemAppId) {
        updateTreeR(values);
      } else {
        updateTree(values);
      }
    }
  };

  const onExpand = (newExpandedKeys: React.Key[], { node }: any) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
    if (node.parentBid !== '0') {
      getDetail(node.id);
    }
  };

  const onSelect = async (selectedKeys: React.Key[], { node }: any) => {
    setIsAdd(false);
    setShowAuthAndCode(node.type === 'menu' ? false : true);
    if (node.parentBid !== '0') {
      await getDetail(node.id);
      setSystemAppId('');
      setTitle('编辑资源' + ' - ' + node.text);
    } else {
      form.resetFields();
      form.setFieldsValue(node);
      setTreeDetail(node);
      setSystemAppId(node.id);
    }
  };

  const generateList = (data: any[]) => {
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

  const addMenu = (node: any, e: Event) => {
    setTitle('新增资源');
    form.resetFields();
    setTreeDetail(node);
    setSystemAppId('');
    setIsAdd(true);
    e.stopPropagation();
  };

  useEffect(() => {
    gdcTree();
  }, []);

  const treeData = useMemo(() => {
    const loop = (data: ApplicationItemType[]): any[] =>
      data.map((item) => {
        const strTitle = item.text || '';
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
        sortWpsSystem(ids);
      } else {
        sortWpsResource(ids);
      }
      setDefaultData(data);
    }
  };
  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'400px'} maxSize="50%">
          <ProCard bordered className={style.content} loading={loading}>
            <Search
              style={{ marginBottom: 8 }}
              placeholder="请输入节点名称"
              onSearch={onSearch}
              onChange={onChange}
            />
            <Tree
              className={style.customTree}
              draggable
              onDrop={onDrop}
              onExpand={onExpand}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              treeData={treeData}
              showLine
              blockNode
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
                    <div className={style.actionWrapper}>
                      {node.type === 'menu' ? (
                        <Button
                          type="link"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={(e: any) => addMenu(node, e)}
                        />
                      ) : (
                        <div style={{ width: '24px', height: '24px' }} />
                      )}
                      <Button
                        type="link"
                        size="small"
                        icon={
                          <DeleteTwoTone
                            twoToneColor="#fa5152"
                            onClick={(e: any) => handleDel(node, e)}
                          />
                        }
                      />
                    </div>
                  </div>
                );
              }}
            />
          </ProCard>
        </Pane>

        <Pane>
          <ProCard colSpan={17} title={title}>
            {treeDetail && !systemAppId ? (
              <ProForm<ApplicationItemType>
                form={form}
                className={style.customForm}
                layout="horizontal"
                labelCol={{ flex: '110px' }}
                submitter={{}}
                onFinish={onFinish}
                params={{}}
              >
                {systemAppId ? (
                  <>
                    <Row>
                      <Col span={12}>
                        <ProFormText name="icon" width="md" label="图标" placeholder="请输入名称" />
                      </Col>
                      <Col span={12}>
                        <ProFormText name="url" width="md" label="URL" placeholder="请输入名称" />
                      </Col>
                    </Row>
                  </>
                ) : (
                  <>
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
                    </Row>
                    {showAuthAndCode ? (
                      <Row>
                        <Col span={12}>
                          <ProFormSelect.SearchSelect
                            name="authority"
                            width="md"
                            label="资源编号"
                            mode="single"
                            placeholder="请输入名称"
                            fieldProps={{
                              optionItemRender(item: {
                                value: string;
                                label: string;
                                name: string;
                              }) {
                                return item.name + ' - ' + item.value;
                              },
                              onChange(value: { value: string; label: string; name: string }) {
                                if (value) {
                                  form.setFieldValue(
                                    'code',
                                    `${treeDetail.systemCode}_${value.value}` || '',
                                  );
                                }
                              },
                              onClear() {
                                form.setFieldValue('code', '');
                              },
                            }}
                            request={async ({ keyWords = '' }) => {
                              const res = await gdcAuthority({ key: keyWords });
                              return res.data.map((item) => ({
                                value: item.authorityCode,
                                label: item.authorityCode,
                                name: item.authorityName,
                              }));
                            }}
                            rules={[{ required: true }]}
                          />
                        </Col>
                        <Col span={12}>
                          <ProFormText
                            width="md"
                            name="code"
                            label="code"
                            placeholder="请输入code"
                            rules={[{ required: true }]}
                          />
                        </Col>
                      </Row>
                    ) : (
                      ''
                    )}
                    <Row>
                      <Col span={12}>
                        <ProFormText name="url" width="md" label="URL" placeholder="请输入名称" />
                      </Col>
                      <Col span={12}>
                        <ProFormText name="icon" width="md" label="图标" placeholder="请输入名称" />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <ProFormSelect
                          name="type"
                          width="md"
                          label="资源类型"
                          placeholder="请输入名称"
                          rules={[{ required: true }]}
                          options={[
                            {
                              label: '菜单',
                              value: 'menu',
                            },
                            {
                              label: '按钮',
                              value: 'function',
                            },
                          ]}
                          fieldProps={{
                            onChange(value) {
                              setShowAuthAndCode(value === 'menu' ? false : true);
                            },
                          }}
                        />
                      </Col>
                    </Row>
                  </>
                )}
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
