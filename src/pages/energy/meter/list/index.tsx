import { createRef, useRef, useState } from 'react';
import { Badge, Button, message } from 'antd';
import dayjs from 'dayjs';
import {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { EnergyState } from '@/models/useEnergy';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { useInitState } from '@/hooks/useInitState';
import { isUndefined } from 'lodash';
import {
  bindMeterCategory,
  getMeterList,
  setMeasure,
  setPublicType,
  switchMeter,
  unbindMeterCategory,
  updateMeter,
} from '@/services/energy';
import UpdateMeter, {
  PublicMeter,
  PublicMeterFormProps,
  MeasureMeter,
  MeasureMeterFormProps,
  UpdateMeterFormProps,
} from './update';
import CategorizMeter, { CategorizMeterFormProps } from './categoriz';
import SwitchMeter, { SwitchFormProps } from './switch';
import { ModalFormRef } from '@/components/ModalForm';
import { DrawerFormRef } from '@/components/DrawerForm';
import ActionGroup from '@/components/ActionGroup';
import Method from '@/utils/Method';
import MeasureTree from '../../measureTree';
import { installationStateEnum, netStateEnum } from '../../config';

const MeterList = () => {
  const [selectedRows, setSelectedRows] = useState<MeterItemType[]>([]);
  const [params, setParams] = useState<{ meterSpaceId?: string }>({ meterSpaceId: '0' });
  const [exporting, setExporting] = useState(false);
  const { categoryMap, publicTypeMap, insTypeMap, netStateMap, installStateMap } =
    useInitState<EnergyState>('useEnergy', [
      'categoryMap',
      'publicTypeMap',
      'insTypeMap',
      'netStateMap',
      'installStateMap',
    ]);
  const updateRef = createRef<DrawerFormRef<UpdateMeterFormProps>>();
  const publicRef = createRef<ModalFormRef<PublicMeterFormProps>>();
  const measureRef = createRef<ModalFormRef<MeasureMeterFormProps>>();
  const categorizRef = createRef<ModalFormRef<CategorizMeterFormProps>>();
  const switchRef = createRef<DrawerFormRef<SwitchFormProps>>();
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const columns: ProColumns<MeterItemType>[] = [
    {
      title: '仪表表号',
      key: 'syncId',
      dataIndex: 'syncId',
      order: -1,
      width: 200,
      ellipsis: true,
    },
    {
      title: '仪表名称',
      key: 'cnName',
      dataIndex: 'cnName',
      order: -2,
      width: 200,
      ellipsis: true,
    },
    {
      title: '计量位置',
      key: 'meterSpaceFullName',
      dataIndex: 'meterSpaceFullName',
      hideInSearch: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: '安装位置',
      key: 'installationSpaceName',
      dataIndex: 'installationSpaceName',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: '仪表地址',
      key: 'syncAddress',
      dataIndex: 'syncAddress',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: '公区类型',
      key: 'publicTypeName',
      dataIndex: 'publicTypeName',
      order: -5,
      valueEnum: publicTypeMap.value,
      formItemProps: { name: 'publicType' },
      fieldProps: { loading: publicTypeMap.loading },
      ellipsis: true,
      width: 100,
    },
    {
      title: '分项名称',
      key: 'insTagName',
      dataIndex: 'insTagName',
      valueEnum: categoryMap.value,
      formItemProps: { name: 'insTagId' },
      fieldProps: { loading: categoryMap.loading },
      order: -3,
      width: 100,
      ellipsis: true,
      render: (_, row) => `${row.insTagName || '未绑定'}`,
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      valueEnum: insTypeMap.value,
      initialValue: '0',
      formItemProps: { name: 'insType' },
      fieldProps: {
        allowClear: false,
        loading: insTypeMap.loading,
      },
      ellipsis: true,
      order: 0,
      width: 100,
    },
    {
      title: '网络状态',
      key: 'netStateName',
      dataIndex: 'netStateName',
      order: -4,
      valueEnum: netStateMap.value,
      formItemProps: { name: 'netState' },
      fieldProps: { loading: netStateMap.loading },
      ellipsis: true,
      width: 100,
      render: (_, row) => {
        return (
          <Badge
            status={row.netState === netStateEnum.online ? 'success' : 'error'}
            text={row.netStateName}
          />
        );
      },
    },
    {
      title: '安装状态',
      key: 'installationStateName',
      dataIndex: 'installationStateName',
      order: -7,
      valueEnum: installStateMap.value,
      formItemProps: { name: 'installationState' },
      fieldProps: { loading: installStateMap.loading },
      ellipsis: true,
      width: 100,
      render: (_, row) => {
        return (
          <Badge
            status={row.installationState === installationStateEnum.install ? 'success' : 'error'}
            text={row.installationStateName}
          />
        );
      },
    },
    {
      title: '注册时间',
      key: 'registrationTime',
      dataIndex: 'registrationTime',
      ellipsis: true,
      hideInSearch: true,
      width: 150,
    },
    {
      title: '注册时间',
      dataIndex: 'registrationTime',
      valueType: 'dateRange',
      hideInTable: true,
      order: -6,
      search: {
        transform: (value) => {
          return {
            registrationTimeStart: value[0],
            registrationTimeEnd: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      key: 'option',
      fixed: 'right',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  updateRef.current?.open({
                    id: row.id,
                    syncId: row.syncId,
                    cnName: row.cnName,
                    syncAddress: row.syncAddress,
                    meterSpaceId: row.meterSpaceId,
                    installationSpaceName: row.installationSpaceName,
                    publicType: isUndefined(row.publicType) ? undefined : `${row.publicType}`,
                  });
                },
              },
              {
                key: 'category',
                text: '分项管理',
                onClick() {
                  categorizRef.current?.open({
                    idList: [row.id],
                    syncIdList: [row.syncId],
                    insTagId: row.insTagId,
                    insType: row.insType,
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  /** 获取仪表列表 */
  const getList = async ({ current, meterSpaceId, ...rest }: ParamsType) => {
    const options = {
      ...rest,
      pageNo: current,
      includeChildMeterSpace: 0,
      meterSpaceId: `${meterSpaceId ?? 0}` === '0' ? ['0', '-1'] : [meterSpaceId],
    };
    const res = await getMeterList(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  /** 依据选择项构造批量操作参数 */
  const getSelectedRowOptions = () => {
    return selectedRows.reduce(
      (prev, item: MeterItemType) => {
        prev.idList.push(item.id);
        prev.syncIdList.push(item.syncId);
        return prev;
      },
      { idList: [] as MeterItemType['id'][], syncIdList: [] as MeterItemType['syncId'][] },
    );
  };

  const exportHandler = () => {
    setExporting(true);
    Method.exportExcel(
      '/energy/mng/ins/page',
      `仪表记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        pageNo: 1,
        pageSize: 1000,
        excel: 'export',
      },
    ).finally(() => {
      setExporting(false);
    });
  };

  /** 批量操作验证 */
  const checkRowKeys = () => {
    if (selectedRows.length === 0) {
      message.warning('请勾选行数据');
      return false;
    }
    return true;
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%" minSize={'280px'}>
          <MeasureTree
            select={(data) => {
              setParams({ meterSpaceId: data?.key });
            }}
          />
        </Pane>
        <Pane>
          <ProTable<MeterItemType, { meterSpaceId?: string }>
            cardBordered
            actionRef={tableRef}
            formRef={formRef}
            columns={columns}
            form={{ colon: false }}
            params={params}
            rowKey={'id'}
            tableAlertRender={false}
            request={getList}
            scroll={{ x: true }}
            pagination={{ showSizeChanger: true }}
            rowSelection={{
              type: 'checkbox',
              alwaysShowAlert: false,
              onChange: (_, rows) => {
                setSelectedRows(rows);
              },
            }}
            headerTitle={
              <ActionGroup
                scene="tableHeader"
                selection={{
                  count: selectedRows.length,
                }}
                actions={[
                  {
                    key: 'batchSetCategory',
                    text: '批量关联分项',
                    onClick: () => {
                      if (checkRowKeys()) {
                        categorizRef.current?.open({
                          ...getSelectedRowOptions(),
                          insTagId: undefined,
                          insType: selectedRows[0].insType,
                        });
                      }
                    },
                  },
                  {
                    key: 'batchSetPublicType',
                    text: '配置公区类型',
                    onClick: () => {
                      if (checkRowKeys()) {
                        publicRef.current?.open({
                          ...getSelectedRowOptions(),
                          publicType: undefined,
                        });
                      }
                    },
                  },
                  {
                    key: 'batchSetMeasurePos',
                    text: '关联计量位置',
                    onClick: () => {
                      if (checkRowKeys()) {
                        measureRef.current?.open({
                          ...getSelectedRowOptions(),
                          meterSpaceId: undefined,
                        });
                      }
                    },
                  },
                ]}
              />
            }
            toolBarRender={() => [
              <Button key="export" type="primary" loading={exporting} onClick={exportHandler}>
                全量导出
              </Button>,
            ]}
          />
          <UpdateMeter
            ref={updateRef}
            submit={async ({ id, ...rest }) => {
              try {
                await updateMeter(id!, rest);
                tableRef.current?.reloadAndRest?.();
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
          <PublicMeter
            ref={publicRef}
            submit={async (values, source) => {
              try {
                await setPublicType(values.publicType!, {
                  insIds: source?.idList,
                });
                tableRef.current?.reloadAndRest?.();
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
          <CategorizMeter
            ref={categorizRef}
            submit={async (values, source) => {
              try {
                if (values.insTagId) {
                  await bindMeterCategory(`${values.insTagId}`, {
                    insIds: values.idList,
                  });
                  tableRef.current?.reloadAndRest?.();
                } else if (source?.insTagId) {
                  await unbindMeterCategory(`${source.insTagId}`, {
                    insIds: values.idList,
                  });
                  tableRef.current?.reloadAndRest?.();
                }
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
          <SwitchMeter
            ref={switchRef}
            submit={async ({ base, target, exchangeType }) => {
              try {
                await switchMeter(base.id!, {
                  exchangeType,
                  syncId: target.syncId,
                  initRecord: target.initRecord,
                });
                tableRef.current?.reloadAndRest?.();
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
          <MeasureMeter
            ref={measureRef}
            submit={async (values, source) => {
              try {
                await setMeasure(values.meterSpaceId!, {
                  insIds: source?.idList,
                });
                tableRef.current?.reloadAndRest?.();
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default MeterList;
