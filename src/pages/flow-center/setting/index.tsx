import { createRef, useRef } from 'react';
import {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import ActionGroup from '@/components/ActionGroup';
import {
  getFormList,
  getTenantSetting,
  removeForm,
  removeTenatSetting,
  updateTenatSetting,
} from '@/services/flow';
import moment from 'moment';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { FlowSource } from '@/models/useFlow';
import { useInitState } from '@/hooks/useInitState';
import { Update, Add, UpdateTenantSettingFormProps } from './update';
import { ModalFormRef } from '@/components/ModalForm';

export default () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const addRef = createRef<ModalFormRef<UpdateTenantSettingFormProps>>();
  const updateRef = createRef<ModalFormRef<UpdateTenantSettingFormProps>>();
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);
  const columns: ProColumns<TenantSettingItemType>[] = [
    {
      title: '租户名称',
      key: 'tenantName',
      dataIndex: 'tenantName',
      order: 0,
      width: 200,
      ellipsis: true,
      valueEnum: (tenants.value || []).reduce(
        (prev: Record<string, any>, curr: FlowSource['tenants']['value'][number]) => ({
          ...prev,
          [curr.value]: curr.label,
        }),
        {},
      ),
      formItemProps: { name: 'tenantId' },
      fieldProps: { loading: tenants.loading },
    },
    {
      title: '接口 URL',
      key: 'serverAddress',
      dataIndex: 'serverAddress',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建人',
      key: 'gmtCreator',
      dataIndex: 'gmtCreator',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      key: 'gmtUpdated',
      dataIndex: 'gmtUpdated',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'gmtUpdated',
      valueType: 'dateRange',
      hideInTable: true,
      order: -1,
      search: {
        transform: (value) => {
          return {
            beginGmtUpdated: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            endGmtUpdated: moment(value[1])
              .add(1, 'day')
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                text: '编辑',
                key: 'edit',
                onClick: () => {
                  updateRef.current?.open({
                    id: row.id,
                    tenantId: row.tenantId,
                    serverAddress: row.serverAddress,
                    tag: row.tag,
                    type: row.type,
                  });
                },
              },
              {
                text: '删除',
                key: 'remove',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除 ${row.tenantName} 系统配置吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await removeTenatSetting({
                        ids: [row.id],
                      });
                      tableRef.current?.reloadAndRest?.();
                      return res;
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

  const getList = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getTenantSetting(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const refresh = () => {
    tableRef?.current?.reloadAndRest?.();
  };

  const update = async (values: any) => {
    try {
      await updateTenatSetting(values);
      tableRef.current?.reloadAndRest?.();
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<TenantSettingItemType>
        cardBordered
        actionRef={tableRef}
        formRef={formRef}
        columns={columns}
        search={
          {
            labelWidth: 90,
            labelAlign: 'left',
          } as any
        }
        form={{ colon: false }}
        rowKey={'id'}
        tableAlertRender={false}
        request={getList}
        scroll={{ x: true }}
        pagination={{ showSizeChanger: true }}
        toolBarRender={() => [
          <ActionGroup
            key="toolBar"
            scene="tableToolBar"
            actions={[
              {
                key: 'create',
                text: '接口配置',
                icon: <PlusOutlined />,
                type: 'primary',
                onClick: () => {
                  addRef.current?.open();
                },
              },
            ]}
          />,
        ]}
      />
      <Update ref={updateRef} submit={update} />
      <Add ref={addRef} submit={update} />
    </PageContainer>
  );
};
