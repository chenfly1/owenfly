import {
  ActionType,
  FormInstance,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import ModalForm from '@/components/ModalForm';
import { getQueryByDevicePage, getTenantProjects } from '@/services/device';
import { useInitState } from '@/hooks/useInitState';
import { DeviceState } from '@/models/useDevice';
import Style from './index.less';
import { Spin } from 'antd';

export interface UpgradeTaskCreateProps {
  model: string;
  devices: {
    deviceId: string;
    tenantId: string;
    projectBid: string;
    name?: string;
  }[];
}
export default ModalForm<UpgradeTaskCreateProps>(
  ({
    source,
    form,
    visible,
  }: {
    source?: UpgradeTaskCreateProps;
    form: FormInstance;
    visible: boolean;
  }) => {
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
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
    const cache = useRef<{ model?: string }>({});

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

    const columns: ProColumns<any>[] = [
      {
        order: -2,
        width: 200,
        title: '设备名称',
        key: 'name',
        dataIndex: 'name',
        ellipsis: true,
      },
      {
        order: -3,
        width: 150,
        title: '网络状态',
        key: 'status',
        dataIndex: 'status',
        ellipsis: true,
        valueEnum: {
          1: {
            text: '在线',
            status: 'Success',
          },
          0: {
            text: '离线',
            status: 'Error',
          },
        },
      },
      {
        order: 0,
        width: 200,
        title: '所属租户',
        key: 'tenantId',
        dataIndex: 'tenantId',
        formItemProps: { name: 'tenantId' },
        fieldProps: {
          loading: tenantMap.loading,
          showSearch: true,
          allowClear: false,
          filterOption: (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: tenantChangeHandler,
        },
        valueEnum: tenantMap.value,
        ellipsis: true,
        render: (_, row) => {
          return tenantMap?.value?.[row.tenantId] ?? '';
        },
      },
      {
        order: -1,
        width: 200,
        title: '所属项目',
        key: 'projectName',
        dataIndex: 'projectName',
        formItemProps: { name: 'projectId' },
        fieldProps: {
          loading: projectMap.loading,
          showSearch: true,
          filterOption: (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        },
        valueEnum: projectMap.values[projectMap.key ?? ''] ?? {},
        ellipsis: true,
      },
      {
        width: 200,
        title: 'DID',
        key: 'did',
        dataIndex: 'did',
        order: -3,
        ellipsis: true,
      },
      {
        width: 200,
        title: 'SN',
        key: 'sn',
        dataIndex: 'sn',
        hideInSearch: true,
        order: -4,
        ellipsis: true,
      },
      {
        width: 100,
        title: 'IP地址',
        key: 'ip',
        dataIndex: 'ip',
        hideInSearch: true,
        ellipsis: true,
      },
    ];

    /** 获取设备列表 */
    const getList = async ({ current, ...params }: ParamsType = {}) => {
      const values = formRef.current?.getFieldsValue();
      const options = { ...params, ...values, pageNo: current, model: source?.model };
      const res = await getQueryByDevicePage(options);
      return {
        data: res?.data?.items || [],
        success: res?.data?.items ? true : false,
        total: res?.data?.page?.totalItems,
      };
    };

    const setTenant = () => {
      if (!tenantMap.value) return;
      const initTenant = Object.keys(tenantMap.value)[0];
      formRef.current?.setFieldValue('tenantId', initTenant);
      tenantChangeHandler(initTenant);
      tableRef.current?.reloadAndRest?.();
    };

    useEffect(() => {
      if (visible) {
        setSelectedRowKeys(source?.devices.map((item) => item.deviceId) ?? []);
        if (source?.model !== cache.current.model) {
          cache.current.model = source?.model;
          formRef.current?.resetFields();
          setTenant();
        }
      }
    }, [visible]);

    useEffect(() => {
      if (tenantMap.value) {
        setTenant();
      }
    }, [tenantMap.value]);

    return (
      <>
        <ProFormSelect name="devices" hidden fieldProps={{ mode: 'multiple' }} />
        <Spin spinning={tenantMap.loading}>
          <ProTable<devicesListType>
            className={Style.upgrade_create_device}
            bordered={false}
            actionRef={tableRef}
            formRef={formRef}
            columns={columns}
            form={{
              colon: false,
              initialValues: {
                tenantId: Object.keys(tenantMap.value || {})?.[0],
              },
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
            scroll={{
              x: 'auto',
              y: 300,
            }}
            rowKey="id"
            rowSelection={{
              type: 'checkbox',
              alwaysShowAlert: false,
              selectedRowKeys,
              onChange: (newSelectedRowKeys: React.Key[], selectedRows) => {
                setSelectedRowKeys(newSelectedRowKeys);
                form.setFieldValue(
                  'devices',
                  selectedRows.map((item) => ({
                    deviceId: item.id,
                    tenantId: item.tenantId,
                    projectBid: item.projectId,
                    name: item.name,
                  })),
                );
              },
            }}
          />
        </Spin>
      </>
    );
  },
  {
    title: '选择设备',
    width: '80%',
    bodyStyle: {
      height: '500px',
      overflow: 'auto',
    },
  },
);
