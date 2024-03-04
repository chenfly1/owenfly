import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import { useRef, useState } from 'react';
import { getQueryByPage } from '@/services/wps';
import { history } from 'umi';
import { Jump } from '@/utils';
import { PageContainer } from '@ant-design/pro-layout';
import AreaCascader from '@/components/AreaCascader';
import SyncResourceModal from './syncResourceModal';
import ActionGroup from '@/components/ActionGroup';

const getByPage = async (params: Record<string, any>) => {
  const area: string[] = params.cascader || [];
  const msg = await getQueryByPage({
    ...params,
    pageNo: params.current,
    province: area.length ? area[0] : null,
    city: area.length ? area[1] : null,
    district: area.length > 2 ? area[2] : null,
  });
  return {
    data: msg.data.items.map((i) => {
      return {
        ...i.info,
        ...i,
        address: i.info
          ? i.info.district
            ? `${i.info.province}${i.info.city}${i.info.district}`
            : `${i.info.province}${i.info.city}`
          : i.address,
      };
    }),
    // success 请返回 true， 不然 table 会停止解析数据，即使有数据
    success: true,
    // 不传会使用 data 的长度，如果是分页一定要传
    total: msg.data.page.totalItems,
  };
};

const toolBarRender = () => {
  return [
    <Button
      key="button"
      onClick={() => {
        Jump.go('/super-admin/tenant/add');
      }}
      icon={<PlusOutlined />}
      type="primary"
    >
      新建租户
    </Button>,
  ];
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [tenant, setTenant] = useState<TenantListType>();
  const columns: ProColumns<TenantListType>[] = [
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'date',

      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      order: 3,
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
      title: '所属地区',
      key: 'cascader',
      dataIndex: 'cascader',
      hideInTable: true,
      renderFormItem: () => {
        return <AreaCascader />;
      },
    },
    {
      title: '公司名称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
    },
    {
      title: '租户状态',
      dataIndex: 'state',

      ellipsis: true,
      order: 2,
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
      title: '所属地区',
      dataIndex: 'address',

      ellipsis: true,
      search: false,
    },
    {
      title: '应用数',
      dataIndex: 'openNum',

      ellipsis: true,
      search: false,
    },
    {
      title: '租户账号',
      dataIndex: 'tenantAccount',
      ellipsis: true,
      order: 1,
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      ellipsis: true,
      search: false,
    },
    {
      title: '业务人员',
      dataIndex: 'salesman',

      ellipsis: true,
      order: 0,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '邱文洁',
        },
        2: {
          text: '孙珺（卡卡）',
        },
        3: {
          text: '陈雅婧',
        },
        4: {
          text: '黄从志',
        },
      },
    },
    {
      title: '操作',
      width: 220,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  history.push(`/super-admin/tenant/edit?id=${record.id}`);
                },
              },
              {
                key: 'auth',
                text: '应用授权',
                onClick() {
                  history.push(`/super-admin/tenant/auth-list/${record.id}/${record.bid}`);
                },
              },
              {
                key: 'async',
                text: '同步资源',
                onClick() {
                  Modal.confirm({
                    title: '提示',
                    content:
                      '重新同步租户资源后，租户下的角色资源也会被重置，需要租户管理员重新为租户下的角色授权才可正常使用',
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    onOk: async () => {
                      setModalVisit(true);
                      setTenant(record);
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
  const onOpenChange = () => {
    setModalVisit(!modalVisit);
  };
  return (
    <PageContainer header={{ title: null }}>
      <ProTable<TenantListType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={{
          labelWidth: 68,
          // // defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={toolBarRender}
      />
      <SyncResourceModal
        code={tenant?.code || ''}
        tenantId={tenant?.id || ''}
        modalVisit={modalVisit}
        onOpenChange={onOpenChange}
      />
    </PageContainer>
  );
};
