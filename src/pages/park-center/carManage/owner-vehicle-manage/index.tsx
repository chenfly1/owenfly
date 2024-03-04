import {
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Dropdown } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import Add from './add';
import { platformVehicleDelete, platformVehicleQueryByPage } from '@/services/park';
import DataMasking from '@/components/DataMasking';
import { exportExcel } from '../../utils/constant';
import ActionGroup from '@/components/ActionGroup';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<PlatformVehicleType>();
  const access = useAccess();
  const [readonly, setReadonly] = useState<boolean>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await platformVehicleQueryByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  // 删除行数据
  const deleteRow = async (row: PlatformVehicleType) => {
    try {
      const id = row?.relId;
      const res = await platformVehicleDelete(id);
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

  const columns: ProColumns<PlatformVehicleType>[] = [
    {
      title: '车牌号码',
      dataIndex: 'plate',
      order: 3,
      ellipsis: true,
    },
    {
      title: '车主姓名',
      dataIndex: 'name',
      order: 2,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      ellipsis: true,
      order: 1,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '车主类型',
      dataIndex: 'userType',
      valueEnum: {
        1: '业主',
        2: '员工',
      },
      order: 0,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                accessKey: 'alitaParking_queryPlatformVehicle',
                text: '查看',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                  setReadonly(true);
                },
              },
              {
                key: 'edit',
                accessKey: 'alitaParking_modifyPlatformVehicle',
                text: '编辑',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                  setReadonly(false);
                },
              },
              {
                key: 'delete',
                accessKey: 'alitaParking_queryPlatformVehicle',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    centered: true,
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除吗？',
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
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/platform_vehicle/queryByPage', '车主车辆', params, 'POST');
  };
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
  };
  return (
    <PageContainer
      header={{
        // title: '车主车辆管理',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<PlatformVehicleType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="relId"
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
        headerTitle={
          <Space>
            <Access
              key="2"
              accessible={access.functionAccess('alitaParking_exportPlatformVehicle')}
            >
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access
            key="button"
            accessible={access.functionAccess('alitaParking_createPlatformVehicle')}
          >
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setModalData({});
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增车辆
            </Button>
          </Access>,
        ]}
      />

      <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={readonly}
      />
    </PageContainer>
  );
};
