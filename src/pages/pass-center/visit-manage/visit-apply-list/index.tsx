import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { Access, useAccess } from 'umi';
import Add from './add';
import { PlusOutlined } from '@ant-design/icons';
import { visitApplyByPage } from '@/services/door';
import DataMasking from '@/components/DataMasking';
import styles from './style.less';
import FaceModal from './faceModal';

const valueEnum = {
  1: '待来访',
  2: '已取消',
  4: '已过期',
  5: '已来访',
  6: '已过期',
};

const valueEnum1 = {
  1: '待来访',
  2: '已取消',
  4: '已过期',
  5: '已来访',
};

export default () => {
  const [visible, setVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [faceVisit, setFaceVisit] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  // 查看人脸下发结果
  const setFaceModal = (data: DoorUserListType) => {
    setModalData(data);
    setFaceVisit(true);
  };

  const columns: ProColumns<visitApplyItem>[] = [
    {
      title: '访客姓名',
      dataIndex: 'visitorName',
      width: 130,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '访客手机',
      dataIndex: 'visitorPhoneNo',
      width: 150,
      ellipsis: true,
      render: (_, record) => [
        <DataMasking key={record.visitorPhoneNo} text={record.visitorPhoneNo} />,
      ],
    },
    {
      title: '来访目的',
      dataIndex: 'visitorReason',
      width: 150,
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
          text: '其他',
        },
      },
    },
    {
      title: '来访状态',
      dataIndex: 'visitorLogStatus', // 访客单状态 0：待审核 1：已审核(待来访) 2：已取消 3：已拒绝4:已过期5.已来访6.已结束
      valueType: 'select',
      width: 130,
      hideInTable: true,
      valueEnum: valueEnum1,
    },
    {
      title: '来访状态',
      search: false,
      width: 130,
      dataIndex: 'visitorLogStatus', // 访客单状态 0：待审核 1：已审核(待来访) 2：已取消 3：已拒绝4:已过期5.已来访6.已结束
      valueType: 'select',
      valueEnum: {
        1: {
          text: <span style={{ color: '#FAAD14' }}>待来访</span>,
        },
        2: {
          text: '已取消',
        },
        4: {
          text: '已过期',
        },
        5: {
          text: '已来访',
        },
        6: {
          text: '已过期',
        },
      },
    },
    {
      title: '授权期限',
      dataIndex: 'time',
      width: 330,
      ellipsis: true,
      search: false,
    },
    {
      title: '人脸',
      dataIndex: 'authStatus',
      search: false,
      filters: true,
      width: 130,
      // onFilter: true,
      valueType: 'select',
      valueEnum: {
        99: {
          text: '未录入',
          color: '#D9D9D9',
        },
        0: {
          text: '下发中',
          status: 'warning',
        },
        1: {
          text: '下发成功',
          status: 'Success',
        },
        2: {
          text: '下发失败',
          status: 'Error',
        },
      },
      render(dom, row) {
        if (row.authStatus !== 99) {
          return (
            <a className={styles.primaryText} onClick={() => setFaceModal(row as any)}>
              {dom}
            </a>
          );
        } else {
          return <span>{dom}</span>;
        }
      },
    },
    {
      title: '车牌',
      dataIndex: 'visitorCarNo',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '下发结果',
      dataIndex: 'parkingAuthStatus',
      search: false,
      filters: true,
      width: 150,
      // onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: '成功',
          status: 'Success',
        },
        1: {
          text: '失败',
          status: 'Error',
        },
      },
    },
    {
      title: '受访人',
      width: 130,
      dataIndex: 'ownerName',
      ellipsis: true,
      search: false,
    },
    {
      title: '受访人手机',
      dataIndex: 'ownerPhoneNo',
      width: 150,
      search: false,
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.ownerPhoneNo} text={record.ownerPhoneNo} />],
    },
    {
      title: '登记时间',
      width: 150,
      sorter: true,
      dataIndex: 'invitationTimeStr',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      key: 'option',
      render: (text, record) => {
        const check = (
          <a
            onClick={() => {
              setVisible(true);
              setModalData(record);
              setIsEdit(true);
            }}
          >
            查看
          </a>
        );
        return (
          <Space align="center">
            <Access accessible={access.functionAccess('alitaDoor_queryVisitorInvitationRecord')}>
              {check}
            </Access>
          </Space>
        );
      },
    },
  ];

  // 新增数据
  const onSubmit = async () => {
    actionRef.current?.reload();
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<visitApplyItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        form={{
          colon: false,
        }}
        className={styles.cardStyle}
        formRef={formRef}
        scroll={{ x: 1980, y: 'calc(100vh - 320px)' }}
        beforeSearchSubmit={(para) => {
          if (para.visitorLogStatus == 4) {
            para.visitorLogStatusList = [4, 6];
            delete para.visitorLogStatus;
          }
          return para;
        }}
        request={async (params, sort: any, filter: any) => {
          params.pageNo = params.current;
          params.isShow = true;
          params.orderBy = 'gmt_create';
          params.sort = sort?.invitationTimeStr === 'ascend' ? 'ASC' : 'DESC';
          // 人脸
          if (filter.authStatus) {
            params.faceStatusList = filter.authStatus;
            if (filter.authStatus.some((i: any) => i == 99)) {
              params.faceStatus = 99;
            } else {
              if (params.faceStatus) delete params.faceStatus;
            }
          } else {
            if (params.faceStatusList) delete params.faceStatusList;
            if (params.faceStatus) delete params.faceStatus;
          }
          // 车牌结果
          if (filter.parkingAuthStatus) {
            params.parkingAuthStatus = filter.parkingAuthStatus;
          } else {
            if (params.parkingAuthStatus) delete params.parkingAuthStatus;
          }
          const res = await visitApplyByPage(params);
          return {
            data: (res.data?.items || []).map((i: any) => ({
              authStatus: 99,
              ...i,
              time: `${i.limitStartTime}至${i.limitEndTime}`,
            })),
            success: res.code === 'SUCCESS' ? true : false,
            total: res.data?.page?.totalItems,
          };
        }}
        rowKey="id"
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
        toolBarRender={() => [
          <Access
            key="button"
            accessible={access.functionAccess('alitaDoor_editVisitorInvitationRecord')}
          >
            <Button
              onClick={() => {
                setVisible(true);
                setModalData({});
                setIsEdit(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增访客邀约
            </Button>
          </Access>,
        ]}
        pagination={{
          showSizeChanger: true,
        }}
        dateFormatter="string"
      />
      <Add
        open={visible}
        onOpenChange={setVisible}
        onSubmit={onSubmit}
        data={modalData}
        isEdit={isEdit}
      />
      <FaceModal
        modalVisit={faceVisit}
        onOpenChange={setFaceVisit}
        data={modalData as any}
        onSubmit={onSubmit}
      />
    </PageContainer>
  );
};
