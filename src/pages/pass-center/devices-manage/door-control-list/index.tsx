import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import { Button, Space, message } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import AddModelForm from './add';
import Details from './details';
import SetDeviceNo from './setDeviceNo';
import { Access, useAccess } from 'umi';
import { openRemote, queryDoorDeviceByPage, redownDeviceConfig } from '@/services/door';
import SetDeviceInOut from './setDeviceInOut';
import ActionGroup from '@/components/ActionGroup';
import styles from './style.less';

const valueEnum = {
  1: '进',
  2: '出',
  3: '进出',
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [modalData, setModalData] = useState<devicesListType>();
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    // 看设备能力加showAbility true
    params.showAbility = true;
    // 设备类型
    params.typeCodeList = [
      'face',
      'entrance',
      'elevator',
      'integration',
      'elevator_gateway',
      'visitor',
    ];
    const res = await queryDoorDeviceByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const reload = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备名称',
      key: 'name',
      fixed: 'left',
      width: 250,
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '设备类型',
      dataIndex: 'typeCode',
      valueType: 'select',
      width: 120,
      valueEnum: {
        face: {
          text: '人脸设备',
        },
        entrance: {
          text: '门口机',
        },
        elevator: {
          text: '梯控设备',
        },
        integration: {
          text: '一体式设备',
        },
        elevator_gateway: {
          text: '电梯网关',
        },
        visitor: {
          text: '访客机',
        },
      },
    },
    {
      title: 'DID',
      key: 'did',
      width: 180,
      dataIndex: 'did',
      ellipsis: true,
    },
    {
      title: 'IP',
      key: 'ip',
      width: 130,
      dataIndex: 'ip',
      ellipsis: true,
    },
    {
      title: '是否支持梯控',
      dataIndex: ['deviceAbility', 'elevator'],
      hideInSearch: true,
      width: 140,
      valueType: 'select',
      valueEnum: {
        true: {
          text: '是',
        },
        false: {
          text: '否',
        },
      },
    },
    {
      title: '机号',
      dataIndex: ['setDeviceConfig', 'deviceNo'],
      width: 90,
      search: false,
      ellipsis: true,
      render: (_, record) => {
        // 是否有卡能力
        const isCard = record.deviceAbility && record.deviceAbility.icCard ? true : false;
        if (!isCard) return '-';
        return (
          <Space>
            <span>
              {record.setDeviceConfig && record.setDeviceConfig.deviceNo
                ? record.setDeviceConfig.deviceNo
                : '-'}
            </span>
            <Access accessible={access.functionAccess('alitaDoor_editCardDeviceConifg')}>
              <SetDeviceNo onSubmit={reload} data={record} />
            </Access>
          </Space>
        );
      },
    },
    {
      title: '机号下发结果',
      dataIndex: ['setDeviceConfig', 'code'],
      search: false,
      ellipsis: true,
      width: 130,
      render: (dom, record) => {
        // 是否有卡能力
        const isCard = record.deviceAbility && record.deviceAbility.icCard ? true : false;
        if (!isCard || !record.setDeviceConfig) return '-';
        console.log(dom);
        return (
          <span
            className="ant-typography ant-typography-ellipsis ant-typography-single-line ant-typography-ellipsis-single-line"
            title=""
            style={{ width: '100%', margin: 0, padding: 0 }}
          >
            {record?.setDeviceConfig?.code == 1 ? (
              <span className="ant-badge ant-badge-status ant-badge-not-a-wrapper">
                <span className="ant-badge-status-dot ant-badge-status-success" />
                <span className="ant-badge-status-text">成功</span>
              </span>
            ) : (
              <span className="ant-badge ant-badge-status ant-badge-not-a-wrapper">
                <span className="ant-badge-status-dot ant-badge-status-error" />
                <span className="ant-badge-status-text">失败</span>
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: '进出口',
      dataIndex: ['doorDevice', 'inOut'],
      hideInSearch: true,
      width: 90,
      render: (_, record) => {
        // 梯控设备没有进出口
        if (record.typeCode === 'elevator') return '-';
        return (
          <Space>
            <span>
              {record.doorDevice && record.doorDevice.inOut
                ? valueEnum[record.doorDevice.inOut] || '-'
                : '-'}
            </span>
            <Access key="inout" accessible={access.functionAccess('alitaDoor_editDeviceInOut')}>
              <SetDeviceInOut onSubmit={reload} data={record} />
            </Access>
          </Space>
        );
      },
    },
    {
      title: '网络状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 90,
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'Default',
        },
        '': {
          text: '全部',
          status: '',
        },
      },
      render: (_, row: devicesListType) => {
        return (
          <span style={{ color: row.status ? '#52c41a' : '#fa5152' }}>
            {row.status ? '在线' : '离线'}
          </span>
        );
      },
    },
    {
      title: '开门状态',
      dataIndex: 'status12',
      valueType: 'select',
      width: 90,
      valueEnum: {
        1: {
          text: '开门',
          status: 'Success',
        },
        2: {
          text: '关门',
          status: 'Default',
        },
      },
      render: (_, row: devicesListType) => {
        if (!row.doorDevice || row.doorDevice.doorOpenStatus === 0) return <span>-</span>;
        return (
          <span
            style={{
              color: row.doorDevice && row.doorDevice.doorOpenStatus === 1 ? '#52c41a' : '#fa5152',
            }}
          >
            {row.doorDevice && row.doorDevice.doorOpenStatus === 1 ? '开门' : '关门'}
          </span>
        );
      },
    },
    {
      title: '添加时间',
      dataIndex: 'registerDate',
      width: 160,
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 140,
      render: (text, row) => {
        // 是否有卡能力
        const isCard = row.deviceAbility && row.deviceAbility.icCard ? true : false;
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '查看',
                accessKey: 'alitaDoor_queryDevice',
                onClick() {
                  setModalData(row);
                  setModalVisit(true);
                },
              },
              {
                key: 'rendDown',
                text: '下发机号',
                accessKey: 'alitaDoor_reAddCardDeviceConifg',
                hidden: !(
                  isCard &&
                  row.setDeviceConfig?.deviceNo &&
                  row.setDeviceConfig?.code !== '1'
                ),
                onClick: async () => {
                  const res = await redownDeviceConfig({
                    ...row.setDeviceConfig,
                  });
                  if (res.code === 'SUCCESS') {
                    message.success('操作成功');
                    reload();
                  }
                },
              },
              {
                key: 'rendDown',
                text: '开门',
                accessKey: 'alitaDoor_remoteOpenDoor',
                hidden: !row.deviceAbility?.remote,
                onClick: async () => {
                  const res = await openRemote({
                    deviceId: row.id,
                    deviceDid: row.did,
                  });
                  if (res.code === 'SUCCESS') {
                    message.success('操作成功');
                    reload();
                  }
                },
              },
            ]}
          />
        );
      },
    },
  ];
  const toolBarRender = () => {
    return [
      <Access key="add" accessible={access.functionAccess('alitaDoor_editDeviceConifg')}>
        <Button
          key="button"
          onClick={() => {
            setAddModalVisit(true);
          }}
          icon={<PlusOutlined />}
          type="primary"
        >
          IC设备配置
        </Button>
      </Access>,
    ];
  };
  return (
    <PageContainer header={{ title: null }}>
      <ProTable<devicesListType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        className={styles.cardStyle}
        formRef={formRef}
        cardBordered
        request={queryList}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="id"
        scroll={{ x: 1520, y: 'calc(100vh - 330px)' }}
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        headerTitle={''}
        toolBarRender={toolBarRender}
      />
      <AddModelForm modalVisit={addModalVisit} onOpenChange={setAddModalVisit} />
      <Details modalVisit={modalVisit} onOpenChange={setModalVisit} data={modalData} />
    </PageContainer>
  );
};
