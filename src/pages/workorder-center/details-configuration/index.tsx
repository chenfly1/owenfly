/* eslint-disable @typescript-eslint/no-shadow */
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';
import { PageContainer } from '@ant-design/pro-layout'; // 引入布局组件
import { Input, Tree, Switch, Modal, message, Form } from 'antd';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import React, { Key, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style.less';
import { Access, useAccess } from 'umi';
import ProjectSelect from './ProjectSelect';
import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import AddModelForm from './add';
import {
  ticketType,
  userWorkUserDelete,
  workUserQueryA,
  modifyCustomizeByCategory,
  getWorkorderCategoryDetail,
} from '@/services/workorder';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { storageSy } from '@/utils/Setting';
import ActionGroup from '@/components/ActionGroup';

// 树形控件
const { Search } = Input;

const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: DataNode[] | undefined) => {
  if (data !== undefined) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key, title } = node;
      dataList.push({ key, title: title as string });
      if (node.children) {
        generateList(node.children);
      }
    }
  }
};

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};
// 树形控件end

// 表单

// 表单end

const WorkorderConfiguration: React.FC = () => {
  // 树形控件
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const actionRef = useRef<ActionType>(); // 创建一个ref，用于操作表格

  const [contentTitle, setContentTitle] = useState<string>(''); //标题
  const [showSwitch, setShowSwitch] = useState<boolean>(true);
  const [cascaderOptions, setCascaderOptions] = useState<any>();
  const [showBtn, SetShowBtn] = useState<boolean>(true); //显示隐藏
  const [switchA, setSwitch] = useState<boolean>(false); //控制选项
  const access = useAccess();

  // 表单
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));

  const [projectBid, setProjectBid] = useState<string>(project ? project.bid : '');
  const [parentId, setParentId] = useState<string>('1');

  //查询用户关系接口
  const workUserList = async (params: Record<string, any>) => {
    const hash = window.location.hash;
    const param = hash.substring(1);
    const msg = await workUserQueryA({
      ...params,

      categoryId: param || parentId,
      projectId: projectBid,
    });
    if (msg.code === 'SUCCESS') {
      const res = msg.data.items;
      res.forEach((item: { key: number | string; id: number | string }) => {
        item.key = item.id;
      });
      setDataSource(res);
    }
    return {
      data: msg.data.items,
      success: true,
      total: msg.data.page.totalItems,
    };
  };
  //获取详情列表
  const getWorkorder = async (id: string) => {
    const res = await getWorkorderCategoryDetail(id || parentId, projectBid);

    setTimeout(() => {
      if (res.data?.customUser === 1) {
        setSwitch(true);
        SetShowBtn(false);
      } else if (res.data?.customUser === 0) {
        setSwitch(false);
        SetShowBtn(true);
      }
    }, 0);

    // setCustomUser(res.data?.customUser);
  };

  //处理数据

  const appendProperties = (data: any): any[] => {
    return data.map((item: { [x: string]: any; id: any; name: any; childList: any }) => {
      const { id, name, childList, ...rest } = item;
      const key = id.toString();
      const title = name;
      const children = appendProperties(childList);
      return { id, name, childList, key, title, children, ...rest };
    });
  };

  //获取树形数据
  const fetchCascaderOptions = async () => {
    try {
      const msg = await ticketType({
        parentId: 0,
        projectBid: projectBid,
      });
      const res = appendProperties(msg.data);
      setCascaderOptions(res);
      console.log('获取树形数据', res);
    } catch (error) {}
  };
  generateList(cascaderOptions);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, cascaderOptions);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys as React.Key[]);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const treeData = useMemo(() => {
    const loop = (data: DataNode[] | undefined): DataNode[] => {
      if (data !== undefined) {
        return data.map((item) => {
          const strTitle = item.title as string;
          const index = strTitle.indexOf(searchValue);
          const beforeStr = strTitle.substring(0, index);
          const afterStr = strTitle.slice(index + searchValue.length);
          const title =
            index > -1 ? (
              <span>
                {beforeStr}
                <span className={styles.SiteTreeSearchValue}>{searchValue}</span>
                {afterStr}
              </span>
            ) : (
              <span>{strTitle}</span>
            );
          if (item.children) {
            return { title, key: item.key, children: loop(item.children) };
          }

          return {
            title,
            key: item.key,
          };
        });
      } else {
        return [];
      }
    };

    return loop(cascaderOptions);
  }, [searchValue, cascaderOptions]);

  // 修改按类别定制
  const putCategory = async (id: number, number: number) => {
    const res = await modifyCustomizeByCategory({
      id: id,
      projectId: projectBid,
      customUser: number,
    });
    if (res.code === 'SUCCESS') {
      actionRef.current?.reload();
    }
  };

  const handleSelect = (
    //树状节点
    selectedKeys: Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode<DataNode>;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    },
  ) => {
    // 绑定标题
    if (React.isValidElement(info.node.title)) {
      const { children } = info.node.title.props;
      if (Array.isArray(children)) {
        setContentTitle(children[children.length - 1]);
      } else {
        setContentTitle(children);
      }
    }

    const { node } = info;
    if (node.children && node.children.length > 0) {
      // console.log('当前点击的是一级节点:', info);
      // workUserList(Number(info.node.key));
      SetShowBtn(false);
      setShowSwitch(true);
      window.location.hash = `${info.node.key}`;
      // setParentId(`${info.node.key}`);

      actionRef.current?.reload();
    } else {
      // console.log('当前点击的是二级节点:', info);

      setShowSwitch(false);
      window.location.hash = `${info.node.key}`;
      getWorkorder(`${info.node.key}`);
      // workUserList(Number(info.node.key));
      // setParentId(`${info.node.key}`);

      actionRef.current?.reload();
    }
  };

  // 树形控件end

  //批量删除
  const start = () => {
    if (selectedRowKeys.length === 0) {
      message.info('请勾选行数据');
    } else {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定删除吗？',
        cancelText: '取消',
        okText: '确定',
        centered: true,
        onOk: async () => {
          const res = await userWorkUserDelete({
            ids: selectedRowKeys,
          });
          console.log('resDDDD', res);
          // "message": "success",
          if (res.code === 'SUCCESS') {
            message.success('删除成功');
            const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item.key));
            setDataSource(newDataSource);
            setSelectedRowKeys([]);
            actionRef.current?.reload();
          }
        },
      });
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const reload = () => {
    // 每次调用 handleRefresh 时，更新 refreshKey 的值，触发组件刷新
    setRefreshKey((prevKey) => prevKey + 1);

    // 获取key
    const hash = window.location.hash;
    const param = hash.substring(1);
    // 获取key end
    setTimeout(() => {
      actionRef.current?.reload();
      console.log('刷新');
    }, 500);
  };

  // 表单end

  // 滑动
  const onChangeSwitch = () => {
    if (!switchA) {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定开启吗？',
        cancelText: '取消',
        okText: '确定',

        centered: true,
        onOk: () => {
          SetShowBtn(false);
          // 获取key
          const hash = window.location.hash;
          const param = hash.substring(1);
          console.log('hash', param);
          // 获取key end
          putCategory(Number(param), 1);

          // workUserList(Number(param));

          setSwitch(true);
        },
        onCancel: () => {
          SetShowBtn(true);
          setSwitch(false);
        },
      });
    } else {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定取消吗？',
        cancelText: '取消',
        okText: '确定',
        centered: true,
        onOk: () => {
          SetShowBtn(true);
          // 获取key
          const hash = window.location.hash;
          const param = hash.substring(1);
          console.log('hash', param);
          // 获取key end
          putCategory(Number(param), 0);

          // workUserList(Number(param));
          setSwitch(false);
        },
        onCancel: () => {
          SetShowBtn(false);
          setSwitch(true);
        },
      });
    }
  };
  //滑动 end

  useEffect(() => {
    const hash = window.location.hash;
    const param = hash.substring(1);
    fetchCascaderOptions();
    getWorkorder(param);
  }, [projectBid]);

  const handleChange = (bid: string) => {
    setProjectBid(bid);
    console.log('projectBid', projectBid);
    // setParentId(bid);
    actionRef.current?.reload();
  };

  const columns: any = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInTable: true,
      order: 7,
      renderFormItem: () => {
        return <ProjectSelect name="projectId" handleChange={handleChange} />;
      },
    },
    {
      title: '用户账号',
      dataIndex: 'account',
      ellipsis: true,
      width: 160,
      hideInSearch: true,
    },
    {
      title: '用户姓名',
      dataIndex: 'userName',
      ellipsis: true,
      width: 160,
      hideInSearch: true,
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
      ellipsis: true,
      width: 160,
      hideInSearch: true,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      ellipsis: true,
      width: 160,
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px' }}>
            <Search
              style={{ marginBottom: 8, width: 280 }}
              placeholder="搜索"
              onChange={onChange}
            />
            <Tree
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              showLine
              treeData={treeData}
              onSelect={handleSelect}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<DataType>
            key={refreshKey}
            actionRef={actionRef}
            cardBordered
            form={{
              colon: false,
            }}
            tableAlertRender={false}
            rowSelection={rowSelection}
            columns={columns as any}
            className={styles.tableStyle}
            // dataSource={dataSource}
            size="middle"
            request={parentId ? workUserList : undefined}
            search={
              {
                labelWidth: 78,
                labelAlign: 'left',
              } as any
            }
            pagination={{
              showSizeChanger: true,
            }}
            headerTitle={
              <ActionGroup
                scene="tableHeader"
                selection={{
                  count: selectedRowKeys.length,
                }}
                actions={[
                  {
                    key: 'batchel',
                    text: '批量删除',
                    accessKey: 'alitaMasdata_deleteWorkorderCategoryUserRef',
                    hidden: showBtn,
                    onClick: start,
                  },
                  {
                    key: 'batchIC',
                    text: 'showSwitch',
                    hidden: showSwitch,
                    render: (
                      <Form.Item
                        label="按类型定制"
                        style={{ marginBottom: 0 }}
                        tooltip={{
                          title:
                            '工单二级分类的处理人默认从一级分类中沿用，如需要对二级分类进行处理人特殊配置，请打开“按类型定制”开关',
                          icon: <InfoCircleOutlined />,
                        }}
                      >
                        <Switch
                          defaultChecked={false}
                          onChange={onChangeSwitch}
                          checked={switchA}
                        />
                      </Form.Item>
                    ),
                  },
                ]}
              />
            }
            toolBarRender={() => [
              <div key="add" hidden={showBtn}>
                <Access
                  accessible={access.functionAccess('alitaMasdata_addWorkorderCategoryUserRefList')}
                >
                  <AddModelForm onSubmit={reload} data={projectBid} />
                </Access>
              </div>,
            ]}
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default WorkorderConfiguration;
