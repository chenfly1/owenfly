import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import Detail from './detail';
import { Space } from 'antd';
import { Access, useAccess } from 'umi';
import DataMasking from '@/components/DataMasking';
import { accessRecordPage } from '@/services/door';

export default () => {
  const [modalData, setModalData] = useState<AccessRecordType>();
  const [show, setShow] = useState(false);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  const columns: ProColumns<AccessRecordType>[] = [
    {
      title: '人员姓名',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'userPhone',
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.userPhone} text={record.userPhone} />],
    },
    {
      title: '人员类型',
      dataIndex: 'userType',
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
      },
      valueEnum: {
        '01': {
          text: '员工',
        },
        '02': {
          text: '客户',
        },
        '03': {
          text: '保洁人员',
        },
        '04': {
          text: '安防人员',
        },
        '05': {
          text: '快递人员',
        },
        '06': {
          text: '施工人员',
        },
        '99': {
          text: '其他',
        },
      },
    },
    {
      title: '被守护',
      dataIndex: 'familyGuard',
      valueType: 'select',
      search: false,
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
      title: '通行区域',
      dataIndex: 'passingArea',
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
      dataIndex: 'accessTimeFormat',
      search: false,
      ellipsis: true,
      // render: (text, record) => {
      //   const date = moment(Number(record.accessTime)).format('YYYY-MM-DD HH:mm:ss');
      //   return <>{date}</>;
      // },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (text, row) => {
        const editBtn = (
          <a
            key="1"
            onClick={() => {
              setShow(true);
              setModalData(row);
            }}
          >
            查看
          </a>
        );

        return (
          <Space align="center">
            <Access accessible={access.functionAccess('alitaDoor_queryAccessRecord')}>
              {editBtn}
            </Access>
          </Space>
        );
      },
    },
  ];

  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  const getByPage = async (params: Record<string, any>) => {
    params.pageNo = params.current;
    const res = await accessRecordPage(params);
    return {
      data: (res.data?.items || []).map((i) => ({
        ...i,
        userType: (i.userType as any).split(','),
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<AccessRecordType>
        columns={tableColumns}
        actionRef={actionRef}
        cardBordered
        form={{
          colon: false,
        }}
        formRef={formRef}
        request={getByPage}
        rowKey="id"
        search={{
          labelWidth: 68,
          // defaultColsNumber: 7,
        }}
        columnsState={{
          defaultValue: {
            // 配置初始值；如果配置了持久化，仅第一次生效（没有缓存的第一次），后续都按缓存处理。
            familyGuard: {
              show: false, // 该字段（年龄列）不显示在表格列中
            },
          },
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

      <Detail open={show} onOpenChange={setShow} data={modalData} />
    </PageContainer>
  );
};
