import { ActionType, ProColumns, TableDropdown } from '@ant-design/pro-components'; // 引入一些类型定义
import { PageContainer } from '@ant-design/pro-layout'; // 引入布局组件
import { ProTable } from '@ant-design/pro-components'; // 引入表格组件
import { Button, Dropdown, Modal, Space, message } from 'antd'; // 引入一些常用的组件
import { CaretDownOutlined, ExclamationCircleFilled } from '@ant-design/icons'; // 引入icon
import { useEffect, useRef, useState } from 'react';
import { Access, history, useAccess } from 'umi'; // 引入umi的一些组件和方法

import ProjectSelect from './ProjectSelect';

import styles from './style.less';
import AddModelForm from './addEdit';
import AddDele from './addDele';
import { batchGolive, butlerPageQuery, deleteHousekeeper, golive } from '@/services/housekeeper';
import { storageSy } from '@/utils/Setting';
import AddStop from './addStop';

// 表单

// 表单end

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); //表单多选中的行的key列表(选中的行key列表) 或者选中的行的索引列表(选中的
  const [dataSource, setDataSource] = useState<butlerPageType[]>([]); //表单数据

  const [addModalVisit, setAddModalVisit] = useState<boolean>(false); // 创建一个状态，用于控制添加模型的弹框的显示隐藏
  const [editData, setEditData] = useState<any>(); // 创建一个状态，用于控制编辑模型的弹框的数据

  const [open, setOpen] = useState<boolean>(false); //删除弹窗
  const [openA, setOpenA] = useState<boolean>(false); //删除弹窗
  const [deleHousekeeper, setDeleHousekeeper] = useState<any>();
  const [projectBid, setProjectBid] = useState<string>('');
  const access = useAccess();

  const actionRef = useRef<ActionType>(); // 创建一个ref，用于操作表格
  const reload = () => {
    actionRef.current?.reload();
  };

  const handleChange = (bid: string) => {
    setProjectBid(bid);

    reload();
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
    },

    {
      title: '管家名称',
      dataIndex: 'name',
      width: 150,
      order: 7,
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 160,
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
      width: 160,
      order: 5,
      ellipsis: true,
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
      width: 160,
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

    // {
    //   title: '关联项目',
    //   dataIndex: 'projectBid',

    //   filters: false,
    //   ellipsis: true,
    //   order: 1,
    //   valueType: 'select',
    //   hideInTable: true,
    //   // request: async () => {
    //   //   const res = await getProjectAllList();
    //   //   console.log(res);
    //   //   return (res.data.items as any).map((i: any) => ({
    //   //     value: i.bid,
    //   //     label: i.name,
    //   //   }));
    //   // },
    //   renderFormItem: () => {
    //     return <ProjectSelect name="projectBid" handleChange={handleChange} />;
    //   },
    // },
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
      fixed: 'right',
      valueType: 'option',
      render: (text, row) => {
        const edit = (
          <>
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_editSteward')}>
              <a
                key="edit"
                onClick={() => {
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
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_deleteSteward')}>
              <a
                style={{ color: '#ec808d' }}
                key="dele"
                onClick={() => {
                  // console.log(text, row);
                  // setDeleHousekeeper([row]);
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
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_onlineSteward')}>
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
            <Access key="edit" accessible={access.functionAccess('AlitaSteward_onlineSteward')}>
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

  //多选按钮操作的选择器
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    console.log(newSelectedRowKeys); //选中的key 值列表。
  };

  //多选
  const rowSelection = {
    selectedRowKeys,
    defaultSelectedRowKeys: [1],
    onChange: onSelectChange,
  };

  // 请求数据
  const getByPage = async (params: Record<string, any>, res: any) => {
    console.log('params', params);

    const msg = await butlerPageQuery({
      ...params,
      projectBid: projectBid,
      pageNo: params.current,
      pageSize: params.pageSize,
      type: 1,
      // projectBid: projectBid,
    });
    setDataSource(msg.data.items);

    return {
      data: msg.data.items,
      success: true,
      total: msg.data.page.totalItems,
    };
  };

  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    console.log('project', project);
    setProjectBid(project?.bid);
  }, []);

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<butlerPageType>
        rowSelection={rowSelection}
        cardBordered
        columns={columns} // 表格的列配置
        className="tableStyle"
        actionRef={actionRef}
        request={getByPage as any}
        // dataSource={dataSource}

        rowKey="projectBid" // 表格行的唯一键
        form={{
          colon: false,
        }}
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
                // actionRef.current?.reload();
                history.push(`/housekeeper-center/project/batchImport`);
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
                    key: '1',
                    label: (
                      <Access accessible={access.functionAccess('AlitaSteward_batchEditSteward')}>
                        <span
                          onClick={async () => {
                            if (selectedRowKeys.length <= 1) {
                              message.info('请勾选1条以上数据');
                            } else {
                              const newDataSource = dataSource.filter((item) =>
                                selectedRowKeys.includes(item.projectBid),
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
                                sessionStorage.setItem('newData', JSON.stringify(newDataSource));
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
                  },
                  {
                    key: '2',
                    label: (
                      <Access accessible={access.functionAccess('AlitaSteward_batchDeleteSteward')}>
                        <span
                          onClick={async () => {
                            if (selectedRowKeys.length <= 1) {
                              message.info('请勾选1条以上数据');
                            } else {
                              const newDataSource = dataSource.filter((item) =>
                                selectedRowKeys.includes(item.projectBid),
                              );
                              // const newData = newDataSource.filter((item) => item.id);

                              // console.log('newData', newData);
                              // setDeleHousekeeper(newData);

                              setOpen(true);
                              setDeleHousekeeper(newDataSource);
                            }
                          }}
                        >
                          批量删除管家
                        </span>
                      </Access>
                    ),
                  },
                  {
                    key: '3',
                    label: (
                      <Access accessible={access.functionAccess('AlitaSteward_batchOnlineSteward')}>
                        <span
                          onClick={async () => {
                            if (selectedRowKeys.length <= 1) {
                              message.info('请勾选1条以上数据');
                            } else {
                              const newDataSource = dataSource.filter((item) =>
                                selectedRowKeys.includes(item.projectBid),
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
                  },
                  {
                    key: '4',
                    label: (
                      <Access accessible={access.functionAccess('AlitaSteward_batchOnlineSteward')}>
                        <span
                          onClick={async () => {
                            if (selectedRowKeys.length <= 1) {
                              message.info('请勾选1条以上数据');
                            } else {
                              // const newDataSource = dataSource.filter((item) =>
                              //   selectedRowKeys.includes(item.projectBid),
                              // );
                              // const newData = newDataSource.filter((item) => item.id);
                              // const idArray = newData.map((item: any) => item.id);

                              // console.log('newData', idArray, newData);

                              // Modal.confirm({
                              //   icon: <ExclamationCircleFilled />,
                              //   title: '批量停用',
                              //   centered: true,
                              //   content: `是否批量停用，已选中${selectedRowKeys.length}条数据`,
                              //   onOk: async () => {
                              //     const res = await batchGolive({
                              //       ids: idArray,
                              //       status: 0,
                              //     });
                              //     if (res.code === 'SUCCESS') {
                              //       reload();
                              //       message.success('操作成功');
                              //     }
                              //   },
                              // });
                              setOpenA(true);
                              const newDataSource = dataSource.filter((item) =>
                                selectedRowKeys.includes(item.projectBid),
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
