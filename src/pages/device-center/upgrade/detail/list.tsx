import { Modal, Spin } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef, useState } from 'react';
import {
  getDeviceUpgradeTask,
  getTenantProjects,
  removeDeviceTask,
  upgradeDeviceTask,
} from '@/services/device';
import { useInitState } from '@/hooks/useInitState';
import { DeviceState } from '@/models/useDevice';
import { StateEnum, StateMap, UpgradeResEnum, UpgradeResMap } from '../config';
import { useParams } from 'umi';

export default () => {
  const params = useParams<{ id: string }>();
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { tenantMap } = useInitState<DeviceState>('useDevice', ['tenantMap']);
  const [projectMap, setProjectMap] = useState<{
    loading: boolean;
    key?: string;
    values: Record<string, any>;
  }>({
    loading: false,
    values: {},
  });

  const tenantChangeHandler = (value: string) => {
    formRef?.current?.resetFields(['projectBid']);
    setProjectMap((prev) => ({ ...prev, key: value }));
    if (!value || projectMap.values[value]) return;
    setProjectMap((prev) => ({ ...prev, loading: true }));
    getTenantProjects({ tenantId: value })
      .then((res) => {
        const projects = res?.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.bid]: curr.name,
          }),
          {},
        );
        setProjectMap((prev) => ({
          ...prev,
          loading: false,
          values: {
            ...prev.values,
            [value]: projects,
          },
        }));
      })
      .catch(() => setProjectMap((prev) => ({ ...prev, loading: false })));
  };

  const columns: ProColumns<DeviceUpgradeTaskItemType>[] = [
    {
      order: 0,
      title: '所属租户',
      key: 'tenantName',
      dataIndex: 'tenantName',
      formItemProps: { name: 'tenantId' },
      fieldProps: {
        loading: tenantMap.loading,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        onChange: tenantChangeHandler,
      },
      valueEnum: tenantMap.value,
    },
    {
      order: -1,
      title: '所属项目',
      key: 'projectName',
      dataIndex: 'projectName',
      formItemProps: { name: 'projectBid' },
      fieldProps: {
        loading: projectMap.loading,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
      },
      valueEnum: projectMap.values[projectMap.key ?? ''] ?? {},
    },
    {
      order: -2,
      title: '设备名称',
      key: 'deviceName',
      dataIndex: 'deviceName',
    },
    {
      order: -3,
      title: 'DID',
      key: 'did',
      dataIndex: 'did',
    },
    {
      title: '所属产品',
      key: 'productName',
      dataIndex: 'productName',
      hideInSearch: true,
    },
    {
      title: '当前固件版本',
      key: 'firmwareVersion',
      dataIndex: 'firmwareVersion',
      hideInSearch: true,
    },
    {
      order: -4,
      title: '任务状态',
      key: 'state',
      dataIndex: 'state',
      valueEnum: StateMap,
    },
    {
      order: -5,
      title: '任务结果',
      key: 'upgradeResult',
      dataIndex: 'upgradeResult',
      valueEnum: UpgradeResMap,
      render: (_, row) => {
        if (row.upgradeResult === UpgradeResEnum.fail) {
          return `${UpgradeResMap[UpgradeResEnum.fail]}${row.remark ? `（${row.remark}）` : ''}`;
        }
        return UpgradeResMap[row.upgradeResult] ?? '';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'upgrade',
                text: '重新升级',
                hidden: row.state !== StateEnum.done || row.upgradeResult !== UpgradeResEnum.fail,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定重新升级此项任务吗？`,
                    centered: true,
                    onOk: async () => {
                      try {
                        await upgradeDeviceTask(row.id);
                        tableRef.current?.reloadAndRest?.();
                        return true;
                      } catch (err) {
                        return false;
                      }
                    },
                  });
                },
              },
              {
                key: 'remove',
                text: '删除',
                danger: true,
                hidden: row.state !== StateEnum.apply,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除此项任务吗？`,
                    centered: true,
                    onOk: async () => {
                      try {
                        await removeDeviceTask(row.id);
                        tableRef.current?.reloadAndRest?.();
                        return true;
                      } catch (err) {
                        return false;
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

  /** 获取任务列表 */
  const getList = async ({ current, ...rest }: ParamsType) => {
    const values = formRef.current?.getFieldsValue();
    const options = { ...rest, ...values, pageNo: current, id: params.id };
    const res = await getDeviceUpgradeTask(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  return (
    <Spin spinning={tenantMap.loading}>
      <ProTable<DeviceUpgradeTaskItemType>
        actionRef={tableRef}
        formRef={formRef}
        columns={columns}
        form={{
          colon: false,
        }}
        tableAlertRender={false}
        pagination={{ showSizeChanger: true }}
        request={getList}
        headerTitle={''}
        cardBordered
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
      />
    </Spin>
  );
};
