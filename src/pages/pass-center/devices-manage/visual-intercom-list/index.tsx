import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { useEffect, useRef, useState } from 'react';
import { queryDoorDeviceByPage } from '@/services/door';
import Details from './details';
import { Access, useAccess, history } from 'umi';
import { Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import SetNumber from './set-number';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [numberVisit, setNumberVisit] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>();
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.typeCodeList = ['central_management', 'entrance', 'indoor_unit'];
    const res = await queryDoorDeviceByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  useEffect(() => {}, []);

  const reload = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '设备类型',
      dataIndex: 'typeCode',
      valueType: 'select',
      valueEnum: {
        central_management: {
          text: '中心管理机',
        },
        entrance: {
          text: '门口机',
        },
        indoor_unit: {
          text: '室内机',
        },
      },
    },
    {
      title: '编号',
      dataIndex: 'locationNumber',
      ellipsis: true,
      render: (_, record) => {
        return (
          <Space>
            <span>{record.locationNumber ? record.locationNumber : '-'}</span>
            <Access accessible={access.functionAccess('alitaDoor_editCardDeviceConifg')}>
              <a
                onClick={() => {
                  setModalData(record);
                  setNumberVisit(true);
                }}
              >
                <EditOutlined />
              </a>
            </Access>
          </Space>
        );
      },
    },
    {
      title: 'DID',
      dataIndex: 'did',
      ellipsis: true,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
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
      title: '添加时间',
      dataIndex: 'registerDate',
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (text, row) => {
        const editBtn = (
          <Access key="add" accessible={access.functionAccess('alitaDoor_queryDevice1')}>
            <a
              onClick={() => {
                history.push(`/device-center/details/${row.id}`);
                // setModalData(row);
                // setModalVisit(true);
              }}
            >
              查看
            </a>
          </Access>
        );

        return editBtn;
      },
    },
  ];
  return (
    <PageContainer header={{ title: null }}>
      <ProTable<devicesListType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="id"
        search={
          {
            labelWidth: 68,
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
      />
      <Details modalVisit={modalVisit} onOpenChange={setModalVisit} data={modalData} />
      <SetNumber
        modalVisit={numberVisit}
        onSubmit={reload}
        onOpenChange={setNumberVisit}
        data={modalData}
      />
    </PageContainer>
  );
};
