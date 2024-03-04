import { createRef, useRef } from 'react';
import {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ModalFormRef } from '@/components/ModalForm';
import Update, { FormUpdateProps } from './update';
import Preview, { FormPreviewProps } from './preview';
import ActionGroup from '@/components/ActionGroup';
import { copyForm, getFormList, removeForm } from '@/services/flow';
import moment from 'moment';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Modal, message } from 'antd';
import { FlowSource } from '@/models/useFlow';
import { useInitState } from '@/hooks/useInitState';
import { DrawerFormRef } from '@/components/DrawerForm';

export default () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const addRef = createRef<ModalFormRef<FormUpdateProps>>();
  const updateRef = createRef<ModalFormRef<FormUpdateProps>>();
  const previewRef = createRef<DrawerFormRef<FormPreviewProps>>();
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);
  const columns: ProColumns<FormItemType>[] = [
    {
      title: '表单名称',
      key: 'name',
      dataIndex: 'name',
      order: -1,
      width: 200,
      ellipsis: true,
    },
    {
      title: '表单ID',
      key: 'code',
      dataIndex: 'code',
      order: -2,
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: '表单接口 URL',
    //   key: 'thirdServerUrl',
    //   dataIndex: 'thirdServerUrl',
    //   order: -1,
    //   width: 200,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    {
      title: '所属租户',
      key: 'tenantName',
      dataIndex: 'tenantName',
      width: 200,
      ellipsis: true,
      order: 0,
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
      title: '状态',
      key: 'formStatusMsg',
      dataIndex: 'formStatusMsg',
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
      order: -3,
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
                text: '预览',
                key: 'preview',
                onClick: () => {
                  previewRef.current?.open({
                    name: row.name,
                    schema: row.formJson ? JSON.parse(row.formJson) : null,
                  });
                },
              },
              {
                text: '编辑',
                key: 'edit',
                onClick: () => {
                  updateRef.current?.open({
                    baseForm: {
                      tenantId: row.tenantId,
                      name: row.name,
                      id: `${row.id ?? ''}`,
                      thirdServerUrl: row.thirdServerUrl,
                    },
                    designForm: { schema: row.formJson ? JSON.parse(row.formJson) : null },
                  });
                },
              },
              {
                text: '复制',
                key: 'copy',
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定复制一份 ${row.name} 表单吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await copyForm(row.id);
                      tableRef.current?.reloadAndRest?.();
                      message.success('复制成功');
                      return res;
                    },
                  });
                },
              },
              {
                text: '删除',
                key: 'remove',
                danger: true,
                hidden: row.formStatus !== 1,
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除 ${row.name} 表单吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await removeForm(row.id);
                      tableRef.current?.reloadAndRest?.();
                      message.success('删除成功');
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
    const res = await getFormList(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const refresh = (changed?: boolean) => {
    if (changed) tableRef?.current?.reloadAndRest?.();
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<FormItemType>
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
                text: '新建表单',
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
      <Update title="新建表单" ref={addRef} close={refresh} />
      <Update title="编辑表单" ref={updateRef} close={refresh} />
      <Preview ref={previewRef} submit={() => Promise.resolve(true)} />
    </PageContainer>
  );
};
