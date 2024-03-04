import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Tag, Tooltip, message } from 'antd';
import React, { useRef, useState } from 'react';
import { Access, history, useModel, useAccess } from 'umi';
import {
  getProjectList,
  activeProject,
  stopProject,
  deleteAllProject,
  deleteProject,
  getProjectAllList,
  resourceBind,
} from '@/services/mda';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { storageSy } from '@/utils/Setting';
import { useLocalStorageState } from 'ahooks';
import ActionGroup from '@/components/ActionGroup';
import { peojectSwitch } from '@/services/security';
import LinkModal from './linkModal';
import LinkConfirmModal from './linkConfirmModal';

const { confirm } = Modal;

const getByPage = async (params: Record<string, any>) => {
  const msg = await getProjectList({
    ...params,
    pageNo: params.current,
  });
  return {
    data: msg.data.items,
    // success 请返回 true， 不然 table 会停止解析数据，即使有数据
    success: true,
    // 不传会使用 data 的长度，如果是分页一定要传
    total: msg.data.page.totalItems,
  };
};

export default () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ProjectListType[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: ProjectListType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };
  const [, setProjectInfo] = useLocalStorageState<ProjectListType>(storageSy.projectInfo);
  const { setInitialState } = useModel('@@initialState');
  const rowSelection = {
    selectedRowKeys,
    selectedRows,
    defaultSelectedRowKeys: [],
    onChange: onSelectChange,
  };
  const [linkModalShow, setLinkModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ProjectListType>();

  const [linkConfirmModalShow, setLinkConfirmModalShow] = useState<boolean>(false);
  const [confirmModalData, setConfirmModalData] = useState<Record<string, any>>();

  const getAllProjectList = async () => {
    // 刷新列表
    let projectList: ProjectListType[] = [];
    const projectListRes = await getProjectAllList();
    projectList = projectListRes.data.items;
    const bidInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    if (!bidInfo && projectList.length) {
      await peojectSwitch({ projectBid: projectList[0].bid });
      setProjectInfo(projectList[0]);
    }
    setInitialState((s: any) => ({
      ...s,
      projectList: projectList,
    }));
  };

  const deleteAll = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请勾选行数据');
      return;
    }
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除项目后无法找回',
      content: <p>如暂停运营项目，可进行停用操作</p>,
      centered: true,
      onOk: async () => {
        const res = await deleteAllProject(selectedRowKeys as number[]);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          setSelectedRowKeys([]);
          getAllProjectList();
          message.success('删除成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const deleteRow = (id: number) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除项目后无法找回',
      content: <p>如暂停运营项目，可进行停用操作</p>,
      centered: true,
      onOk: async () => {
        const res = await deleteProject(id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          setSelectedRowKeys([]);
          getAllProjectList();
          message.success('删除成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const activeClick = (row: ProjectListType): any => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定是否启用项目',
      content: <p>启用项目后，各应用端将显示项目；启用的项目能继续开展业务，产生业务数据</p>,
      okText: '启用',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        const res = await activeProject(row.id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const stopClick = (row: ProjectListType): any => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定是否停用项目',
      content: <p>停用项目后，各应用端将无法找到项目；停用的项目业务数据进入封存状态</p>,
      centered: true,
      okText: '停用',
      cancelText: '取消',
      onOk: async () => {
        const res = await stopProject(row.id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const onDoubleClick = (row: any, data: any) => {
    setLinkModalShow(false);
    console.log(row, data);
    setLinkConfirmModalShow(true);
    setConfirmModalData({
      row: row,
      data: data,
    });
  };
  const onSubmit = () => {
    setLinkConfirmModalShow(false);
    actionRef?.current?.reload();
  };

  const asyncBind = (row: any) => {
    Modal.confirm({
      title: '手工同步数据？',
      content: (
        <>
          <p style={{ color: 'red' }}>点击手动同步，将同步已关联项目的如下数据：</p>
          <div style={{ paddingLeft: '30px' }}>
            <p>项目信息</p>
            <p>房产信息（含房产、车位）</p>
            <p>客户信息（含产权人、同住人、租客）</p>
            <p>产权客户关系信息</p>
          </div>
        </>
      ),
      onOk: async () => {
        const res = await resourceBind({
          projectId: row.bid,
          resType: 'bgy',
        });
        if (res.code === 'SUCCESS') {
          message.success('同步成功');
          actionRef?.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const columns: ProColumns<ProjectListType>[] = [
    {
      title: '项目名称',
      dataIndex: 'name',
      order: 3,
      width: 230,
      render: (_, row) => {
        if (row?.resId) {
          return (
            <div className={styles.nameSty}>
              <Tooltip placement="topLeft" title={row.name}>
                <div className="text-ellipsis">{row.name}</div>
              </Tooltip>
              <Tag color="success">已关联</Tag>
            </div>
          );
        } else {
          return _;
        }
      },
    },
    {
      title: '业务编码',
      dataIndex: 'businessCode',
      order: 4,
      width: 150,
      ellipsis: true,
    },
    {
      title: '业态',
      dataIndex: 'businessType',
      width: 140,
      // filters: true,
      // onFilter: true,
      ellipsis: true,
      order: 1,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '住宅',
        },
        2: {
          text: '办公',
        },
        3: {
          text: '商写',
        },
        4: {
          text: '医疗',
        },
        5: {
          text: '学校',
        },
        6: {
          text: '产业园',
        },
        7: {
          text: '城市公共服务',
        },
      },
    },
    {
      title: '建筑物数量',
      dataIndex: 'buildingCount',
      width: 120,
      search: false,
    },
    {
      title: '房间数量',
      dataIndex: 'roomCount',
      width: 120,
      ellipsis: true,
      search: false,
    },
    {
      title: '车位数量',
      dataIndex: 'parkingCount',
      width: 120,
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      search: false,
      valueEnum: {
        1: {
          text: '启用',
          status: 'Success',
        },
        0: {
          text: '停用',
          status: 'Error',
        },
      },
    },
    {
      title: '操作',
      width: 120,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            // limit={2}
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'masdata_editProject',
                onClick() {
                  history.push(`/base-center/project-center/edit?id=${record.id}`);
                },
              },
              {
                key: 'active',
                text: '启用',
                accessKey: 'masdata_projectSwitch',
                hidden: !!record.state,
                onClick() {
                  activeClick(record);
                },
              },
              {
                key: 'stop',
                text: '停用',
                hidden: !record.state,
                danger: true,
                accessKey: 'masdata_projectSwitch',
                onClick() {
                  stopClick(record);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'masdata_deleteProject',
                onClick() {
                  deleteRow(record.id);
                },
              },
              {
                key: 'link',
                text: '关联',
                hidden: !!record?.resId,
                accessKey: 'alitaBaseConfig_project_third_bind',
                onClick() {
                  setLinkModalShow(true);
                  setModalData(record);
                },
              },
              {
                key: 'sync',
                text: '手工同步',
                hidden: !record?.resId,
                accessKey: 'alitaBaseConfig_project_third_resource_bind',
                onClick() {
                  asyncBind(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <PageContainer header={{ title: null }}>
        <ProTable<ProjectListType>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          form={{
            colon: false,
          }}
          search={{
            labelWidth: 68,
          }}
          request={getByPage}
          rowSelection={rowSelection}
          headerTitle={
            <Access key="delete" accessible={access.functionAccess('masdata_deleteProject')}>
              <Button onClick={deleteAll}>批量删除</Button>
            </Access>
          }
          rowKey="id"
          toolBarRender={() => [
            <Access key="add" accessible={access.functionAccess('masdata_editProject')}>
              <Button
                key="button"
                onClick={() => {
                  history.push(`/base-center/project-center/add`);
                }}
                icon={<PlusOutlined />}
                type="primary"
              >
                新建项目
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
      <LinkModal
        open={linkModalShow}
        onOpenChange={setLinkModalShow}
        onDoubleClick={onDoubleClick}
        data={modalData}
      />
      <LinkConfirmModal
        open={linkConfirmModalShow}
        onOpenChange={setLinkConfirmModalShow}
        onSubmit={onSubmit}
        data={confirmModalData}
      />
    </>
  );
};
