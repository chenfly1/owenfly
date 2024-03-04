import { createRef, useRef, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { DrawerFormRef } from '@/components/DrawerForm';
import ActionGroup from '@/components/ActionGroup';
import {
  batchUpdateCarbonIndicatorState,
  createCarbonIndicator,
  getCarbonIndicatorList,
  removeCarbonIndicator,
  updateCarbonIndicator,
} from '@/services/energy';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import Update, { CarbonIndicatorFormProps } from './update';
import Bind, { CarbinBindMeterFormProps } from './bind';
import Config from './config/index';

export default () => {
  const updateRef = createRef<DrawerFormRef<CarbonIndicatorFormProps>>();
  const bindRef = createRef<DrawerFormRef<CarbinBindMeterFormProps>>();
  const tableRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { carbonStateTypeMap } = useInitState<EnergyState>('useEnergy', ['carbonStateTypeMap']);
  const columns: ProColumns<CarbonIndicatorType>[] = [
    {
      title: '指标名称',
      key: 'cnName',
      dataIndex: 'cnName',
      order: 0,
      formItemProps: {
        label: '统计名称',
      },
    },
    {
      title: '统计周期',
      key: 'periodTypeName',
      dataIndex: 'periodTypeName',
      hideInSearch: true,
    },
    {
      title: '碳排放目标值',
      key: 'carbonLimit',
      dataIndex: 'carbonLimit',
      hideInSearch: true,
      render: (_, row) => {
        return `${row.carbonLimit} kg`;
      },
    },
    {
      title: '状态',
      key: 'stateName',
      dataIndex: 'stateName',
      valueEnum: carbonStateTypeMap.value,
      fieldProps: {
        loading: carbonStateTypeMap.loading,
      },
      formItemProps: {
        name: 'state',
      },
      order: -1,
    },
    {
      title: '创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '最新修改时间',
      key: 'gmtUpdated',
      dataIndex: 'gmtUpdated',
      hideInSearch: true,
    },
    {
      title: '最新修改人',
      key: 'updater',
      dataIndex: 'updater',
      hideInSearch: true,
    },
    {
      title: '备注',
      key: 'remark',
      dataIndex: 'remark',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'options',
      dataIndex: 'options',
      hideInSearch: true,
      render: (_, row: CarbonIndicatorType) => {
        // notice: 优化项
        const stateAction =
          row.state === 0
            ? {
                label: '停用',
                state: 1,
                danger: true,
              }
            : {
                label: '启用',
                state: 0,
                danger: false,
              };
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  updateRef.current?.open({
                    id: row.id,
                    cnName: row.cnName,
                    periodType: row.periodType !== undefined ? `${row.periodType}` : undefined,
                    carbonLimit: row.carbonLimit,
                    remark: row.remark,
                  });
                },
              },
              {
                key: 'bind',
                text: '绑定仪表',
                onClick() {
                  bindRef.current?.open({
                    id: row.id,
                  });
                },
              },
              {
                key: 'updateState',
                text: stateAction.label,
                danger: stateAction.danger,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定${stateAction.label} ${row.cnName} 指标吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await batchUpdateCarbonIndicatorState({
                        carbonIndexIds: [row.id],
                        carbonState: stateAction.state,
                      });
                      tableRef.current?.reloadAndRest?.();
                      return res;
                    },
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
                    title: `确定删除 ${row.cnName} 指标吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await removeCarbonIndicator(row.id);
                      tableRef.current?.reloadAndRest?.();
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

  /** 获取指标列表 */
  const getList = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getCarbonIndicatorList(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  /** 批量操作验证 */
  const checkRowKeys = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请勾选行数据');
      return false;
    }
    return true;
  };

  return (
    <PageContainer header={{ title: '' }}>
      <Config />
      <ProTable<CarbonIndicatorType>
        request={getList}
        columns={columns}
        actionRef={tableRef}
        tableAlertRender={false}
        form={{ colon: false }}
        pagination={{ showSizeChanger: true }}
        rowKey="id"
        cardBordered
        toolbar={{
          actions: [
            <Button key="create" type="primary" onClick={() => updateRef.current?.open()}>
              创建指标
            </Button>,
          ],
        }}
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            actions={[
              {
                key: 'enabled',
                text: '启用',
                onClick: () => {
                  if (checkRowKeys()) {
                    Modal.confirm({
                      icon: <ExclamationCircleFilled />,
                      title: `确定批量启用指标吗？`,
                      centered: true,
                      onOk: async () => {
                        const res = await batchUpdateCarbonIndicatorState({
                          carbonIndexIds: selectedRowKeys,
                          carbonState: 0,
                        });
                        tableRef.current?.reloadAndRest?.();
                        return res;
                      },
                    });
                  }
                },
              },
              {
                key: 'disabled',
                text: '停用',
                onClick: () => {
                  if (checkRowKeys()) {
                    Modal.confirm({
                      icon: <ExclamationCircleFilled />,
                      title: `确定批量停用指标吗？`,
                      centered: true,
                      onOk: async () => {
                        const res = await batchUpdateCarbonIndicatorState({
                          carbonIndexIds: selectedRowKeys,
                          carbonState: 1,
                        });
                        tableRef.current?.reloadAndRest?.();
                        return res;
                      },
                    });
                  }
                },
              },
            ]}
          />
        }
        rowSelection={{
          type: 'checkbox',
          alwaysShowAlert: false,
          selectedRowKeys,
          onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
      />
      <Update
        ref={updateRef}
        submit={async ({ id, ...rest }) => {
          try {
            await (id ? updateCarbonIndicator(id, rest) : createCarbonIndicator(rest));
            tableRef?.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
      <Bind ref={bindRef} submit={() => Promise.resolve(true)} />
    </PageContainer>
  );
};
