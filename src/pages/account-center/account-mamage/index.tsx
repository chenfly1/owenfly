import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { message, Button, Modal, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useRef, useState } from 'react';
import Add from './add';
import { userQueryByPage, userDelete, roleQueryByPage, userBatchDelete } from '@/services/auth';
//import { batchAccountByCondition } from '@/services/mda';
import OrgTree from '@/components/OrgTree';
import styles from './style.less';
import { Access, useAccess, useModel } from 'umi';
import DataMasking from '@/components/DataMasking';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import ModalView from './components/modalView';
import ActionGroup from '@/components/ActionGroup';
export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalVisit, setModalVisit] = useState(false);
  const [modalData, setModalData] = useState<{ id?: number }>();
  const access = useAccess();
  const [readonly, setReadonly] = useState<boolean>();
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  let orgBid: string;
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    if (!orgBid) {
      params.orgBid = orgBidList.join(',');
    } else {
      params.orgBid = orgBid;
    }
    const res = await userQueryByPage({ params });
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  // 删除行数据
  const deleteRow = async (row: UserListType) => {
    try {
      const id = row.id;
      const res = await userDelete(id as number);
      if (res.code === 'SUCCESS') {
        message.success('删除成功！');
        actionRef.current?.reload();
        return true;
      }
      return false;
    } catch (err) {
      message.error('请求失败，请重试！');
      return false;
    }
  };
  // 批量删除
  const deleteAll = async (ids: string[]) => {
    try {
      const res = await userBatchDelete(ids);
      if (res.code === 'SUCCESS') {
        message.success('删除成功！');
        actionRef.current?.reload();
        return true;
      }
      return false;
    } catch (err) {
      message.error('请求失败，请重试！');
      return false;
    }
  };

  const queryRoles = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1000,
    };
    const res = await roleQueryByPage({ params });
    return (res.data?.items || []).map((item) => ({
      label: item.name,
      value: item.bid,
    }));
  };

  const columns: ProColumns<UserListType>[] = [
    {
      title: '用户账号',
      key: 'account',
      dataIndex: 'account',
      order: 2,

      ellipsis: true,
    },
    {
      title: '用户姓名',
      key: 'name',
      dataIndex: 'name',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '手机号',
      key: 'mobile',
      dataIndex: 'mobile',
      ellipsis: true,
      order: 3,
      width: '150px',
      render: (_, record) => {
        return [<DataMasking key="onlysee" text={record.mobile} />];
      },
    },
    {
      title: '电子邮箱',
      key: 'email',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: '组织',
      key: 'orgs',
      dataIndex: 'orgs',
      hideInSearch: true,
      ellipsis: true,

      render: (node, row) => {
        const orgNameList = row.orgs?.map((item) => item?.name);
        return orgNameList?.join('；');
      },
    },
    {
      title: '角色',
      key: 'rolesTexts',
      dataIndex: 'user',
      ellipsis: true,
      hideInSearch: true,

      render: (node, row) => {
        return row.rolesTexts?.join('；');
      },
    },
    {
      title: '角色',
      key: 'roleBid',
      dataIndex: 'user',
      order: 1,
      hideInTable: true,
      valueType: 'select',
      request: queryRoles,

      render: (node, row) => {
        return row.rolesTexts?.join('；');
      },
    },
    {
      title: '用户状态',
      key: 'state',
      dataIndex: 'state',

      ellipsis: true,
      order: 0,
      valueType: 'select',
      valueEnum: {
        NORMAL: {
          text: '可用',
          status: 'Success',
        },
        BAND: {
          text: '禁用',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateTime',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        if (row.type === 'tadmin') {
          return _;
        } else {
          return (
            <ActionGroup
              actions={[
                {
                  key: 'edit',
                  text: '编辑',
                  accessKey: 'authcenter_editAccount',
                  onClick: () => {
                    setModalData(row);
                    setDrawerVisit(true);
                    setReadonly(true);
                  },
                },
              ]}
            />
          );
        }
      },
    },
  ];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
    defaultSelectedRowKeys: [1],
    onChange: onSelectChange,
  };
  const delClick = () => {
    if (selectedRowKeys.length === 0) {
      message.info('请勾选行数据');
    } else {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定删除吗？',
        centered: true,
        onOk: async () => {
          return deleteAll(selectedRowKeys as string[]);
        },
      });
    }
  };

  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
  };
  const onSelect = (selectedKeys: React.Key[], e: any) => {
    orgBid = e.node.bid;
    actionRef.current?.reload();
  };
  const cancelModal = () => {
    setModalVisit(false);
  };
  const onSuccessModal = () => {
    actionRef.current?.reload();
  };
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Button
          onClick={() => {
            setModalVisit(true);
          }}
          type="text"
        >
          给员工开通账号
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button
          onClick={() => {
            setDrawerVisit(true);
            setModalData({});
            setReadonly(false);
          }}
          type="text"
        >
          给普通用户开账号
        </Button>
      ),
    },
  ];
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%" minSize={'280px'}>
          <div style={{ padding: '20px' }}>
            <OrgTree onSelect={onSelect} />
          </div>
        </Pane>
        <Pane>
          <ProTable<UserListType>
            columns={columns}
            actionRef={actionRef}
            className={styles.tableStyle}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            columnsState={{
              persistenceKey: 'pro-table-singe-demos',
              persistenceType: 'localStorage',
              onChange(value) {
                console.log('value: ', value);
              },
            }}
            rowKey="id"
            search={
              {
                labelWidth: 68,
                labelAlign: 'left',
                // defaultColsNumber: 7,
              } as any
            }
            pagination={{
              showSizeChanger: true,
            }}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
            headerTitle={
              <Space>
                {/* <Access key="1" accessible={access.functionAccess('authcenter_queryAccount')}>
                  <Button key="export" onClick={exportClick}>
                    批量导出
                  </Button>
                </Access> */}
                {/* <Access key="2" accessible={access.functionAccess('authcenter_deleteAccount')}>
                  <Button key="delete" onClick={delClick}>
                    批量删除
                  </Button>
                </Access> */}
              </Space>
            }
            toolBarRender={() => [
              // <Access key="button" accessible={access.functionAccess('authcenter_editAccount')}>
              //   <Button
              //     onClick={() => {
              //       setModalVisit(true);
              //     }}
              //     type="primary"
              //   >
              //     给员工开通账号
              //   </Button>
              // </Access>,
              // <Access key="button" accessible={access.functionAccess('authcenter_editAccount')}>
              //   <Button
              //     onClick={() => {
              //       setDrawerVisit(true);
              //       setModalData({});
              //       setReadonly(false);
              //     }}
              //     icon={<PlusOutlined />}
              //     type="primary"
              //   >
              //     新建账号
              //   </Button>
              // </Access>,
              <Access key="button" accessible={access.functionAccess('authcenter_editAccount')}>
                <Dropdown menu={{ items }} placement="bottomLeft">
                  <Button icon={<PlusOutlined />}>新增账号</Button>
                </Dropdown>
              </Access>,
            ]}
            rowSelection={rowSelection}
          />
        </Pane>
      </SplitPane>

      {modalVisit && (
        <ModalView open={modalVisit} onCancel={cancelModal} onSuccess={onSuccessModal} />
      )}
      <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={readonly}
      />
    </PageContainer>
  );
};
