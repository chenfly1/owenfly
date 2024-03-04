import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';

import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess } from 'umi';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import AddModelForm from './add';

const { confirm } = Modal;
import styles from './style.less';
import { onlinePlan, planCheck, queryPlanPage } from '@/services/content';
import { getProjectAllList } from '@/services/mda';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };

  const activeHandle = async (row: planContentPageType) => {
    const resd = await planCheck({ id: row.id, status: 0 });
    // 下线
    if (row.status) {
      if (resd.data.length) {
        const projectName = resd.data.map((i: any) => i.projectName).join('、');
        confirm({
          icon: <ExclamationCircleFilled />,
          title: '确认下线该计划？',
          content: (
            <p>
              计划 “{`${resd.data[0].code}-${resd.data[0].name}`}”为{projectName}
              唯一在线的首页头图计划。 是否下线该计划？下线该计划，{projectName}将不展示首页头图
            </p>
          ),
          centered: true,
          okText: '确认下线',
          onOk: async () => {
            const res = await onlinePlan({ id: row.id, status: row.status ? 0 : 1 });
            if (res.code === 'SUCCESS') {
              actionRef.current?.reload();
              message.success('操作成功');
            }
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        return;
      }
      const res = await onlinePlan({ id: row.id, status: row.status ? 0 : 1 });
      if (res.code === 'SUCCESS') {
        actionRef.current?.reload();
        message.success('操作成功');
      }
    } else {
      // 上线
      const res = await onlinePlan({ id: row.id, status: row.status ? 0 : 1 });
      if (res.code === 'SUCCESS') {
        actionRef.current?.reload();
        message.success('操作成功');
      }
    }
  };

  const columns: ProColumns<planContentPageType>[] = [
    {
      title: '计划编号',
      dataIndex: 'code',
      width: 160,
      order: 4,

      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 100,

      search: false,
      ellipsis: true,
    },
    {
      title: '计划名称',
      dataIndex: 'name',
      width: 260,

      order: 1,
      ellipsis: true,
    },
    {
      title: '创建人账号',
      dataIndex: 'creatorAccount',
      width: 160,

      order: 3,
      ellipsis: true,
    },
    {
      title: '创建人姓名',
      dataIndex: 'creator',
      width: 160,

      order: 2,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '最近修改时间',
      dataIndex: 'modifyTime',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '关联项目',
      dataIndex: 'projectBid',

      filters: false,
      ellipsis: true,
      order: 0,
      valueType: 'select',
      hideInTable: true,
      request: async () => {
        const res = await getProjectAllList();
        console.log(res);
        return (res.data.items as any).map((i: any) => ({
          value: i.bid,
          label: i.name,
        }));
      },
    },
    {
      title: '关联项目',
      dataIndex: 'projectNames',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,

      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '下线',
          status: 'Error',
        },
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaContent_editPlan',
                onClick() {
                  setEditData(record);
                  setAddModalVisit(true);
                },
              },
              {
                key: 'down',
                text: '下线',
                accessKey: 'alitaContent_onlinePlan',
                hidden: !record.status,
                danger: true,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'up',
                text: '上线',
                accessKey: 'alitaContent_onlinePlan',
                hidden: !!record.status,
                onClick() {
                  activeHandle(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    const msg = await queryPlanPage({
      ...params,
      end: 'C',
      type: 'Header',
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

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<planContentPageType>
        columns={columns}
        className={styles.tableStyle}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 85,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaContent_addPlan')}>
            <Button
              key="button"
              onClick={() => {
                setAddModalVisit(true);
                setEditData({});
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建首页头图
            </Button>
          </Access>,
        ]}
      />
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />
    </PageContainer>
  );
};
