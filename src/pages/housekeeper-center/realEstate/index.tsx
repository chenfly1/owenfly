import { PageContainer } from '@ant-design/pro-layout';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import styles from './style.less';
import { ActionType, ProColumns } from '@ant-design/pro-components'; // 引入一些类型定义
import { Access, history, useAccess } from 'umi'; // 引入umi的一些组件和方法
import ProjectSelect from './ProjectSelect';

import { ProTable } from '@ant-design/pro-components'; // 引入表格组件
import { Button, Dropdown, Input, Modal, Space, Tree, message } from 'antd'; // 引入一些常用的组件
import { CaretDownOutlined, ExclamationCircleFilled } from '@ant-design/icons'; // 引入icon
import { Key, useEffect, useMemo, useRef, useState } from 'react';

import AddModelForm from './addEdit';
import AddDele from './addDele';
import AddStop from './addStop';

import { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import { getPhysicalSpaceTree } from './service';
import { storageSy } from '@/utils/Setting';
import { batchGolive, butlerPageQuery, deleteHousekeeper, golive } from '@/services/housekeeper';

// 表单

// 表单end

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

interface Node {
  title: string;
  key: any;
  parentId: string | number;
  spaceType: string;
  children?: Node[];
}
const findTitleByKey = (key: any, data: Node[]): Node | null => {
  for (const item of data) {
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      const result = findTitleByKey(key, item.children);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const findTopLevelTitleByKey = (key: any, data: Node[]): string | null => {
  let node = findTitleByKey(key, data);
  while (node && node.parentId !== 0) {
    node = findTitleByKey(node.parentId + '', data);
  }
  return node ? node.title : null;
};

// 树形控件end

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); //表单多选中的行的key列表(选中的行key列表) 或者选中的行的索引列表(选中的
  const [dataSource, setDataSource] = useState<butlerPageType[]>([]); //表单数据
  const actionRef = useRef<ActionType>(); // 创建一个ref，用于操作表格
  const access = useAccess();

  const [addModalVisit, setAddModalVisit] = useState<boolean>(false); // 创建一个状态，用于控制添加模型的弹框的显示隐藏
  const [editData, setEditData] = useState<any>(); // 创建一个状态，用于控制编辑模型的弹框的数据

  const [open, setOpen] = useState<boolean>(false); //删除弹窗
  const [openA, setOpenA] = useState<boolean>(false); //停用弹窗

  const [deleHousekeeper, setDeleHousekeeper] = useState<any>();
  const [projectName, setProjectName] = useState<any>(project?.name);

  const [projectBid, setProjectBid] = useState<string>(project ? project.bid : '');

  const [parentId, setParentId] = useState<any>('');
  const [spaceType, setSpaceType] = useState<string>(project ? 'PROJECT' : '');
  // 树形控件
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [cascaderOptions, setCascaderOptions] = useState<any>();

  const handleChange = (bid: string, name: any) => {
    // console.log('123123', name.name);
    setProjectName(name?.name);
    setProjectBid(bid);

    setSpaceType('PROJECT');
    // actionRef.current?.reload();
  };

  const reload = () => {
    actionRef.current?.reload(); // 通过ref操作表格组件的reload方法
  };
  // 创建表格页面的模型
  const columns: ProColumns<butlerPageType>[] = [
    // 创建表格的列配置
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 140,
      order: 8,
      ellipsis: true, // 文字超出省略
      hideInSearch: true,
      render: (text, record) => {
        // const title = findTopLevelTitleByKey(record.spaceId, cascaderOptions);
        // console.log(title); // 输出：KE项目
        // return <>{title}</>;
        return <>{projectName}</>;
      },
    },
    {
      title: '房间简称',
      dataIndex: 'spaceName',
      width: 170,
      order: 8,
      ellipsis: true,
      hideInSearch: true,
    },

    {
      title: '管家名称',
      dataIndex: 'name',
      width: 130,
      order: 7,
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 130,
      order: 6,
      ellipsis: true,
      hideInSearch: true,
      render: (text, record) => {
        let genderText = '';
        if (record.sex === 0) {
          genderText = '女';
        } else if (record.sex === 1) {
          genderText = '男';
        } else {
          genderText = '-';
        }
        return <>{genderText}</>;
      },
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 130,
      order: 5,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建人账号',
      dataIndex: 'creatorAccount',
      width: 160,
      order: 4,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建人名称',
      dataIndex: 'creator',
      width: 160,
      order: 3,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      width: 160,
      order: 2,
      ellipsis: true,
      hideInSearch: true,
      sorter: (a, b) => (a.gmtCreated > b.gmtCreated ? 1 : -1),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      order: 1,
      ellipsis: true,
      hideInSearch: true,
      render: (text, record) => {
        let genderText = '';
        if (record.status === 0) {
          genderText = '停用';
        } else if (record.status === 1) {
          genderText = '开启';
        } else {
          genderText = '-';
        }
        return <>{genderText}</>;
      },
    },
    {
      title: '关联项目',
      dataIndex: 'projectBid',

      filters: false,
      ellipsis: true,
      order: 1,
      valueType: 'select',
      hideInTable: true,
      renderFormItem: () => {
        return <ProjectSelect name="projectBid" handleChange={handleChange} />;
      },
    },

    {
      title: '是否配置管家',
      dataIndex: 'hasSteward',
      width: 160,
      order: 1,
      ellipsis: true,
      hideInTable: true, // 隐藏表格中的这一列
      hideInSearch: false, // 在搜索框中显示这一项
      valueType: 'select',
      valueEnum: {
        1: {
          text: '是',
        },
        0: {
          text: '否',
        },
      },
    },
    {
      title: '操作',
      width: 100,
      key: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (text, row) => {
        const edit = (
          <>
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_editSteward-1')}>
              <a
                key="edit"
                onClick={() => {
                  // console.log(text, row);
                  setEditData(row);
                  setAddModalVisit(true);
                  sessionStorage.setItem('newData', JSON.stringify(row));
                }}
              >
                编辑管家
              </a>
            </Access>
          </>
        );
        const dele = (
          <>
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_deleteSteward-1')}>
              <a
                style={{ color: '#ec808d' }}
                key="dele"
                onClick={async () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除吗？',
                    centered: true,
                    onOk: async () => {
                      const res = await deleteHousekeeper(row.id);

                      if (res.code === 'SUCCESS') {
                        message.success('删除成功');
                        reload();
                      }
                    },
                  });
                }}
              >
                删除管家
              </a>
            </Access>
          </>
        );
        const stateUp = (
          <>
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_onlineSteward-1')}>
              <a
                key="stateUp"
                onClick={async () => {
                  console.log(text, row);
                  const res = await golive({
                    id: row.id,
                    status: 1,
                  });
                  if (res.code === 'SUCCESS') {
                    reload();
                    message.success('操作成功');
                  }
                  console.log('res', res);
                }}
              >
                启用
              </a>
            </Access>
          </>
        );
        const stateStop = (
          <>
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_onlineSteward-1')}>
              <a
                style={{ color: '#ec808d' }}
                key="stateStop"
                onClick={async () => {
                  console.log(text, row);

                  const res = await golive({
                    id: row.id,
                    status: 0,
                  });
                  if (res.code === 'SUCCESS') {
                    reload();
                    message.success('操作成功');
                  }
                }}
              >
                停用
              </a>
            </Access>
          </>
        );
        if (row.status === 0) {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: edit,
                  },
                  {
                    key: 'dele',
                    label: dele,
                  },

                  {
                    key: 'stateUp',
                    label: stateUp,
                  },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  更多
                  <CaretDownOutlined />
                </Space>
              </a>
            </Dropdown>
          );
        }
        if (row.status === 1) {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: edit,
                  },
                  {
                    key: 'dele',
                    label: dele,
                  },

                  {
                    key: 'stateStop',
                    label: stateStop,
                  },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  更多
                  <CaretDownOutlined />
                </Space>
              </a>
            </Dropdown>
          );
        }
        if (row.status === undefined && row.name === undefined) {
          return <Space>{edit}</Space>;
        }
        if (row.name != undefined) {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: edit,
                  },

                  {
                    key: 'stateUp',
                    label: stateUp,
                  },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  更多
                  <CaretDownOutlined />
                </Space>
              </a>
            </Dropdown>
          );
        }
      },
    },
  ];

  // 请求数据
  const getByPage = async (params: Record<string, any>) => {
    console.log('params', params);

    const msg = await butlerPageQuery({
      ...params,
      pageNo: params.current,
      pageSize: params.pageSize,
      type: 2,
      spaceIds: parentId, //spaceId
      projectBid: projectBid,
    });
    setDataSource(msg.data.items);

    return {
      data: msg.data.items,
      success: true,
      total: msg.data.page.totalItems,
    };
  };
  //请求数据end

  //多选按钮操作的选择器
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    // console.log(newSelectedRowKeys); //选中的key 值列表。
  };

  const rowSelection = {
    selectedRowKeys,
    defaultSelectedRowKeys: [1],
    onChange: onSelectChange,
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  //处理数据
  const appendProperties = (data: any[]) => {
    return data.map((item) => {
      const { name, id, children, ...rest } = item;
      const updatedItem = {
        title: name,
        key: id,
        ...rest,
      };
      if (children && children.length > 0) {
        updatedItem.children = appendProperties(children);
      }
      return updatedItem;
    });
  };

  generateList(cascaderOptions);
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
            return { ...item, title, key: item.key, children: loop(item.children) };
          }

          return {
            ...item,
          };
        });
      } else {
        return [];
      }
    };

    return loop(cascaderOptions);
  }, [searchValue, cascaderOptions]);

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
    console.log('selectedKeys:', selectedKeys);
    window.location.hash = `${selectedKeys}`;

    const hash = window.location.hash;
    const param = hash.substring(1);
    setParentId(param);

    actionRef.current?.reload();
    window.location.hash = ``;
  };

  // 树形控件end

  useEffect(() => {
    getPhysicalSpaceTree({
      projectBid: projectBid,
      // 房产接口
      filterSpaceTypes: [
        'PROJECT',
        'PROJECT_STAGE',
        'BUILDING',
        'UNIT',
        'FLOOR',
        'ROOM',
        'PUBLIC_AREA',
      ],
      // filterSpaceTypes: ["CARPARK", "AREA", "PASSAGE"]
    }).then((res: { code?: any; data?: any }) => {
      if (res.code === 'SUCCESS') {
        const tree = appendProperties(res.data);
        setCascaderOptions(tree);
        console.log('tree', tree[0]?.key);
        setParentId(tree[0]?.key);
        actionRef.current?.reload();
      }
    });
  }, [projectBid]);
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
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
          <ProTable<butlerPageType>
            cardBordered
            actionRef={actionRef}
            rowSelection={rowSelection}
            columns={columns} // 表格的列配置
            className={styles.tableStyle}
            form={{
              colon: false,
            }}
            // dataSource={dataSource}
            // request={getByPage}
            request={parentId ? getByPage : undefined}
            rowKey="spaceId" // 表格行的唯一键
            search={
              // 表格的搜索表单配置
              {
                labelWidth: 95,
                labelAlign: 'left',
              } as any
            }
            pagination={{
              // 表格的分页器配置
              showSizeChanger: true,
            }}
            toolBarRender={() => [
              <div key="div" className={styles.divStyle}>
                {/* <Button
                  key="button"
                  onClick={() => {
                    history.push(`/housekeeper-center/realEstate/batchImport`);
                  }}
                  type="primary"
                >
                  批量导入
                </Button> */}

                <Dropdown
                  key="menu"
                  menu={{
                    items: [
                      {
                        label: (
                          <Access
                            accessible={access.functionAccess('AlitaSteward_batchEditSteward-1')}
                          >
                            <span
                              onClick={async () => {
                                if (selectedRowKeys.length <= 1) {
                                  message.info('请勾选1条以上数据');
                                } else {
                                  const newDataSource = dataSource.filter((item) =>
                                    selectedRowKeys.includes(item.spaceId),
                                  );
                                  console.log('newDataSource', newDataSource);
                                  let hasName = false;
                                  for (const obj of newDataSource) {
                                    if (obj && typeof obj === 'object' && 'name' in obj) {
                                      hasName = true;
                                      break;
                                    }
                                  }
                                  const result = !hasName;
                                  console.log('result', result);
                                  if (result) {
                                    setEditData(newDataSource);
                                    setAddModalVisit(true);
                                    sessionStorage.setItem(
                                      'newData',
                                      JSON.stringify(newDataSource),
                                    );
                                  } else {
                                    const hasNameProperty = newDataSource.every(
                                      (item) => typeof item === 'object' && 'name' in item,
                                    );

                                    if (hasNameProperty) {
                                      const nameCounts = {};
                                      for (const obj of newDataSource) {
                                        if (obj.name) {
                                          if (nameCounts[obj.name]) {
                                            nameCounts[obj.name]++;
                                          } else {
                                            nameCounts[obj.name] = 1;
                                          }
                                        }
                                      }
                                      const isNameSame = Object.keys(nameCounts).length === 1;
                                      console.log('isNameSame', isNameSame);
                                      if (isNameSame) {
                                        setEditData(newDataSource);
                                        setAddModalVisit(true);
                                        sessionStorage.setItem(
                                          'newData',
                                          JSON.stringify(newDataSource),
                                        );
                                      } else {
                                        message.info('请批量编辑相同的管家数据');
                                      }
                                    } else {
                                      message.info('请批量编辑相同的管家数据');
                                    }
                                  }
                                }
                              }}
                            >
                              批量编辑管家
                            </span>
                          </Access>
                        ),
                        key: '1',
                      },
                      {
                        label: (
                          <Access
                            accessible={access.functionAccess('AlitaSteward_batchDeleteSteward-1')}
                          >
                            <span
                              onClick={async () => {
                                if (selectedRowKeys.length <= 1) {
                                  message.info('请勾选1条以上数据');
                                } else {
                                  setOpen(true);
                                  const newDataSource = dataSource.filter((item) =>
                                    selectedRowKeys.includes(item.spaceId),
                                  );
                                  console.log('newDataSource', newDataSource);
                                  setDeleHousekeeper(newDataSource);

                                  // Modal.confirm({
                                  //   icon: <ExclamationCircleFilled />,
                                  //   title: '确定删除吗？',
                                  //   centered: true,
                                  //   onOk: async () => {
                                  //     console.log("选中的K", selectedRowKeys)
                                  //     const newDataSource = dataSource.filter(
                                  //       (item) => !selectedRowKeys.includes(item.key),
                                  //     );

                                  //     setDeleHousekeeper(newDataSource);

                                  //     setDataSource(newDataSource);
                                  //     setSelectedRowKeys([]);
                                  //   },
                                  // });
                                }
                              }}
                            >
                              批量删除管家
                            </span>
                          </Access>
                        ),
                        key: '2',
                      },
                      {
                        label: (
                          <Access
                            accessible={access.functionAccess('AlitaSteward_batchOnlineSteward-1')}
                          >
                            <span
                              onClick={async () => {
                                if (selectedRowKeys.length <= 1) {
                                  message.info('请勾选1条以上数据');
                                } else {
                                  const newDataSource = dataSource.filter((item) =>
                                    selectedRowKeys.includes(item.spaceId),
                                  );
                                  const newData = newDataSource.filter((item) => item.id);
                                  const idArray = newData.map((item: any) => item.id);

                                  const res = await batchGolive({
                                    ids: idArray,
                                    status: 1,
                                  });
                                  if (res.code === 'SUCCESS') {
                                    reload();
                                    message.success('操作成功');
                                  }
                                  console.log('newData', idArray, newData);
                                }
                              }}
                            >
                              批量启用
                            </span>
                          </Access>
                        ),
                        key: '3',
                      },
                      {
                        label: (
                          <Access
                            accessible={access.functionAccess('AlitaSteward_batchOnlineSteward-1')}
                          >
                            <span
                              onClick={async () => {
                                if (selectedRowKeys.length <= 1) {
                                  message.info('请勾选1条以上数据');
                                } else {
                                  setOpenA(true);
                                  const newDataSource = dataSource.filter((item) =>
                                    selectedRowKeys.includes(item.spaceId),
                                  );
                                  console.log('newDataSource', newDataSource);
                                  setDeleHousekeeper(newDataSource);
                                }
                              }}
                            >
                              批量停用
                            </span>
                          </Access>
                        ),
                        key: '4',
                      },
                    ],
                  }}
                >
                  <Button>
                    批量操作
                    <CaretDownOutlined />
                  </Button>
                </Dropdown>
              </div>,
            ]}
          />
        </Pane>
      </SplitPane>

      {/* 编辑 */}
      <AddModelForm
        onSubmit={reload}
        data={editData}
        addData={projectBid}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />

      {/* 删除 */}
      <AddDele open={setOpen} modalVisit={open} data={deleHousekeeper} onSubmit={reload} />
      {/* 停用 */}
      <AddStop open={setOpenA} modalVisit={openA} data={deleHousekeeper} onSubmit={reload} />
    </PageContainer>
  );
};
