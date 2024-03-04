import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import {
  doorUserBatchDelete,
  doorUserDelete,
  icCancelLose,
  icLose,
  queryUserByPage,
  reSendBatchDown,
  reSendICBatchDown,
  reSendIDBatchDown,
} from '@/services/door';
import { Button, Dropdown, Modal, message } from 'antd';
import {
  CaretDownOutlined,
  PlusOutlined,
  UploadOutlined,
  VerticalAlignBottomOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { Access, useAccess, useModel } from 'umi';
import type { MenuProps } from 'antd/es/menu';
import BatchAuth from './batch-auth';
import View from './view';
import DataMasking from '@/components/DataMasking';
import BatchFace from './batch-face';
import { exportExcel } from '@/pages/park-center/utils/constant';
import BatchBindingCardModal from './batch-IC/batch-binding-card-modal';
import ActionGroup from '@/components/ActionGroup';
import Add from './add';
import Edit from './edit';
import FaceModal from '../../voucher-manage/voucher-list/faceModal';
import IdCardModal from '../../voucher-manage/voucher-list/idCardModal';
import IcCardModal from '../../voucher-manage/voucher-list/icCardModal';
import Method from '@/utils/Method';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DoorUserListType[]>([]);
  const [batchAuthData, setBatchAuthData] = useState<any>();
  const [batchAuthVisit, setBatchAuthVisit] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [faceModalVisit, setFaceModalVisit] = useState<boolean>(false);
  const [viewData, setViewData] = useState<DoorUserListType>();
  const [batchICshow, setBatchICShow] = useState(false);
  const [faceVisit, setFaceVisit] = useState<boolean>(false);
  const [idModalVisit, setIdModalVisit] = useState<boolean>(false);
  const [icModalVisit, setIcModalVisit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);
  const [countShow] = useState<boolean>(
    initialState?.currentUser?.userName === '公安三所认证租户管理员',
  );

  const rowSelection = {
    selectedRowKeys,
    fixed: true,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRowsList: DoorUserListType[]) => {
      console.log(newSelectedRowKeys, newSelectedRowsList);
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRowsList);
    },
  };

  const reload = () => {
    actionRef.current?.reload();
  };

  // 删除
  const handleDelete = (row: any) => {
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除该人员吗',
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await doorUserDelete(row.id);
        if (res.code === 'SUCCESS') {
          reload();
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // 批量删除
  const batchDelete = () => {
    if (!selectedRows.length) return message.warn('请勾选行数据');
    const filterSelectRows = selectedRows.filter((i) => !i.autoSynced);
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      title: `确定删除${filterSelectRows.length}个人员？`,
      content: `已选${selectedRows.length}人，可删${filterSelectRows.length}人，${
        selectedRows.length - filterSelectRows.length
      }人为自动同步人员，不可以删除`,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await doorUserBatchDelete((filterSelectRows as any).map((i: any) => i.id));
        if (res.code === 'SUCCESS') {
          reload();
          setSelectedRows([]);
          setSelectedRowKeys([]);
          message.success(res.message);
        }
      },
    });
  };

  // 批量绑定IC卡
  const batchICClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warn('请勾选行数据');
      return;
    }
    setBatchICShow(true);
  };

  // IC卡批量挂失
  const setLose = async () => {
    if (selectedRowKeys.length === 0) {
      message.warn('请勾选行数据');
      return;
    }
    const filterSelectRows: any = selectedRows
      .filter((i) => i.icCard && i.icCard.status === 1)
      .map((i: any) => ({ id: i.icCard.id }));
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      // title: `确认挂失IC卡吗`,
      // content: `挂失IC卡，会将IC卡号拉入黑名单，禁止通行`,
      title: `确定挂失${filterSelectRows.length}个人员？`,
      content: `已选${selectedRows.length}人，可挂失${filterSelectRows.length}人，挂失IC卡，会将IC卡号拉入黑名单，禁止通行`,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        if (!filterSelectRows.length) return;
        const res = await icLose(filterSelectRows);
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          setSelectedRows([]);
          setSelectedRowKeys([]);
          reload();
        }
      },
    });
  };

  // IC卡批量解挂
  const cancelLose = async () => {
    if (selectedRowKeys.length === 0) {
      message.warn('请勾选行数据');
      return;
    }
    const filterSelectRows: any = selectedRows
      .filter((i) => i.icCard && i.icCard.status === 2)
      .map((i: any) => ({ id: i.icCard.id }));
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      // title: `确认取消挂失IC卡吗`,
      // content: `取消挂失IC卡，会将IC卡号从黑名单移除，恢复正常通行`,
      title: `确认取消挂失${filterSelectRows.length}个人员？`,
      content: `已选${selectedRows.length}人，可取消挂失${filterSelectRows.length}人，取消挂失IC卡，会将IC卡号从黑名单移除，恢复正常通行`,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        if (!filterSelectRows.length) return;
        const res = await icCancelLose(filterSelectRows);
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          setSelectedRows([]);
          setSelectedRowKeys([]);
          reload();
        }
      },
    });
  };

  // 查看人脸下发结果
  const setFaceModal = (data: DoorUserListType) => {
    setViewData(data);
    setFaceVisit(true);
  };
  // 查看id下发结果
  const setIDModal = (data: DoorUserListType) => {
    setViewData(data);
    setIdModalVisit(true);
  };
  // 查看ic下发结果
  const setICModal = (data: DoorUserListType) => {
    setViewData(data);
    setIcModalVisit(true);
  };

  const columns: ProColumns<DoorUserListType>[] = [
    {
      title: '人员姓名',
      dataIndex: 'name',
      width: 130,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      width: 150,
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.phone} text={record.phone} />],
    },
    {
      title: '人员类型',
      dataIndex: 'type',
      valueType: 'select',
      width: 140,
      fieldProps: {
        mode: 'multiple',
      },
      ellipsis: true,
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
      hideInSearch: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: '授权周期',
      dataIndex: 'periodId',
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
      },
      width: 200,
      search: false,
      hideInTable: !countShow,
      ellipsis: true,
      request: async () => {
        return periodList?.value as any;
      },
    },
    {
      title: '授权期限',
      dataIndex: 'time',
      width: 230,
      search: false,
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
      title: '操作时间',
      dataIndex: 'updateTime',
      width: 150,
      sorter: true,
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      width: 150,
      key: 'option',
      fixed: 'right',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '查看',
                accessKey: 'alitaDoor_queryAccessAuthList',
                onClick() {
                  setViewData(record);
                  setViewOpen(true);
                },
              },
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaDoor_modifyAccessAuthList',
                onClick() {
                  setViewData(record);
                  setEditOpen(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'alitaDoor_deleteAccessAuthList',
                hidden: record.autoSynced,
                onClick() {
                  handleDelete(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  // 批量重新下发人脸
  const reSendFace = async () => {
    if (selectedRowKeys.length === 0) return message.warning('请勾选行数据');
    try {
      setLoading(true);
      const res = await reSendBatchDown(selectedRowKeys.map((item) => ({ userId: item })));
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        setSelectedRows([]);
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
        setSelectedRows([]);
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
        setSelectedRows([]);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const itemList: MenuProps['items'] = [];

  const batchIcCard = (
    <a key="batchIcCard" onClick={batchICClick}>
      绑定IC卡
    </a>
  );
  const lossIcCard = (
    <a key="lossIcCard" onClick={setLose}>
      挂失
    </a>
  );
  const unLossIcCard = (
    <a key="unLossIcCard" onClick={cancelLose}>
      解挂
    </a>
  );

  if (access.functionAccess('alitaDoor_batchEditAccessAuthCard')) {
    itemList.push({
      key: 'batchIcCard',
      label: batchIcCard,
    });
  }
  if (access.functionAccess('alitaDoor_blackAccessAuthCard')) {
    itemList.push({
      key: 'lossIcCard',
      label: lossIcCard,
    });
  }
  if (access.functionAccess('alitaDoor_cancleBlackAccessAuthCard')) {
    itemList.push({
      key: 'unLossIcCard',
      label: unLossIcCard,
    });
  }

  const itemsRes: MenuProps['items'] = [];

  const face = <a onClick={reSendFace}>下发人脸</a>;
  const IDCard = <a onClick={reSendID}>下发ID卡号</a>;
  const ICCard = <a onClick={reSendIC}>下发IC卡黑名单</a>;

  if (access.functionAccess('alitaDoor_reSendAccessAuthFace')) {
    itemsRes.push({
      key: 'face',
      label: face,
    });
  }
  if (access.functionAccess('alitaDoor_reSendIdCard')) {
    itemsRes.push({
      key: 'IDCard',
      label: IDCard,
    });
  }
  if (access.functionAccess('alitaDoor_reSendBlackIcCard')) {
    itemsRes.push({
      key: 'ICCard',
      label: ICCard,
    });
  }

  // 批量授权
  const batchAuthClick = () => {
    setBatchAuthVisit(true);
    if (selectedRowKeys.length === 0) {
      return message.warn('请勾选行数据');
    } else {
    }
  };

  // 导出
  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 1000000;
    params.excel = 'export';
    const { HIDE_GETEWAY } = process.env;

    const door = HIDE_GETEWAY ? '' : '/door';
    exportExcel(`${door}/auth/door/user/page`, '按人员授权列表', params, 'GET');
  };

  const headerTitle = () => {
    return (
      <ActionGroup
        scene="tableHeader"
        selection={{
          count: selectedRowKeys.length,
        }}
        actions={[
          {
            key: 'batchel',
            text: '批量删除',
            accessKey: 'alitaDoor_batchDeleteAccessAuth',
            onClick: batchDelete,
          },
          {
            key: 'batchIC',
            text: 'IC卡操作',
            hidden: itemList.length === 0,
            render: (
              <Dropdown menu={{ items: itemList }} placement="bottomLeft">
                <Button>
                  IC卡操作 <CaretDownOutlined />
                </Button>
              </Dropdown>
            ),
          },
          {
            key: 'batchReSend',
            text: '批量重新下发',
            hidden: itemsRes.length === 0,
            render: (
              <Dropdown menu={{ items: itemsRes }} placement="bottomLeft">
                <Button>
                  批量重新下发 <CaretDownOutlined />
                </Button>
              </Dropdown>
            ),
          },
          {
            key: 'batchImport',
            text: '批量导入人脸',
            accessKey: 'alitaDoor_batchImportAccessAuthFace',
            // icon: <UploadOutlined />,
            onClick: () => setFaceModalVisit(true),
          },
          {
            key: 'export',
            text: '导出',
            accessKey: 'alitaDoor_outportAccessAuthList',
            // icon: <VerticalAlignBottomOutlined />,
            onClick: exportClick,
          },
        ]}
      />
    );
  };

  const getByPage = async (params: Record<string, any>, sorter: any, filter: any) => {
    console.log(sorter);
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
    params.sortBy = 'update_time';
    params.sort = sorter?.updateTime === 'ascend' ? 0 : 1;
    params.pageNo = params.current;
    setLoading(true);
    const res = await queryUserByPage(params);
    setLoading(false);
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
          periodId: (i as any).periodIds ? (i as any).periodIds.split(',') : [],
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
        actionRef={actionRef}
        loading={loading}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        scroll={{ x: 1532, y: 'calc(100vh - 330px)' }}
        tableAlertRender={false}
        rowSelection={rowSelection}
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        headerTitle={headerTitle()}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaDoor_editAccessAuthList')}>
            <Button
              onClick={() => {
                setAddOpen(true);
                // history.push('/pass-center/authorization-manage/personnel-list/add?cType=add');
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增人员
            </Button>
          </Access>,
        ]}
        pagination={{
          showSizeChanger: true,
        }}
      />
      <BatchAuth
        data={batchAuthData}
        onSubmit={reload}
        modalVisit={batchAuthVisit}
        onOpenChange={setBatchAuthVisit}
      />
      <Add modalVisit={addOpen} onOpenChange={setAddOpen} data={viewData} onSubmit={reload} />
      <Edit modalVisit={editOpen} onOpenChange={setEditOpen} data={viewData} onSubmit={reload} />
      <View open={viewOpen} onOpenChange={setViewOpen} data={viewData} />
      <BatchFace modalVisit={faceModalVisit} onOpenChange={setFaceModalVisit} onSubmit={reload} />
      <BatchBindingCardModal
        open={batchICshow}
        onOpenChange={setBatchICShow}
        onSubmit={reload}
        data={selectedRows}
      />
      <FaceModal
        modalVisit={faceVisit}
        onOpenChange={setFaceVisit}
        data={viewData as any}
        onSubmit={reload}
      />
      <IdCardModal
        modalVisit={idModalVisit}
        onOpenChange={setIdModalVisit}
        data={viewData as any}
        onSubmit={reload}
      />
      <IcCardModal
        modalVisit={icModalVisit}
        onOpenChange={setIcModalVisit}
        data={viewData as any}
        onSubmit={reload}
      />
    </PageContainer>
  );
};
