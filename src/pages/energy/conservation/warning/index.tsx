import { ActionType, ParamsType, ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Table } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  CreateWarningForm,
  UpdateWarningForm,
  CreateWarningFormProps,
  UpdateWarningFormProps,
} from './update';
import { createRef, useRef, useState } from 'react';
import { ModalFormRef } from '@/components/ModalForm';
import Style from './index.less';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import {
  createWaring,
  getMeterList,
  getMonitorList,
  getTotalPageSource,
  getWarningList,
  removeMonitor,
  removeWaringState,
  updateMonitorLimit,
  updateWaring,
  updateWaringState,
} from '@/services/energy';
import { history } from 'umi';
import { isUndefined } from 'lodash';
import Limit, { LimitFormProps } from './monitor/limit';
import { DrawerFormRef } from '@/components/DrawerForm';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const [pointType, setPointType] = useState<number>();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expendKey, setExpendKey] = useState<number>();
  const [nestedData, setNestedData] = useState<Record<string, MeterItemType[]>>({});
  const [selectedWarning, setSelectedWarning] = useState<EnergyWarningEventType>();
  const { monitorTypeMap, insTypeMap } = useInitState<EnergyState>('useEnergy', [
    'monitorTypeMap',
    'insTypeMap',
  ]);
  const limitRef = createRef<DrawerFormRef<LimitFormProps>>();
  const createWarningRef = createRef<ModalFormRef<CreateWarningFormProps>>();
  const updateWarningRef = createRef<ModalFormRef<UpdateWarningFormProps>>();
  const warningTableRef = useRef<ActionType>();
  const monitorTableRef = useRef<ActionType>();
  const eventColumns: ProColumns<EnergyWarningEventType>[] = [
    {
      title: '序号',
      key: 'id',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '名称',
      key: 'cnName',
      dataIndex: 'cnName',
      hideInSearch: true,
    },
    {
      title: '预警类别',
      key: 'monitorTypeName',
      dataIndex: 'monitorTypeName',
      valueEnum: monitorTypeMap.value,
      fieldProps: {
        loading: monitorTypeMap.loading,
      },
      formItemProps: {
        name: 'monitorTypeId',
      },
      order: 0,
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      valueEnum: insTypeMap.value,
      fieldProps: {
        loading: insTypeMap.loading,
      },
      formItemProps: {
        name: 'insType',
      },
      order: -1,
    },
    {
      title: '状态',
      key: 'monitorStateName',
      dataIndex: 'monitorStateName',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInSearch: true,
      render: (_, row) => {
        const stateAction =
          row.monitorState === 0
            ? {
                label: '停用',
                danger: true,
              }
            : {
                label: '启用',
                danger: false,
              };
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick(event) {
                  event.stopPropagation();
                  updateWarningRef.current?.open({
                    id: row.id,
                    cnName: row.cnName,
                    insType: isUndefined(row.insType) ? undefined : `${row.insType}`,
                    monitorTypeId: isUndefined(row.monitorTypeId)
                      ? undefined
                      : `${row.monitorTypeId}`,
                  });
                },
              },
              {
                key: 'updateState',
                text: stateAction.label,
                danger: stateAction.danger,
                onClick(event) {
                  event.stopPropagation();
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定${stateAction.label} ${row.cnName} 预警吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await updateWaringState(row.id);
                      warningTableRef.current?.reloadAndRest?.();
                      return res;
                    },
                  });
                },
              },
              {
                key: 'remove',
                text: '删除',
                danger: true,
                onClick(event) {
                  event.stopPropagation();
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除 ${row.cnName} 预警吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await removeWaringState(row.id);
                      warningTableRef.current?.reloadAndRest?.();
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
  const getMonitorColumns: () => ProColumns<EnergyMonitorType>[] = () => {
    if (pointType === undefined) return [];
    const unit = selectedWarning?.insType === 0 ? 'kW·h' : 'm³';
    return [
      {
        title: pointType === 0 ? '分项名称' : '计量区域',
        key: 'cnName',
        dataIndex: 'cnName',
        hideInSearch: true,
      },
      {
        title: '周期',
        key: 'periodTypeName',
        dataIndex: 'periodTypeName',
        hideInSearch: true,
      },
      {
        title: '用量上限',
        key: 'limitSize',
        dataIndex: 'limitSize',
        hideInSearch: true,
        render: (_, row) => {
          return isUndefined(row.limitSize) ? '' : `${row.limitSize} ${unit}/${row.periodTypeName}`;
        },
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        hideInSearch: true,
        render: (_, row) => {
          return (
            <ActionGroup
              limit={2}
              actions={[
                {
                  key: 'edit',
                  text: '设置上限',
                  onClick() {
                    limitRef?.current?.open({
                      ids: [row.id],
                      periodType: `${row.periodType}`,
                      limitSize: row.limitSize,
                      unit,
                    });
                  },
                },
                {
                  key: 'remove',
                  text: '删除',
                  danger: true,
                  onClick() {
                    Modal.confirm({
                      icon: <ExclamationCircleFilled />,
                      title: `确定删除 ${row.pointTypeName} 监测点吗？`,
                      centered: true,
                      onOk: async () => {
                        const res = await removeMonitor(row.id);
                        monitorTableRef.current?.reloadAndRest?.();
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
  };

  /** 获取预警事件列表 */
  const getWarningEvents = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getWarningList(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  /** 获取监测点列表 */
  const getMonitors = async ({ current, ...rest }: ParamsType) => {
    if (rest.id) {
      const options = { ...rest, pageNo: current };
      const res = await getMonitorList(options);
      const type = res?.items[0]?.pointType;
      setPointType(type);
      return {
        data: res?.items,
        success: res?.items ? true : false,
        total: res?.page?.totalItems,
      };
    }
    return {
      data: [] as EnergyMonitorType[],
      success: true,
      total: 0,
    };
  };

  const expandedRowRender = (row: EnergyMonitorType) => {
    const columns = [
      {
        title: '仪表编号',
        key: 'syncId',
        dataIndex: 'syncId',
      },
      {
        title: '仪表名称',
        key: 'cnName',
        dataIndex: 'cnName',
      },
      {
        title: '计量位置',
        key: 'meterSpaceFullName',
        dataIndex: 'meterSpaceFullName',
      },
      {
        title: '仪表状态',
        key: 'netStateName',
        dataIndex: 'netStateName',
      },
    ];
    const data = nestedData[row.id];
    return (
      <Table<MeterItemType>
        size="small"
        loading={loading[row.id] && !data}
        columns={columns}
        dataSource={nestedData[row.id]}
        pagination={false}
        scroll={{
          y: 200,
        }}
      />
    );
  };

  const expandHandler = async (expended: boolean, row: EnergyMonitorType) => {
    if (!expended && row.id == expendKey) {
      setExpendKey(undefined);
      return;
    }
    setExpendKey(row.id);
    if (loading[row.id]) return;
    try {
      setLoading({ [row.id]: true });
      const option = pointType === 0 ? { insTagId: row.relId } : { meterSpaceId: [row.relId] };
      const res = await getTotalPageSource(getMeterList, {
        ...option,
        pageNo: 1,
        pageSize: 999,
      });
      setLoading({ [row.id]: false });
      setNestedData((prev) => ({ ...prev, [row.id]: res.items }));
    } catch (err) {
      setLoading({ [row.id]: false });
    }
  };

  return (
    <PageContainer header={{ title: null }} className={Style.energy_warning}>
      <ProCard split="vertical" gutter={16}>
        <ProCard
          title="预警事件"
          type="inner"
          bodyStyle={{ padding: '24' }}
          bordered
          headerBordered
        >
          <ProTable<EnergyWarningEventType>
            columns={eventColumns}
            actionRef={warningTableRef}
            tableAlertRender={false}
            form={{ colon: false }}
            pagination={{ showSizeChanger: true }}
            rowKey="id"
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedWarning?.id ? [selectedWarning.id] : [],
              onSelect: (row) => {
                setSelectedWarning(row);
                if (row?.id !== selectedWarning?.id) {
                  setNestedData({});
                  setExpendKey(undefined);
                }
              },
            }}
            onRow={(row) => {
              return {
                onClick() {
                  setSelectedWarning(row);
                  if (row?.id !== selectedWarning?.id) {
                    setNestedData({});
                    setExpendKey(undefined);
                  }
                },
              };
            }}
            request={getWarningEvents}
            toolbar={{
              actions: [
                <Button
                  key="addTask"
                  type="primary"
                  onClick={() => {
                    createWarningRef?.current?.open();
                  }}
                >
                  新增
                </Button>,
              ],
            }}
          />
        </ProCard>
        <ProCard title="监测点" type="inner" bordered headerBordered>
          <ProTable<EnergyMonitorType, { id?: number }>
            columns={getMonitorColumns()}
            search={false}
            options={false}
            actionRef={monitorTableRef}
            params={{ id: selectedWarning?.id }}
            pagination={{ showSizeChanger: true }}
            form={{ colon: false }}
            request={getMonitors}
            expandable={{
              expandedRowRender: expandedRowRender,
              onExpand: expandHandler,
              expandedRowKeys: expendKey ? [expendKey] : [],
            }}
            rowKey="id"
            headerTitle={
              <Button
                key="addMonitor"
                type="primary"
                disabled={!selectedWarning?.id}
                onClick={() => {
                  if (selectedWarning?.id) {
                    history.push({
                      pathname: `/energy/conservation/warning/monitor`,
                      query: {
                        id: `${selectedWarning.id}`,
                        meterType: `${selectedWarning.insType}`,
                      },
                    });
                  }
                }}
              >
                新增
              </Button>
            }
          />
        </ProCard>
      </ProCard>
      <Limit
        ref={limitRef}
        submit={async (values) => {
          try {
            await updateMonitorLimit({
              monitorPointIds: values.ids,
              periodType: Number(values.periodType),
              limitSize: values.limitSize,
            });
            monitorTableRef.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
      <CreateWarningForm
        ref={createWarningRef}
        submit={async (values) => {
          try {
            await createWaring(values);
            warningTableRef?.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
      <UpdateWarningForm
        ref={updateWarningRef}
        submit={async (values) => {
          try {
            await updateWaring(values.id, { cnName: values.cnName });
            warningTableRef?.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
    </PageContainer>
  );
};
