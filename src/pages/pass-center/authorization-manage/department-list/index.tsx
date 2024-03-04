import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from './style.less';
import { Access, useAccess } from 'umi';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import AddModelForm from './add';
import DepartmentTree from '@/components/DepartmentTree';
import { getpassingAreaOrgByPage, delOrgPassingArea } from '@/services/door';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const treeRef = useRef();
  const access = useAccess();
  const [headerTitle, setHeaderTitle] = useState<string>();
  const [editModalVisit, setEditModalVisit] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<string>();

  const reload = () => {
    actionRef.current?.reload();
  };

  const treeLoadComplate = (data: any) => {
    if (data && data.length) {
      setOrganizationId(data[0].id);
      setHeaderTitle(data[0].name);
      reload();
    }
  };

  const queryList = async (params: any) => {
    if (!organizationId)
      return {
        data: [],
        success: true,
        total: 0,
      };
    params.pageNo = params.current;
    params.organizationId = organizationId;
    const res = await getpassingAreaOrgByPage(params);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page?.totalItems,
    };
  };
  const onSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys.length ? (selectedKeys[0] as string) : '';
    if (key) {
      setOrganizationId(key);
      const parentList = (treeRef.current as any).getParentList(key) || [];
      if (parentList && parentList.length) {
        setHeaderTitle(parentList.map((i: any) => i.name).join('/'));
      }
      (actionRef.current as any).reset();
    }
    (actionRef.current as any).reset();
  };
  // 删除通行区域
  const handleDelete = (row: any) => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除该通行区域吗',
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await delOrgPassingArea({
          id: row.id,
          organizationId: row.organizationId,
          passingAreaId: row.passingAreaId,
        });
        if (res.code === 'SUCCESS') {
          reload();
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    });
  };
  const columns: ProColumns<passingAreaOrgType>[] = [
    {
      title: '通行区域',
      dataIndex: 'passingAreaName',
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'gmtUpdated',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'updater',
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      fixed: true,
      render: (text, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'alitaDoor_deleteAccessAuthOrganization',
                onClick() {
                  handleDelete(row);
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
              ref={treeRef}
              treeLoadComplate={treeLoadComplate}
              onSelectChange={onSelect}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<passingAreaOrgType>
            className={styles.tableStyle}
            columns={columns}
            actionRef={actionRef}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            headerTitle={headerTitle}
            request={queryList}
            pagination={{
              showSizeChanger: true,
            }}
            rowKey="id"
            search={false}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
            toolBarRender={() => [
              <Access
                key="button"
                accessible={access.functionAccess('alitaDoor_addAccessAuthOrganization')}
              >
                <Button
                  onClick={() => {
                    setEditModalVisit(true);
                  }}
                  icon={<PlusOutlined />}
                  type="primary"
                >
                  新增部门授权
                </Button>
              </Access>,
            ]}
          />
        </Pane>
      </SplitPane>
      <AddModelForm
        organizationId={organizationId || ''}
        title={headerTitle || ''}
        onSubmit={reload}
        modalVisit={editModalVisit}
        onOpenChange={setEditModalVisit}
      />
    </PageContainer>
  );
};
