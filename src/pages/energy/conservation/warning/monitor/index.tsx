import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, message } from 'antd';
import { createRef, useRef, useState } from 'react';
import { history } from 'umi';
import { useLocation } from 'react-router';
import Limit, { LimitFormProps } from './limit';
import Create, { CreateFormProps } from './create';
import { DrawerFormRef } from '@/components/DrawerForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import {
  getMonitorList,
  getTotalPageSource,
  removeMonitor,
  updateMonitor,
  updateMonitorLimit,
} from '@/services/energy';
import { ExclamationCircleFilled } from '@ant-design/icons';

export default () => {
  const location: any = useLocation();
  const tableRef = useRef<ActionType>();
  const [pointType, setPointType] = useState<number>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [source, setSource] = useState<EnergyMonitorType[]>([]);
  const { monitorPointPeriodTypeMap } = useInitState<EnergyState>('useEnergy', [
    'monitorPointPeriodTypeMap',
  ]);
  const limitRef = createRef<DrawerFormRef<LimitFormProps>>();
  const addRef = createRef<DrawerFormRef<CreateFormProps>>();
  const getColumns = (): ProColumns<EnergyMonitorType>[] => {
    if (pointType === undefined) return [];
    return [
      {
        title: '类型',
        key: 'pointTypeName',
        dataIndex: 'pointTypeName',
        hideInSearch: true,
      },
      {
        title: pointType === 0 ? '分项名称' : '区域名称',
        key: 'cnName',
        dataIndex: 'cnName',
        hideInSearch: true,
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        hideInSearch: true,
        render: (_, row) => {
          return (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  icon: <ExclamationCircleFilled />,
                  title: `确定删除 ${row.cnName} 监测点吗？`,
                  centered: true,
                  onOk: async () => {
                    const res = await removeMonitor(row.id);
                    tableRef.current?.reloadAndRest?.();
                    return res;
                  },
                });
              }}
            >
              删除
            </Button>
          );
        },
      },
    ];
  };

  const getList = async ({ current, ...rest }: ParamsType) => {
    if (rest.id) {
      const options: any = { pageNo: 1, pageSize: 999, ...rest };
      const res = await getTotalPageSource<EnergyMonitorType>(getMonitorList, options);
      const type = res?.items?.[0]?.pointType;
      setPointType(type);
      setSource(res?.items);
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

  return (
    <PageContainer
      header={{
        title: '预警监测点',
        onBack: () => {
          history.push({
            pathname: '/energy/conservation/warning',
          });
        },
      }}
    >
      <ProTable<EnergyMonitorType, { id?: string }>
        search={false}
        options={false}
        columns={getColumns()}
        form={{ colon: false }}
        params={{ id: location?.query?.id }}
        request={getList}
        actionRef={tableRef}
        rowKey="id"
        tableAlertRender={false}
        rowSelection={
          pointType !== undefined
            ? {
                type: 'checkbox',
                selectedRowKeys: selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys(keys as number[]);
                },
              }
            : false
        }
        pagination={false}
        cardBordered
        headerTitle={
          <Space>
            <Button
              key="create"
              type="primary"
              onClick={() => {
                addRef.current?.open({
                  pointType: pointType !== undefined ? `${pointType}` : undefined,
                  relIds: source.map((item) => item.relId),
                  insType: Number(location.query.meterType),
                });
              }}
            >
              添加监测点
            </Button>
            <Button
              key="limit"
              onClick={() => {
                if (selectedRowKeys.length === 0) {
                  message.warning('请勾选行数据');
                  return;
                }
                limitRef.current?.open({
                  ids: selectedRowKeys,
                  periodType: Object.keys(monitorPointPeriodTypeMap.value || {})[0],
                  limitSize: undefined,
                  unit: Number(location.query.meterType) === 0 ? 'kW·h' : 'm³',
                });
              }}
            >
              批量设置上限
            </Button>
          </Space>
        }
      />
      <Limit
        ref={limitRef}
        submit={async (values) => {
          try {
            await updateMonitorLimit({
              monitorPointIds: values.ids,
              periodType: Number(values.periodType),
              limitSize: values.limitSize,
            });
            tableRef.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
      <Create
        ref={addRef}
        submit={async (values) => {
          try {
            await updateMonitor(location.query.id, {
              relIds: values.relIds,
              pointType: values.pointType,
            });
            tableRef.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
    </PageContainer>
  );
};
