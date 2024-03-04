import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, Modal, Space, message } from 'antd';
import { useRef, useState } from 'react';
import Add from './add';
import styles from './style.less';
import { Access, useAccess } from 'umi';
import {
  deleteMonitoringTask,
  getFaceGroupPage,
  getMonitoringTaskPage,
  updateMonitoringTask,
  updateMonitoringTaskState,
} from '@/services/monitor';
import { CaretDownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [detailShow, setDetailShow] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, any>>();
  const access = useAccess();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getMonitoringTaskPage(params);
    console.log(res);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  // 查询人员分组
  const queryGroupList = async () => {
    const res = await getFaceGroupPage({
      pageNo: 1,
      pageSize: 1000,
    });
    return (res.data.items || []).map((item: any) => {
      return {
        ...item,
        label: item.name,
        value: item.id,
      };
    });
  };

  // 删除行数据
  const deleteRow = async (row: MonitoringTaskType) => {
    try {
      const res = await deleteMonitoringTask({ ids: [row?.id] });
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

  // 启用、禁用
  const onStateChange = (row: any) => {
    const isOnline = row.status === 1;
    Modal.confirm({
      title: isOnline ? '确定禁用吗？' : '确定启用吗？',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        const res = await updateMonitoringTaskState({ id: row.id, status: isOnline ? 0 : 1 });
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          actionRef.current?.reload();
          return true;
        } else {
          return false;
        }
      },
    });
  };
  const columns: ProColumns<MonitoringTaskType>[] = [
    {
      title: '布控任务',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '人脸分组',
      dataIndex: 'faceGroupId',
      ellipsis: true,
      valueType: 'select',
      request: queryGroupList,
    },
    {
      title: '触发时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (_, row) => {
        const isOnline = row.status === 1 ? true : false;
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'edit',
                text: '修改',
                accessKey: 'alitaMonitor_modifyMonitoringTask',
                onClick() {
                  setDetailShow(true);
                  setDetailData(row);
                },
              },
              {
                key: 'able',
                text: isOnline ? '禁用' : '启用',
                accessKey: 'alitaMonitor_modifyMonitoringTask',
                onClick() {
                  onStateChange(row);
                },
              },
              {
                key: 'delete',
                text: '删除',
                danger: true,
                accessKey: 'alitaMonitor_deleteMonitoringTask',
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除吗？',
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
      },
    },
  ];
  return (
    <PageContainer
      header={{
        // title: '布控任务管理',
        title: null,
      }}
    >
      <ProTable<MonitoringTaskType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        // tableAlertRender={false}
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 68,
          // // defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaMonitor_createMonitoringTask')}>
            <Button
              type="primary"
              key="add"
              onClick={() => {
                setDetailShow(true);
                setDetailData({});
              }}
            >
              新增布控
            </Button>
          </Access>,
        ]}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        // rowSelection={rowSelection}
      />
      <Add
        open={detailShow}
        onOpenChange={setDetailShow}
        data={detailData}
        onSubmit={() => {
          setDetailShow(false);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};
