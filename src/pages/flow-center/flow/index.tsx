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
import Update, { FlowUpdateProps } from './update/index';
import Preview, { FlowPreviewProps } from './preview';
import ActionGroup from '@/components/ActionGroup';
import { deleteFlow, getFLowList, publishBpmnModel } from '@/services/flow';
import { Modal, message } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { FlowSource } from '@/models/useFlow';
import { useInitState } from '@/hooks/useInitState';
import moment from 'moment';
import { Method } from '@/utils';

export default () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const addRef = createRef<ModalFormRef<FlowUpdateProps>>();
  const updateRef = createRef<ModalFormRef<FlowUpdateProps>>();
  const previewRef = createRef<ModalFormRef<FlowPreviewProps>>();
  const { tenants } = useInitState<FlowSource>('useFlow', ['tenants']);
  const columns: ProColumns<FlowItemType>[] = [
    {
      title: '流程名称',
      key: 'name',
      dataIndex: 'name',
      order: -1,
      width: 200,
      ellipsis: true,
    },
    {
      title: '流程ID',
      key: 'modelId',
      dataIndex: 'modelId',
      order: -2,
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: '流程接口URL',
    //   key: 'url',
    //   dataIndex: 'url',
    //   order: -1,
    //   width: 200,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    {
      title: '关联表单',
      key: 'formName',
      dataIndex: 'formName',
      order: -1,
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
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
      key: 'statusMsg',
      dataIndex: 'statusMsg',
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
                  previewRef?.current?.open({
                    name: row.name,
                    modelXml: row.modelXml,
                  });
                },
              },
              {
                text: '编辑',
                key: 'edit',
                onClick: () => {
                  updateRef?.current?.open({
                    baseForm: {
                      tenantId: row.tenantId,
                      name: row.name,
                      modelKey: row.modelKey,
                      formName: row.formName,
                      id: `${row.id ?? ''}`,
                      modelId: row.modelId,
                      modelXml: row.modelXml,
                      url: row.url,
                      director: row.director,
                    },
                    settingForm: {},
                  });
                },
              },
              {
                text: '发布',
                key: 'publish',
                hidden: row.status !== 2, // 仅展示待发布状态的记录
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定发布 ${row.name} 流程吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await publishBpmnModel(`${row.modelId}`);
                      tableRef.current?.reloadAndRest?.();
                      return res;
                    },
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
                    title: `确定删除 ${row.name} 流程吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await deleteFlow({
                        ids: [`${row.id}`],
                      });
                      tableRef.current?.reloadAndRest?.();
                      message.success('删除成功');
                      return res;
                    },
                  });
                },
              },
              {
                text: '获取启动流程URL',
                hidden: row.status !== 3, // 仅展示待发布状态的记录
                key: 'demo',
                onClick: () => {
                  Method.copyText(
                    `${location.origin}/flow-center/demo/content?modelKey=${row.modelKey}&type=create`,
                  );
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
    const res = await getFLowList(options);
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
      <ProTable<FlowItemType>
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
                text: '新建流程',
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
      <Update title="新建流程" ref={addRef} close={refresh} />
      <Update title="编辑流程" ref={updateRef} close={refresh} />
      <Preview ref={previewRef} />
    </PageContainer>
  );
};
