import { ExclamationCircleFilled, VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space, Switch } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import QrCode from './qrCode';
import { passageChangeState, passageQueryByPage } from '@/services/park';
import { exportExcel } from '../../utils/constant';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [qrShow, setQrShow] = useState<boolean>(false);
  const [qrData, setQrData] = useState<PassageDetailType>();
  const access = useAccess();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await passageQueryByPage(params);
    console.log(res);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const onStateChange = (checked: boolean, row: any) => {
    Modal.confirm({
      title: checked ? '确定启用吗？' : '确定禁用吗？',
      centered: true,
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        const useStatus = checked ? '1' : '0';
        const res = await passageChangeState({ id: row?.id, useStatus });
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
    exportExcel('/parking/mng/passage', '通道信息', params, 'GET');
  };

  const columns: ProColumns<PassageDetailType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkName',
      order: 5,
      hideInTable: true,
    },
    {
      title: '车场编号',
      order: 4,
      dataIndex: 'parkCode',
      hideInTable: true,
    },
    {
      title: '通道名称',
      order: 3,
      dataIndex: 'name',
      hideInTable: true,
    },
    {
      title: '通道使用状态',
      dataIndex: 'useStatus',
      order: 1,
      hideInTable: true,
      valueEnum: {
        1: {
          text: '启用',
        },
        0: {
          text: '禁用',
        },
      },
    },
    {
      title: '通道名称',
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '所属车场',
      dataIndex: 'parkName',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '所属区域',
      dataIndex: 'areaName',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '通道类型',
      dataIndex: 'type',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      // request: async () => {
      //   const res = await getDict('passage_type');
      //   return res.data.map((item) => ({
      //     label: item.name,
      //     value: item.code,
      //   }));
      // },
      valueEnum: {
        0: {
          text: '未定义',
        },
        1: {
          text: '入口',
        },
        2: {
          text: '出口',
        },
        3: {
          text: '出入口',
        },
      },
    },
    {
      title: '设备',
      dataIndex: 'deviceList',
      width: 250,
      ellipsis: true,
      hideInSearch: true,
      render: (_, row) => {
        if (row.deviceList.length) {
          return row.deviceList.map((item) => item.name).join('/');
        } else {
          return <>_</>;
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'useStatus',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      hideInSearch: true,
      valueEnum: {
        1: {
          text: '启用',
        },
        0: {
          text: '禁用',
        },
      },
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
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                text: '查看',
                accessKey: 'alitaParking_queryPassage',
                onClick() {
                  history.push(
                    `/park-center/baseInfo/channel-info/detail?id=${row.id}&edit=${false}`,
                  );
                },
              },
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaParking_editPassage',
                onClick() {
                  history.push(
                    `/park-center/baseInfo/channel-info/detail?id=${row.id}&edit=${true}`,
                  );
                },
              },
              {
                key: 'qrcode',
                text: '二维码',
                accessKey: 'alitaParking_passage_qrcode',
                onClick() {
                  setQrShow(true);
                  setQrData(row);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <PageContainer
      header={{
        // title: '通道信息',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<PassageDetailType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        form={{
          colon: false,
        }}
        cardBordered
        request={queryList}
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
            // // defaultColsNumber: 7,
          } as any
        }
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        headerTitle={
          <Space>
            <Access key="2" accessible={access.functionAccess('alitaParking_passage_export')}>
              <Button icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        dateFormatter="string"
      />
      <QrCode open={qrShow} onOpenChange={setQrShow} data={qrData} />
      {/* <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={readonly}
      /> */}
    </PageContainer>
  );
};
