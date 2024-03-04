import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import Detail from './detail';
import {
  businessContentPush,
  deleteAlarmEvent,
  getAlarmEventPage,
  listAllEventType,
  listEventTypeConfig,
} from '@/services/monitor';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { uniqBy } from 'lodash';
import { useLocalStorageState } from 'ahooks';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [detailShow, setDetailShow] = useState(false);
  const [detailData, setDetailData] = useState<AlarmEventPageType>();
  const [tableData, setTableData] = useState<AlarmEventPageType[]>();
  const [eventTypes, setEventTypes] = useState<Record<string, any>[]>([]);
  const [VSystem] = useLocalStorageState<any>('VSystem');
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const alitaContentSystemBid = (VSystem || []).find(
    (item: any) => item.code === 'alitaContent',
  ).bid;

  // const access = useAccess();

  const queryEventConfigTypes = async () => {
    const res = await listEventTypeConfig({ projectId: project.bid });
    return (res.data || []).map((item: any) => ({
      label: item.eventName,
      value: item.eventTypeCode,
    }));
  };

  const queryEventTypes = async () => {
    const res = await listAllEventType();
    setEventTypes(res.data || {});
  };

  useEffect(() => {
    queryEventTypes();
  }, []);

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getAlarmEventPage(params);
    setTableData(res.data?.items || []);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  // 删除行数据
  const deleteRow = async (row: AlarmEventPageType) => {
    try {
      const res = await deleteAlarmEvent({ alarmEventIds: [row?.id] });
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
      const res = await deleteAlarmEvent({ alarmEventIds: ids });
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
  // 生成推文
  const generateTweets = () => {
    // else if (
    //   !['ALERT_HIGH', 'ALERT_BATTERY', 'ALERT_CHARGE'].includes(uniqData[0].eventTypeCode) // 高空抛物告警  电瓶车乘梯告警 充电区域防火告警
    // ) {
    //   message.warn('该类型告警事件不支持生成文章');
    // }
    const sltRowDatas = tableData?.filter((item) => selectedRowKeys.includes(item.id));
    const uniqData = uniqBy(sltRowDatas, 'eventTypeCode');
    if (selectedRowKeys.length === 0) {
      message.info('请勾选行数据');
    } else if (uniqData.length >= 2) {
      message.warn('请选择相同类型的告警事件');
    } else {
      Modal.confirm({
        icon: <ExclamationCircleFilled />,
        title: '确定生成推文吗？',
        centered: true,
        onOk: async () => {
          const res = await businessContentPush({ eventIdSet: selectedRowKeys });
          if (res.code === 'SUCCESS') {
            Modal.success({
              title: '提示',
              centered: true,
              content: '文章生成成功，点击跳转查看推文详情',
              okText: '跳转',
              closable: true,
              onOk: async () => {
                window.open(
                  `/content-center/content-services/articles?id=${res.data}&systemBid=${alitaContentSystemBid}`,
                  '_blank',
                );
              },
            });
          }
        },
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    defaultSelectedRowKeys: [],
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };
  const columns: ProColumns<AlarmEventPageType>[] = [
    {
      title: '告警类型',
      dataIndex: 'eventTypeCode',
      order: 0,
      hideInTable: true,
      request: queryEventConfigTypes,
    },
    {
      title: '告警事件号',
      dataIndex: 'eventCode',
      ellipsis: true,
      search: false,
      // request: queryParkList,
    },
    {
      title: '告警类型',
      dataIndex: 'eventTypeCode',
      search: false,
      render: (_, row) => {
        // const eventName =
        //   (eventTypes.find((item) => item.eventTypeCode === row.eventTypeCode) || {}).eventName ||
        //   row.eventTypeCode;
        // if (row?.faceGroupName) {
        //   return `${eventName}-${row?.faceGroupName}`;
        // } else {
        //   return `${eventName}`;
        // }
        if (row?.faceGroupName) {
          return `${eventTypes[row.eventTypeCode]}-${row?.faceGroupName}`;
        } else {
          return `${eventTypes[row.eventTypeCode]}`;
        }
      },
    },
    {
      title: '触发设备',
      dataIndex: 'deviceName',
      search: false,
    },
    {
      title: '告警等级',
      dataIndex: 'eventLevel',
      search: false,
      valueEnum: {
        1: { text: '低', status: 'Default' },
        2: { text: '中', status: 'Warning' },
        3: { text: '高', status: 'Error' },
      },
    },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      search: false,
      valueEnum: {
        0: '无配置处理',
        1: '已发通知',
        2: '已转工单',
      },
    },
    {
      title: '触发时间',
      dataIndex: 'handleTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'detail',
                text: '告警详情',
                onClick() {
                  setDetailShow(true);
                  setDetailData(row);
                },
              },
              {
                key: 'delete',
                text: '删除',
                danger: true,
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
        // title: '告警日志',
        title: null,
      }}
    >
      <ProTable<AlarmEventPageType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        rowSelection={rowSelection}
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
        options={{
          setting: {
            listsHeight: 400,
          },
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
                onClick() {
                  delAllClick();
                },
              },
              {
                key: '2',
                text: '生成推文',
                onClick() {
                  generateTweets();
                },
              },
            ]}
          />
        }
        dateFormatter="string"
      />
      <Detail
        open={detailShow}
        onOpenChange={setDetailShow}
        data={detailData}
        onSubmit={() => {
          setDetailShow(false);
        }}
      />
    </PageContainer>
  );
};
