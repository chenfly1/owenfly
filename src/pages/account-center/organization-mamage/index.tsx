// import LingdongTree from '@/pages/space-center/companents/lingdong-tree';
import { CaretDownOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import React, { useRef, useState } from 'react';
import Add from './add';
import OrgTree from '@/components/OrgTree';
import { orgDelete, orgQueryByPage } from '@/services/auth';
import styles from './style.less';
import { Access, useAccess, useModel } from 'umi';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalData, setModalData] = useState({});
  const treeRef = useRef();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  let orgId: React.Key;
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [readonly, setReadonly] = useState<boolean>();
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.orgId = orgId;
    if (!orgId) {
      params.orgBids = orgBidList;
    }
    const res = await orgQueryByPage({ params: params });
    res.data?.items.forEach((item) => {
      item.orgType = item?.orgInfoVO?.orgType;
      item.userCount = item?.orgInfoVO?.userCount;
    });
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page?.totalItems,
    };
  };
  // 新增数据
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
    (treeRef?.current as any).getTreeList();
  };
  // 删除行数据
  const deleteRow = async (row: OrgListPageType) => {
    try {
      const id = row?.id;
      const res = await orgDelete(id);
      if (res.code === 'SUCCESS') {
        message.success('删除成功！');
        actionRef.current?.reload();
        (treeRef?.current as any).getTreeList();
        return true;
      }
      return false;
    } catch (err) {
      message.error('请求失败，请重试！');
      return false;
    }
  };
  const onSelect = (selectedKeys: React.Key[]) => {
    orgId = selectedKeys[0];
    actionRef.current?.reload();
  };
  const columns: ProColumns<OrgListPageType>[] = [
    {
      title: '组织名称',
      key: 'name',
      dataIndex: 'name',
      order: 3,

      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '组织类型',
      key: 'orgType',
      dataIndex: 'orgType',
      order: 1,
      ellipsis: true,

      valueType: 'select',
      valueEnum: {
        tenant: {
          text: '租户',
        },
        customer: {
          text: '自定义',
        },
        project: {
          text: '项目',
        },
      },
    },
    {
      title: '用户数',
      key: 'userCount',
      dataIndex: 'userCount',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '组织状态',
      key: 'state',
      dataIndex: 'state',
      order: 1,
      ellipsis: true,

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
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            createBeginDt: value[0],
            createEndDt: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      key: 'option',
      fixed: true,
      render: (text, row) => {
        const createItem = {
          key: 'create',
          text: '新增下级',
          accessKey: 'authcenter_editOrg',
          onClick: () => {
            setModalData({
              ...row,
              type: 'addChildren',
            });
            setDrawerVisit(true);
            setReadonly(false);
          },
        };
        const editItem = {
          key: 'edit',
          text: '编辑',
          accessKey: 'authcenter_editOrg',
          onClick: () => {
            setModalData({
              ...row,
              type: 'edit',
            });
            setDrawerVisit(true);
            setReadonly(true);
          },
        };
        const removeItem = {
          key: 'remove',
          text: '删除',
          danger: true,
          accessKey: 'authcenter_deleteOrg',
          onClick: () => {
            Modal.confirm({
              icon: <ExclamationCircleFilled />,
              title: '确定删除该组织及下属组织？',
              centered: true,
              content: (
                <p style={{ color: '#999' }}>删除后，该组织及下属组织都将被删除，请谨慎操作</p>
              ),
              onOk: async () => {
                return deleteRow(row);
              },
            });
          },
        };

        if (row.orgType === 'tenant') {
          return <ActionGroup limit={2} actions={[createItem]} />;
        } else if (row.orgType === 'customer') {
          return <ActionGroup limit={2} actions={[createItem, editItem, removeItem]} />;
        } else if (row.orgType === 'project') {
          return <ActionGroup limit={2} actions={[editItem]} />;
        }
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
            <OrgTree ref={treeRef} onSelect={onSelect} />
          </div>
        </Pane>
        <Pane>
          <ProTable<OrgListPageType>
            className={styles.tableStyle}
            columns={columns}
            actionRef={actionRef}
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
            pagination={{
              showSizeChanger: true,
            }}
            rowKey="id"
            search={
              {
                labelWidth: 68,
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
            toolBarRender={() => [
              <Access key="button" accessible={access.functionAccess('authcenter_editOrg')}>
                <Button
                  onClick={() => {
                    setModalData({
                      type: 'add',
                    });
                    setDrawerVisit(true);
                    setReadonly(false);
                  }}
                  icon={<PlusOutlined />}
                  type="primary"
                >
                  新建组织
                </Button>
              </Access>,
            ]}
          />
        </Pane>
      </SplitPane>
      {/* <ProCard>
        <ProCard bodyStyle={{ padding: '16px 0' }} colSpan={6} />
        <ProCard colSpan={18} />

      </ProCard> */}
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
