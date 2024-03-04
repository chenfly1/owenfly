import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import {
  queryCertificatePage,
  reSendBatchDown,
  reSendICBatchDown,
  reSendIDBatchDown,
} from '@/services/door';
import { Button, Dropdown, Space, message } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd/es/menu';
import FaceModal from './faceModal';
import IdCardModal from './idCardModal';
import IcCardModal from './icCardModal';
import DataMasking from '@/components/DataMasking';
import { Access, useAccess, history } from 'umi';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [faceModalVisit, setFaceModalVisit] = useState<boolean>(false);
  const [idModalVisit, setIdModalVisit] = useState<boolean>(false);
  const [icModalVisit, setIcModalVisit] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalData, setModalData] = useState<DoorUserListType>();
  const [loading, setLoading] = useState<boolean>(false);
  const access = useAccess();

  // 新增数据
  const onSubmit = async () => {
    actionRef.current?.reload();
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    onChange: onSelectChange,
  };

  // 查看人脸下发结果
  const setFaceModal = (data: DoorUserListType) => {
    setModalData(data);
    setFaceModalVisit(true);
  };
  // 查看id下发结果
  const setIDModal = (data: DoorUserListType) => {
    setModalData(data);
    setIdModalVisit(true);
  };
  // 查看ic下发结果
  const setICModal = (data: DoorUserListType) => {
    setModalData(data);
    setIcModalVisit(true);
  };
  const columns: ProColumns<DoorUserListType>[] = [
    {
      title: '人员姓名',
      dataIndex: 'name',
      width: 130,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.phone} text={record.phone} />],
    },
    {
      title: '人员类型',
      dataIndex: 'type',
      width: 130,
      hideInTable: true,
      valueType: 'select',
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
      title: '人员类型',
      dataIndex: 'type',
      search: false,
      width: 130,
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
      title: '通行区域',
      dataIndex: 'passingArea',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '授权期限',
      dataIndex: 'time',
      width: 170,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '人脸',
      dataIndex: ['face', 'status'],
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
        if (row.face && row.face.status !== 99) {
          return (
            <a className={styles.primaryText} onClick={() => setFaceModal(row)}>
              {dom}
            </a>
          );
        } else {
          return <span>{dom}</span>;
        }
      },
    },
    {
      title: 'ID卡',
      dataIndex: ['idCard', 'authStatus'],
      search: false,
      width: 130,
      valueType: 'select',
      filters: true,
      // onFilter: true,
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
        if (row.idCard && row.idCard.authStatus !== 99) {
          return (
            <a className={styles.primaryText} onClick={() => setIDModal(row)}>
              {dom}
            </a>
          );
        } else {
          return <span>{dom}</span>;
        }
      },
    },
    {
      title: 'IC卡',
      dataIndex: 'icStatus',
      search: false,
      width: 130,
      valueType: 'select',
      filters: true,
      // onFilter: true,
      valueEnum: {
        99: {
          text: '未绑定',
          color: '#D9D9D9',
        },
        0: {
          text: '下发中',
          status: 'warning',
        },
        11: {
          text: '已绑定',
          status: 'Success',
        },
        12: {
          text: '已挂失',
          status: 'Error',
        },
        2: {
          text: '下发失败',
          status: 'Error',
        },
      },
      render(dom, row: any) {
        if (row.icStatus !== 99) {
          return (
            <a className={styles.primaryText} onClick={() => setICModal(row)}>
              {dom}
            </a>
          );
        } else {
          return <span>{dom}</span>;
        }
      },
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 140,
      key: 'option',
      render: (text, record) => {
        const check = (
          <a
            onClick={() => {
              history.push(
                '/pass-center/voucher-manage/voucher-list/history-opteration?userId=' + record.id,
              );
            }}
          >
            查看历史操作记录
          </a>
        );
        return (
          <Space align="center">
            <Access
              accessible={access.functionAccess(
                'alitaDoor_[queryAccessAuthList, queryAccessAuthHistoryList]',
              )}
            >
              {check}
            </Access>
          </Space>
        );
      },
    },
    // {
    //   title: '更新时间',
    //   dataIndex: 'updateTime',
    //   search: false,
    // },
  ];

  // 批量重新下发人脸
  const reSendFace = async () => {
    if (selectedRowKeys.length === 0) return message.warning('请勾选行数据');
    try {
      setLoading(true);
      const res = await reSendBatchDown(selectedRowKeys.map((item) => ({ userId: item })));
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // 批量重新IC卡号黑名单
  const reSendIC = async () => {
    if (selectedRowKeys.length === 0) return message.warning('请勾选行数据');
    try {
      setLoading(true);
      const res = await reSendICBatchDown(selectedRowKeys.map((item) => ({ userId: item })));
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // 批量重新下发人脸
  const reSendID = async () => {
    if (selectedRowKeys.length === 0) return message.warning('请勾选行数据');
    try {
      setLoading(true);
      const res = await reSendIDBatchDown(selectedRowKeys.map((item) => ({ userId: item })));
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const items: MenuProps['items'] = [];

  const face = <a onClick={reSendFace}>下发人脸</a>;
  const IDCard = <a onClick={reSendID}>下发ID卡号</a>;
  const ICCard = <a onClick={reSendIC}>下发IC卡黑名单</a>;

  if (access.functionAccess('alitaDoor_reSendAccessAuthFace')) {
    items.push({
      key: 'face',
      label: face,
    });
  }
  if (access.functionAccess('alitaDoor_reSendIdCard')) {
    items.push({
      key: 'IDCard',
      label: IDCard,
    });
  }
  if (access.functionAccess('alitaDoor_reSendBlackIcCard')) {
    items.push({
      key: 'ICCard',
      label: ICCard,
    });
  }

  const getByPage = async (params: Record<string, any>, sort: any, filter: any) => {
    console.log(filter);
    // 人脸
    if (filter['face,status']) {
      params.faceStatusList = filter['face,status'];
      if (filter['face,status'].some((i: any) => i == 99)) {
        params.faceStatus = 99;
      } else {
        if (params.faceStatus) delete params.faceStatus;
      }
    } else {
      if (params.faceStatusList) delete params.faceStatusList;
      if (params.faceStatus) delete params.faceStatus;
    }
    // ID卡
    if (filter['idCard,authStatus']) {
      params.idCardStatusList = filter['idCard,authStatus'];
      if (filter['idCard,authStatus'].some((i: any) => i == 99)) {
        params.idCardStatus = 99;
      } else {
        if (params.idCardStatus) delete params.idCardStatus;
      }
    } else {
      if (params.idCardStatusList) delete params.idCardStatusList;
      if (params.idCardStatus) delete params.idCardStatus;
    }
    // IC卡
    if (filter.icStatus) {
      params.icCardStatusList = filter.icStatus;
      if (filter.icStatus.some((i: any) => i == 99)) {
        params.icCardStatus = 99;
      } else {
        if (params.icCardStatus) delete params.icCardStatus;
      }
    } else {
      if (params.icCardStatusList) delete params.icCardStatusList;
      if (params.icCardStatus) delete params.icCardStatus;
    }
    params.pageNo = params.current;
    const res = await queryCertificatePage(params);
    return {
      data: (res.data?.items || []).map((i: any) => {
        // ic 先根据status判断卡状态
        // status 是0 未绑定
        // status 是1 绑定 看authstatus   1.已绑定 2.下发失败，0，下发中
        // status是2 拉黑  看authstatus   1.已拉黑 2.下发失败，0，下发中
        let icStatus = 99;
        if (i.icCard && i.icCard.status === 0) {
          icStatus = 99;
        }
        if (i.icCard && i.icCard.status === 1) {
          if (i.icCard.authStatus === 0) {
            icStatus = 0;
          } else if (i.icCard.authStatus === 1) {
            icStatus = 11;
          } else if (i.icCard.authStatus === 2) {
            icStatus = 2;
          }
        }
        if (i.icCard && i.icCard.status === 2) {
          if (i.icCard.authStatus === 0) {
            icStatus = 0;
          } else if (i.icCard.authStatus === 1) {
            icStatus = 12;
          } else if (i.icCard.authStatus === 2) {
            icStatus = 2;
          }
        }
        return {
          face: { status: 99 },
          ...i,
          time: `${i.authStart}至${i.authEnd}`,
          icStatus,
          idCard: i.idCard ? { authStatus: 99, ...i.idCard } : { authStatus: 99 },
          type: (i.type as any).split(','),
        };
      }),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <ProTable<DoorUserListType>
        columns={columns}
        loading={loading}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        scroll={{ x: 1420, y: 'calc(100vh - 310px)' }}
        tableAlertRender={false}
        rowSelection={rowSelection}
        rowKey="id"
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        headerTitle={
          items.length ? (
            <Dropdown menu={{ items }} key="drow" placement="bottomLeft">
              <Button>
                批量重新下发 <CaretDownOutlined />
              </Button>
            </Dropdown>
          ) : null
        }
        pagination={{
          showSizeChanger: true,
        }}
      />
      <FaceModal
        modalVisit={faceModalVisit}
        onOpenChange={setFaceModalVisit}
        data={modalData as any}
        onSubmit={onSubmit}
      />
      <IdCardModal
        modalVisit={idModalVisit}
        onOpenChange={setIdModalVisit}
        data={modalData as any}
        onSubmit={onSubmit}
      />
      <IcCardModal
        modalVisit={icModalVisit}
        onOpenChange={setIcModalVisit}
        data={modalData as any}
        onSubmit={onSubmit}
      />
    </PageContainer>
  );
};
