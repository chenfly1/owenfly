import { CaretDownOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import Add from './add';
import { roleDelete, roleQueryByPage } from '@/services/auth';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { Access, history, useAccess } from 'umi';
import ActionGroup from '@/components/ActionGroup';

const queryList = async (params: any) => {
  params.pageNo = params.current;
  const res = await roleQueryByPage({ params });
  return {
    data: res.data?.items,
    success: res.code === 'SUCCESS' ? true : false,
    total: res.data?.page?.totalItems,
  };
};
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalData, setModalData] = useState<Record<string, any>>();
  const [readonly, setReadonly] = useState<boolean>();

  const [drawerVisit, setDrawerVisit] = useState(false);
  const access = useAccess();
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
  };
  // 删除行数据
  const deleteRow = async (row: { id: number }) => {
    try {
      const id = row.id;
      const res = await roleDelete(id);
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
  const columns: ProColumns<RoleListType>[] = [
    {
      title: '角色名称',
      key: 'name',
      dataIndex: 'name',
      order: 3,
    },
    {
      title: '数据级别',
      key: 'dateLevel',
      dataIndex: 'dateLevel',
      order: 2,
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        10: {
          text: '10',
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
      title: '备注',
      key: 'remark',
      dataIndex: 'remark',
      ellipsis: true,

      hideInSearch: true,
    },
    {
      title: '创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',

      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '状态',
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
      title: '操作',
      valueType: 'option',

      key: 'option',
      width: 100,
      render: (_, row) => {
        if (row.type === 'tadmin') {
          return (
            <ActionGroup
              actions={[
                {
                  key: 'check',
                  text: '查看',
                  accessKey: 'authcenter_queryRole',
                  onClick: () => {
                    setModalData({ ...row, openType: 'detail' });
                    setDrawerVisit(true);
                    setReadonly(true);
                  },
                },
              ]}
            />
          );
        } else {
          return (
            <ActionGroup
              actions={[
                {
                  key: 'edit',
                  text: '编辑',
                  accessKey: 'authcenter_editRole',
                  onClick: () => {
                    setModalData({ ...row, openType: 'edit' });
                    setDrawerVisit(true);
                    setReadonly(false);
                  },
                },
                {
                  key: 'remove',
                  text: '删除',
                  danger: true,
                  accessKey: 'authcenter_deleteRole',
                  onClick: () => {
                    Modal.confirm({
                      icon: <ExclamationCircleFilled />,
                      title: '确定删除角色吗？',
                      centered: true,
                      onOk: async () => {
                        return deleteRow(row);
                      },
                    });
                  },
                },
              ]}
            />
          );
        }
      },
    },
  ];
  return (
    <PageContainer
      header={{
        title: null,
        // title: '角色管理',
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<RoleListType>
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
          } as any
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('authcenter_editRole')}>
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setModalData({});
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建角色
            </Button>
          </Access>,
        ]}
        dateFormatter="string"
      />
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
