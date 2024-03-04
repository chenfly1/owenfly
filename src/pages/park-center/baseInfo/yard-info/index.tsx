import {
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { message, Button, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import Add from './add';
import QrCode from './qrCode';
import { factoryList, parkSyncRefresh, parkYardListByPage } from '@/services/park';
import { getProjectAllList } from '@/services/mda';
import { Access, useAccess, history } from 'umi';
import { StateEnum } from '../data.d';
import { exportExcel } from '../../utils/constant';
import ActionGroup from '@/components/ActionGroup';

export const carTypeEnum = {
  0: {
    text: '小型轿车',
  },
  BAND: {
    1: '中型车',
  },
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [qrShow, setQrShow] = useState(false);
  const [qrData, setQrData] = useState<ParkYardType>();
  const [modalData, setModalData] = useState<{ id?: number }>();
  const access = useAccess();
  const [, setReadonly] = useState<boolean>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    const res = await parkYardListByPage(params);
    console.log(res);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<ParkYardType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkName',
      order: 3,
      hideInTable: true,
    },
    {
      title: '车场编号',
      dataIndex: 'parkCode',
      order: 2,
      hideInTable: true,
    },
    {
      title: '设备品牌',
      dataIndex: 'factoryCode',
      order: 1,
      hideInTable: true,
      request: async () => {
        const res = await factoryList();
        return res.data.map((item: any) => ({
          label: item.name,
          value: item.code,
        }));
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      order: 0,
      hideInTable: true,
      valueEnum: StateEnum,
    },
    {
      title: '车场编号',
      dataIndex: 'code',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '车场名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
      valueType: 'select',
      request: async () => {
        const res = await getProjectAllList();
        return (res.data.items as any).map((i: any) => ({
          value: i.bid,
          label: i.name,
        }));
      },
    },
    {
      title: '区域数量',
      width: 100,
      ellipsis: true,
      dataIndex: 'areaNumber',
      sorter: (a, b) => (a.areaNumber > b.areaNumber ? 1 : -1),
      hideInSearch: true,
    },
    {
      title: '车位总数',
      dataIndex: 'parkNumber',
      width: 100,
      ellipsis: true,
      hideInSearch: true,
      sorter: (a, b) => (a.parkNumber > b.parkNumber ? 1 : -1),
    },
    {
      title: '设备品牌',
      dataIndex: 'factoryName',
      width: 120,
      ellipsis: true,
      valueEnum: carTypeEnum,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      width: 150,
      ellipsis: true,
      sorter: (a, b) => (a.gmtCreated > b.gmtCreated ? 1 : -1),
      hideInSearch: true,
    },
    {
      title: '车场状态',
      dataIndex: 'state',
      width: 100,
      ellipsis: true,
      hideInSearch: true,
      valueEnum: StateEnum,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                accessKey: 'alitaParking_queryPark',
                text: '查看',
                onClick() {
                  history.push(`/park-center/baseInfo/yard-info/detail?id=${row.id}`);
                },
              },
              {
                key: 'qrcode',
                accessKey: 'alitaParking_showParkCode',
                text: '二维码',
                onClick() {
                  setQrShow(true);
                  setQrData(row);
                },
              },
              {
                key: 'sync',
                accessKey: 'alitaParking_syncParkSwitch',
                text: '同步下级',
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定同步该车场数据吗？',
                    centered: true,
                    content: '同步后，车场区域及通道数据将会同步更新',
                    okText: '确认同步',
                    onOk: async () => {
                      const res = await parkSyncRefresh(row.id);
                      if (res.code === 'SUCCESS') {
                        message.success('同步成功');
                        return true;
                      }
                      return false;
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
  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/park/queryByPage', '车场信息', params, 'POST');
  };
  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<ParkYardType>
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
        headerTitle={
          <Space>
            <Access key="2" accessible={access.functionAccess('alitaParking_bindPark')}>
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('alitaParking_bindPark')}>
            <Button
              key="1"
              onClick={() => {
                setDrawerVisit(true);
                setModalData({});
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              车场项目绑定
            </Button>
          </Access>,
        ]}
      />

      <Add open={drawerVisit} onOpenChange={setDrawerVisit} onSubmit={onSubmit} data={modalData} />
      <QrCode
        open={qrShow}
        onOpenChange={setQrShow}
        data={qrData}
        onSubmit={() => {
          setQrShow(false);
        }}
      />
    </PageContainer>
  );
};
