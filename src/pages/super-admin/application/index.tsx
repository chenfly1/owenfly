import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { setMealList, delateApplication } from '@/services/wps';
import { history } from 'umi';
import OssImage from '@/components/OssImage';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import ActionGroup from '@/components/ActionGroup';
const getByPage = async (params: Record<string, any>) => {
  const msg = await setMealList({
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
  const columns: ProColumns<ApplicationListType>[] = [
    {
      title: '应用图标',
      dataIndex: 'icon',
      hideInSearch: true,
      render: (_, record) => {
        const objectId = record.extension ? JSON.parse(record.extension).icon : '';
        return (
          <OssImage
            objectId={objectId}
            business={publicMaterialLib.id}
            preview={false}
            style={{ width: '50px', height: '50px' }}
          />
        );
      },
    },
    {
      title: '创建时间',
      // key: 'showTime',
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
      title: '应用名称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
    },
    {
      title: '应用类型',
      dataIndex: 'type',

      ellipsis: true,
      render: (_, record) => {
        switch (record.type) {
          case 'base':
            return '底座应用';
          case 'verticals':
            return '垂类应用';
          default:
            return '-';
        }
      },
    },
    {
      title: '源系统',
      dataIndex: 'sourceSystem',

      ellipsis: true,
      render: (_, record) => {
        switch (record.sourceSystem) {
          case 'SELF':
            return '自建应用';
          case 'THIRD':
            return '第三方应用';
          default:
            return '-';
        }
      },
    },
    {
      title: '开通数',
      dataIndex: 'openNum',

      ellipsis: true,
      search: false,
    },
    {
      title: '版本号',
      dataIndex: 'version',

      ellipsis: true,
      search: false,
    },
    {
      title: '更新时间',
      // key: 'showTime',
      dataIndex: 'gmtUpdated',

      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'gmtUpdated',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
      search: {
        transform: (value) => {
          return {
            updateBeginDt: value[0],
            updateEndDt: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      width: 200,
      key: 'option',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  history.push(`/super-admin/application/edit?id=${record.id}`);
                },
              },
              {
                key: 'modular',
                text: '模块列表',
                onClick() {
                  history.push(
                    `/super-admin/application/modular-list?id=${record.id}&&name=${record.name}`,
                  );
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    title: '提示',
                    content: '确定删除该资源吗？',
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    onOk: async () => {
                      const res = await delateApplication({ id: record.id });
                      if (res.code === 'SUCCESS') {
                        if (actionRef.current) {
                          actionRef.current.reload();
                        }
                        message.success(res.message);
                      }
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
  return (
    <PageContainer header={{ title: null }}>
      <ProTable<ApplicationListType>
        columns={columns}
        actionRef={actionRef}
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
        toolBarRender={() => [
          <Button
            key="ApplicationCreate"
            onClick={() => {
              history.push(`/super-admin/application/edit`);
            }}
            icon={<PlusOutlined />}
            type="primary"
          >
            新建应用
          </Button>,
        ]}
      />
    </PageContainer>
  );
};
