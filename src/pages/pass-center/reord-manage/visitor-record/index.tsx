import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Space } from 'antd';
import Detail from './detail';
import { Access, useAccess } from 'umi';
import DataMasking from '@/components/DataMasking';
import { visitPassDetail, vistorRecordPage } from '@/services/door';
import moment from 'moment';

export default () => {
  const [item, setItem] = useState({});
  const [show, setShow] = useState(false);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  const columns: ProColumns<visitPassItem>[] = [
    {
      title: '访客姓名',
      dataIndex: 'visitorName',
      ellipsis: true,
    },
    {
      title: '访客手机',
      dataIndex: 'visitorPhoneNo',
      ellipsis: true,
      render: (_, record) => [
        <DataMasking key={record.visitorPhoneNo} text={record.visitorPhoneNo} />,
      ],
    },
    {
      title: '来访目的',
      dataIndex: 'visitorReason',
      ellipsis: true,
      search: false,
      valueType: 'select',
      valueEnum: {
        '01': {
          text: '快递',
        },
        '02': {
          text: '外卖',
        },
        '03': {
          text: '送货',
        },
        '04': {
          text: '搬家',
        },
        '05': {
          text: '亲友',
        },
        '06': {
          text: '商业访问',
        },
        '07': {
          text: '了解需求',
        },
        '08': {
          text: '签约下单',
        },
        '09': {
          text: '拜访约见',
        },
        '99': {
          text: '施工人员',
        },
      },
    },
    {
      title: '通行区域',
      dataIndex: 'passingAreaName',
      search: false,
      ellipsis: true,
    },
    {
      title: '通行方式',
      dataIndex: 'accessType',
      valueType: 'select',
      valueEnum: {
        1: {
          text: 'IC卡',
        },
        2: {
          text: '蓝牙',
        },
        3: {
          text: '二维码',
        },
        4: {
          text: '人脸',
        },
        11: {
          text: 'ID卡',
        },
      },
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      search: false,
      ellipsis: true,
    },
    {
      title: '通行时间',
      dataIndex: 'accessTime',
      search: false,
      ellipsis: true,
      render: (text, record) => {
        const date = moment(Number(record.accessTime)).format('YYYY-MM-DD HH:mm:ss');
        return <>{date}</>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      render: (text, record) => {
        const check = (
          <a
            onClick={async () => {
              const res = await visitPassDetail(record.id);
              if (res.code == 'SUCCESS') {
                setItem(res.data);
                setShow(true);
              }
            }}
          >
            查看
          </a>
        );
        return (
          <Space align="center">
            <Access accessible={access.functionAccess('alitaDoor_queryVisitorPassLog')}>
              {check}
            </Access>
          </Space>
        );
      },
    },
  ];

  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  const getByPage = async (params: Record<string, any>) => {
    params.pageNo = params.current;
    params.isShow = true;
    const res = await vistorRecordPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<visitPassItem>
        columns={tableColumns}
        actionRef={actionRef}
        cardBordered
        form={{
          colon: false,
        }}
        formRef={formRef}
        beforeSearchSubmit={(para) => {
          if (para.visitorLogStatus == 6) {
            para.visitorLogStatus = [4, 6];
          }
          return para;
        }}
        request={getByPage}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={{
          labelWidth: 68,
          // defaultColsNumber: 7,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        dateFormatter="string"
      />
      <Detail open={show} onOk={() => setShow(false)} data={item} onOpenChange={setShow} />
    </PageContainer>
  );
};
