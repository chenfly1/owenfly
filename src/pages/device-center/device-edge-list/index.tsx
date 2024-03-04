import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import { Modal, Tooltip, message } from 'antd';
import { history } from 'umi';
import { queryEdgeDevicePage, deleteEdgeDevice } from '@/services/device';
import { ExclamationCircleFilled } from '@ant-design/icons';
import ActionGroup from '@/components/ActionGroup';
import styles from './style.less';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project?.bid;
    const res = await queryEdgeDevicePage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const delRow = async (id: string) => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除后无法找回',
      centered: true,
      onOk: async () => {
        const res = await deleteEdgeDevice(id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('删除成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
      render: (_, record) => [
        <Tooltip key="detail" placement="topLeft" title={record.id}>
          <a
            type="link"
            onClick={() => {
              history.push(`/device-center/device-edge-list/details/${record.id}`);
            }}
          >
            {`${record.id}`}
          </a>
        </Tooltip>,
      ],
    },
    {
      title: '边缘实例',
      dataIndex: 'code',
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      search: false,
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'error',
        },
        '': {
          text: '全部',
          status: '',
        },
      },
    },
    {
      title: '注册时间',
      dataIndex: 'registerDate',
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (text, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'alitaMasdata_deleteEdgeServer',
                onClick() {
                  delRow(row.id);
                },
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <PageContainer header={{ title: null }} className={styles.cardStyle}>
      <ProTable<Record<string, any>>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="id"
        search={false}
        options={false}
        dateFormatter="string"
        headerTitle={''}
      />
    </PageContainer>
  );
};
