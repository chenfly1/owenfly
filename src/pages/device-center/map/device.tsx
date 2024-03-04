import {
  ActionType,
  FormInstance,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { ModalProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ModalForm from '@/components/ModalForm';
import { getQueryByDevicePage } from '@/services/device';
import { useInitState } from '@/hooks/useInitState';
import { DeviceState } from '@/models/useDevice';
import Style from './index.less';

export interface SelectDeviceProps {
  devices: devicesListType[];
  type?: 'checkbox' | 'radio';
  spaceId?: string;
  projectId?: string;
  extra?: Record<string, any>;
}
export default ({ getContainer }: { getContainer: ModalProps['getContainer'] }) =>
  ModalForm<SelectDeviceProps>(
    ({
      source,
      form,
      visible,
    }: {
      source?: SelectDeviceProps;
      form: FormInstance;
      visible: boolean;
    }) => {
      const tableRef = useRef<ActionType>();
      const formRef = useRef<ProFormInstance>();
      const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
      const { deviceTypeMap } = useInitState<DeviceState>('useDevice', ['deviceTypeMap']);
      const columns: ProColumns<devicesListType>[] = [
        {
          order: 0,
          width: 200,
          title: '上游ID',
          key: 'did',
          dataIndex: 'did',
          ellipsis: true,
        },
        {
          order: -1,
          width: 200,
          title: '设备名称',
          key: 'name',
          dataIndex: 'name',
          ellipsis: true,
        },
        {
          order: -2,
          width: 200,
          title: '设备类型',
          key: 'typeName',
          dataIndex: 'typeName',
          valueEnum: deviceTypeMap.value,
          fieldProps: { loading: deviceTypeMap.loading, getPopupContainer: getContainer as any },
          formItemProps: { name: 'typeCode' },
          ellipsis: true,
        },
        {
          order: -2,
          width: 200,
          title: '产品型号',
          key: 'model',
          dataIndex: 'model',
          ellipsis: true,
        },
        // {
        //   order: -2,
        //   width: 200,
        //   title: '关联空间',
        //   key: 'spaceName',
        //   dataIndex: 'spaceName',
        //   ellipsis: true,
        // },
        {
          order: -2,
          width: 200,
          title: '位置描述',
          key: 'positionDescription',
          dataIndex: 'positionDescription',
          ellipsis: true,
        },
        {
          order: -2,
          width: 100,
          title: 'IP地址',
          key: 'ip',
          dataIndex: 'ip',
          ellipsis: true,
        },
        {
          order: -3,
          width: 150,
          title: '网络状态',
          key: 'status',
          dataIndex: 'status',
          fieldProps: { getPopupContainer: getContainer as any },
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
      ];

      /** 获取设备列表 */
      const getList = async ({ current, ...params }: ParamsType = {}) => {
        const values = formRef.current?.getFieldsValue();
        const options = {
          ...params,
          ...values,
          pageNo: current,
          spaceId: source?.spaceId,
          projectId: source?.projectId,
          showSubordinates: true,
        };
        const res = await getQueryByDevicePage(options);
        return {
          data: res?.data?.items || [],
          success: res?.data?.items ? true : false,
          total: res?.data?.page?.totalItems,
        };
      };

      useEffect(() => {
        if (visible) {
          setSelectedRowKeys([]);
          form.setFieldValue('devices', []);
        }
      }, [visible]);

      return (
        <>
          <ProFormSelect name="devices" hidden fieldProps={{ mode: 'multiple' }} />
          <ProTable<devicesListType>
            className={Style.device_map_device}
            bordered={false}
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
            scroll={{
              x: 'auto',
              y: 300,
            }}
            rowKey="id"
            rowSelection={{
              type: source?.type ?? 'checkbox',
              alwaysShowAlert: false,
              selectedRowKeys,
              getCheckboxProps: (record) => {
                if (source?.devices?.find((item) => item.id === record.id)) {
                  return { disabled: true };
                }
                return {};
              },
              onChange: (newSelectedRowKeys: React.Key[], selectedRows) => {
                setSelectedRowKeys(newSelectedRowKeys);
                form.setFieldValue('devices', selectedRows);
              },
            }}
          />
        </>
      );
    },
    {
      title: '选择设备',
      width: '80%',
      destroyOnClose: true,
      getContainer,
      bodyStyle: {
        height: '520px',
        overflow: 'auto',
      },
    },
  );
