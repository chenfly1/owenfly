import {
  ExclamationCircleFilled,
  RedoOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, message, Modal, Space, Switch, Dropdown } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import { OnlineStateEnum, DeviceTypeEnum2 } from '../data.d';
import {
  deviceChangeState,
  deviceQueryByPage,
  deviceSync,
  parkYardDropDownList,
} from '@/services/park';
import { exportExcel } from '../../utils/constant';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [asyncOpen, setAsyncOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    const res = await deviceQueryByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const queryParkList = async () => {
    const res = await parkYardDropDownList(project.bid, {});
    return (res.data || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const onStateChange = (checked: boolean, row: any) => {
    Modal.confirm({
      title: checked ? '确定启用吗？' : '确定禁用吗？',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        const useStatus = checked ? 1 : 0;
        const res = await deviceChangeState({ id: row?.id, useStatus });
        if (res.code === 'SUCCESS') {
          actionRef.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/device', '设备信息', params, 'GET');
  };

  const columns: ProColumns<DeviceItemType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkName',
      order: 5,
      hideInTable: true,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      order: 4,
      hideInTable: true,
    },
    {
      title: '设备品牌',
      dataIndex: 'brand',
      order: 3,
      hideInTable: true,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      order: 2,
      hideInTable: true,
      valueEnum: DeviceTypeEnum2,
    },
    {
      title: '在线状态',
      dataIndex: 'status',
      order: 1,
      hideInTable: true,
      valueEnum: OnlineStateEnum,
    },
    {
      title: '设备编号',
      dataIndex: 'code',
      width: 180,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      hideInSearch: true,
      width: 120,
      ellipsis: true,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      hideInSearch: true,
      valueEnum: DeviceTypeEnum2,
      width: 120,
      ellipsis: true,
      render: (_, row) => {
        const name = DeviceTypeEnum2[row.type as any];
        if (name) {
          return name;
        } else {
          return '-';
        }
      },
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      hideInSearch: true,
      width: 120,
      ellipsis: true,
      valueEnum: OnlineStateEnum,
    },
    {
      title: '最后一次更新时间',
      dataIndex: 'statusLastUpdated',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '启用状态',
      dataIndex: 'useStatus',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
      render: (_, row) => {
        return (
          <Switch
            checked={row.useStatus === 1}
            onChange={(checked) => {
              onStateChange(checked, row);
            }}
          />
        );
      },
    },

    {
      title: '操作',
      valueType: 'option',
      ellipsis: true,
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaParking_editDevice',
                onClick() {
                  history.push(
                    `/park-center/baseInfo/equipment-info/detail?id=${row.id}&edit=${true}`,
                  );
                },
              },
              {
                key: 'detail',
                text: '查看',
                accessKey: 'alitaParking_queryDevice',
                onClick() {
                  history.push(
                    `/park-center/baseInfo/equipment-info/detail?id=${row.id}&edit=${false}`,
                  );
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const asyncClick = () => {
    const parkId: string = formRef.current?.getFieldValue('parkId');
    setAsyncOpen(true);
    form.setFieldsValue({
      parkId,
    });
  };

  const onFinish = async (formData: any) => {
    const params = {
      parkId: formData.parkId,
      projectId: project.bid,
    };
    const res = await deviceSync(params);
    if (res.code === 'SUCCESS') {
      message.success('同步成功');
      actionRef?.current?.reload();
      return true;
    }
    return false;
  };
  return (
    <PageContainer
      header={{
        // title: '设备信息',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<DeviceItemType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="id"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <>
            <Access key="2" accessible={access.functionAccess('alitaParking_syncDevice')}>
              <Button key="delete" icon={<RedoOutlined />} onClick={asyncClick}>
                同步
              </Button>
            </Access>
            <ModalForm
              layout="horizontal"
              width={500}
              open={asyncOpen}
              onFinish={onFinish}
              onOpenChange={setAsyncOpen}
              form={form}
              title="请选择车场"
            >
              <ProFormSelect
                name="parkId"
                width={300}
                label="车场名称"
                rules={[{ required: true }]}
                placeholder="请选择车场名称"
                request={queryParkList}
              />
            </ModalForm>
          </>,
        ]}
        headerTitle={
          <Space>
            <Access key="2" accessible={access.functionAccess('alitaParking_device_export')}>
              <Button icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
      />
    </PageContainer>
  );
};
