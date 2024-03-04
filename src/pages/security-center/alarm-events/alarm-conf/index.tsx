import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import Detail from './detail';
import { Access, useAccess } from 'umi';
import {
  deleteAlarmPlan,
  getAlarmPlanPage,
  updateAlarmPlan,
  listEventTypeConfig,
} from '@/services/monitor';
import { ExclamationCircleFilled } from '@ant-design/icons';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [detailShow, setDetailShow] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, any>>();
  const access = useAccess();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const rowSelection = {
    selectedRowKeys,
    defaultSelectedRowKeys: [1],
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getAlarmPlanPage(params);
    console.log(res);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page.totalItems,
    };
  };

  // 删除行数据
  const deleteRow = async (row: AlarmPlanPageType) => {
    try {
      const res = await deleteAlarmPlan({ alarmPlanIds: [row?.id] });
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

  // 批量删除
  const deleteAll = async (ids: string[]) => {
    try {
      const res = await deleteAlarmPlan({ alarmPlanIds: ids });
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
  const delAllClick = () => {
    if (selectedRowKeys.length === 0) {
      message.info('请勾选行数据');
    } else {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定删除吗？',
        centered: true,
        onOk: async () => {
          return deleteAll(selectedRowKeys as string[]);
        },
      });
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
        const res = await updateAlarmPlan({ id: row.id, status: isOnline ? 0 : 1 });
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
  const queryEventConfigTypes = async () => {
    const res = await listEventTypeConfig({ projectId: project.bid });
    return (res.data || []).map((item: any) => ({
      label: item.eventName,
      value: item.eventTypeCode,
    }));
  };
  const columns: ProColumns<AlarmPlanPageType>[] = [
    {
      title: '告警类型',
      dataIndex: 'eventTypeCode',
      order: 0,
      hideInTable: true,
      valueType: 'select',
      request: queryEventConfigTypes,
    },
    {
      title: '告警处理描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '告警类型',
      dataIndex: 'eventTypeCode',
      valueType: 'select',
      request: queryEventConfigTypes,
      search: false,
    },
    {
      title: '告警等级',
      dataIndex: 'eventLevel',
      valueEnum: {
        1: { text: '低', status: 'Default' },
        2: { text: '中', status: 'Warning' },
        3: { text: '高', status: 'Error' },
      },
      search: false,
    },
    {
      title: '触发时间',
      dataIndex: 'gmtCreated',
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'gmtCreator',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'edit',
                text: '修改',
                accessKey: 'alitaMonitor_modifyAlarmPlan',
                onClick() {
                  setDetailShow(true);
                  setDetailData(row);
                },
              },
              {
                key: 'delete',
                text: '删除',
                danger: true,
                accessKey: 'alitaMonitor_deleteAlarmPlan',
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
        // title: '告警预案配置',
        title: null,
      }}
    >
      <ProTable<AlarmPlanPageType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        tableAlertRender={false}
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
        }}
        pagination={{
          showSizeChanger: true,
        }}
        headerTitle={
          <ActionGroup
            limit={3}
            scene="tableHeader"
            selection={{
              show: true,
              count: selectedRowKeys.length,
            }}
            actions={[
              {
                key: '1',
                text: '批量删除',
                accessKey: 'alitaMonitor_deleteAlarmPlan',
                onClick() {
                  delAllClick();
                },
              },
            ]}
          />
        }
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaMonitor_createAlarmPlan')}>
            <Button
              type="primary"
              key="add"
              onClick={() => {
                setDetailShow(true);
                setDetailData({});
              }}
            >
              新增
            </Button>
          </Access>,
        ]}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        rowSelection={rowSelection}
      />
      <Detail
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
