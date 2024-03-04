import {
  EditOutlined,
  ExclamationCircleFilled,
  MinusCircleOutlined,
  PlusCircleOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from './style.less';
import { Access, useAccess } from 'umi';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { deleteStaff, deleteStaffOrg, getQueryStaff } from '@/services/base';
import ProjectSelect from '@/components/ProjectSelect';
import storageSy from '@/utils/Setting/storageSy';
import DepartmentTree from '@/components/DepartmentTree';
import { exportExcel } from '../utils/constant';
import Details from './details';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';
import AddDepartment from './addDep';
import ImprotModal from './improtModal';
import OssImage from '@/components/OssImage';
import { staffBusiness } from '@/components/FileUpload/business';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const treeRef = useRef();
  const access = useAccess();
  const project = JSON.parse(localStorage.getItem(storageSy.projectInfo) as string);
  const [projectId, setProjectBid] = useState<string>(project ? project.bid : '');
  const [orgId, setOrgId] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<Record<string, any>>();
  const [depOpen, setDepOpen] = useState<boolean>(false);
  const [depData, setDepData] = useState<Record<string, any>>();
  const [imData, setImData] = useState<Record<string, any>>();
  const [imOpen, setImOpen] = useState<boolean>(false);

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    // params.projectId = projectId;
    params.orgId = orgId;
    const res = await getQueryStaff(params);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page?.totalItems,
    };
  };
  const reloadTree = () => {
    (treeRef?.current as any).getTreeList();
  };
  const reload = () => {
    actionRef?.current?.reload();
  };
  const onSelect = (selectedKeys: React.Key[]) => {
    setOrgId(selectedKeys && selectedKeys.length ? (selectedKeys[0] as string) : '');
    (actionRef.current as any).reset();
  };
  const handleChange = (bid: string) => {
    setProjectBid(bid);
    (actionRef.current as any).reset();
  };

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 1000000;
    params.excel = 'export';
    exportExcel('/staff/mng/staff', '员工信息', params, 'GET');
  };
  // 删除部门
  const deleteDep = async (row: any) => {
    const res = await deleteStaffOrg({ id: row.id });
    if (res.code === 'SUCCESS') {
      message.success('删除成功！');
      reloadTree();
    }
  };
  // 删除人员
  const deletePer = async (row: any) => {
    const res = await deleteStaff({ id: row.id });
    if (res.code === 'SUCCESS') {
      message.success('删除成功！');
      reload();
      return true;
    }
    return false;
  };

  // 提交
  const onSubmit = async () => {
    reloadTree();
    setDepOpen(false);
  };

  const onDetailSubmit = async () => {
    reload();
    setOpen(false);
  };

  const onTitleRender = (item: any) => {
    return (
      <div className={styles.treeTitile}>
        <div className={`${styles.content}`}>{item.name}</div>
        <div className={`${styles.icons}`}>
          <ActionGroup
            actions={[
              {
                key: 'edit2',
                icon: <EditOutlined />,
                onClick: (e) => {
                  e.stopPropagation();
                  setDepOpen(true);
                  setDepData({ type: 'edit', ...item });
                },
              },
              {
                key: 'delete2',
                icon: <MinusCircleOutlined />,
                onClick: (e) => {
                  e.stopPropagation();
                  // console.log(
                  //   findNode((treeRef?.current as any).treeData, (n: any) => {
                  //     return n.id === item.id;
                  //   }),
                  // );
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: (
                      <>
                        {`确定删除`}
                        {item.name}
                        {`吗？`}
                      </>
                    ),
                    centered: true,
                    onOk: async () => {
                      return deleteDep(item);
                    },
                  });
                },
              },
              {
                key: 'add3',
                icon: <PlusCircleOutlined />,
                onClick: (e) => {
                  e.stopPropagation();
                  setDepOpen(true);
                  setDepData({ type: 'add', ...item });
                },
              },
            ]}
          />
        </div>
      </div>
    );
  };

  const columns: ProColumns<staffType>[] = [
    // {
    //   title: '项目名称',
    //   dataIndex: 'projectId',
    //   hideInTable: true,
    //   renderFormItem: () => {
    //     return <ProjectSelect name="projectId" allowClear={false} handleChange={handleChange} />;
    //   },
    // },
    {
      title: '员工姓名',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '所属部门',
      key: 'orgName',
      dataIndex: 'orgName',
      ellipsis: true,
      search: false,
    },
    {
      title: '手机号',
      key: 'mobile',
      dataIndex: 'mobile',
      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '工号',
      key: 'empNo',
      dataIndex: 'empNo',
      ellipsis: true,
    },
    {
      title: '人脸图片',
      key: 'headPortrait',
      dataIndex: 'headPortrait',
      render: (_, record: any) => {
        const objectId = record.headPortrait;
        return objectId ? (
          <OssImage
            style={{ width: '40px', height: '40px' }}
            objectId={objectId}
            business={staffBusiness.id}
          />
        ) : (
          '-'
        );
      },
    },
    {
      title: '车牌号码',
      key: 'carNum',
      dataIndex: 'carNum',
      ellipsis: true,
    },
    // {
    //   title: '邮箱',
    //   key: 'workEmail',
    //   dataIndex: 'workEmail',
    //   hideInSearch: true,
    //   ellipsis: true,
    // },
    {
      title: '在离职状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在职',
        },
        2: {
          text: '离职',
        },
        3: {
          text: '未入职',
        },
        4: {
          text: '未知',
        },
      },
    },
    {
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      ellipsis: true,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 130,
      key: 'option',
      render: (text, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                text: '查看',
                onClick: () => {
                  setData({ ...row, readonly: true });
                  setOpen(true);
                },
              },
              {
                key: 'detail',
                text: '编辑',
                onClick: () => {
                  setData({ ...row, readonly: false });
                  setOpen(true);
                },
              },
              {
                key: 'delete',
                text: '删除',
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除吗？',
                    centered: true,
                    onOk: async () => {
                      return deletePer(row);
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px' }}>
            <DepartmentTree
              // projectBid={projectId}
              ref={treeRef}
              blockNode
              onSelectChange={onSelect}
              titleRender={onTitleRender}
              onAddClick={() => {
                setDepOpen(true);
                setDepData({ type: 'addParent' });
              }}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<staffType>
            className={styles.tableStyle}
            columns={columns}
            actionRef={actionRef}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            pagination={{
              showSizeChanger: true,
            }}
            rowKey="id"
            search={
              {
                labelWidth: 78,
                labelAlign: 'left',
                // defaultColsNumber: 7,
              } as any
            }
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
            headerTitle={
              <ActionGroup
                limit={3}
                scene="tableHeader"
                actions={[
                  {
                    key: 'importDep',
                    text: '导入部门',
                    onClick: () => {
                      setImOpen(true);
                      setImData({ type: 'dp' });
                    },
                  },
                  {
                    key: 'importPre',
                    text: '导入员工',
                    onClick: () => {
                      setImOpen(true);
                      setImData({ type: 'sf' });
                    },
                  },
                  {
                    key: 'export',
                    text: '导出',
                    accessKey: 'alitaMasdata_downloadStaff',
                    icon: <VerticalAlignBottomOutlined />,
                    onClick: exportClick,
                  },
                ]}
              />
            }
            toolBarRender={() => [
              <Access
                key="button"
                accessible={access.functionAccess('alitaMasdata_getStaffDetail2')}
              >
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      setOpen(true);
                      setData({ readonly: false });
                    }}
                  >
                    新增员工
                  </Button>
                </Space>
              </Access>,
            ]}
          />
        </Pane>
      </SplitPane>
      <Details open={open} onOpenChange={setOpen} data={data} onSubmit={onDetailSubmit} />
      <AddDepartment open={depOpen} onOpenChange={setDepOpen} onSubmit={onSubmit} data={depData} />
      <ImprotModal open={imOpen} onOpenChange={setImOpen} onSubmit={() => {}} data={imData} />
    </PageContainer>
  );
};
