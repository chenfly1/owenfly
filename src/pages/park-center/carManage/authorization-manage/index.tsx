import {
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Badge, Button, message, Modal, Space, Upload } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import { PackageUseEnum } from '../data.d';
import PostponeModal from './postponeModal';
import RenewModal from './renewModal';
import ChangeCarModal from './changeCarModal';
import RefrePayModal from './refrePayModal';
import {
  vehicleAuthDelete,
  vehicleAuthQueryByPage,
  vehicleAuthRefund,
  vehicleAuthReview,
  authImport,
  reSendAuth,
  parkYardListByPage,
} from '@/services/park';
import DataMasking from '@/components/DataMasking';
import ApprovalModal from './approvalModal';
import { exportExcel } from '../../utils/constant';
import ActionGroup, { ActionGroupItem } from '@/components/ActionGroup';
type ImportResultType = {
  total: number;
  sucTotal: number;
  errTotal: number;
  taskId: string;
};
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  access.functionAccess = () => true;
  const [postShow, setPostShow] = useState<boolean>(false);
  const [postModalData, setPostModalData] = useState({});
  const [renewModalShow, setRenewModalShow] = useState<boolean>(false);
  const [renewModalData, setRenewModalData] = useState({});
  const [changeCarShow, setChangeCarShow] = useState<boolean>(false);
  const [changeCarData, setChangeCarData] = useState({});
  const [refrePayModalShow, setRefrePayModalShow] = useState(false);
  const [refrePayModalData, setRefrePayModalData] = useState({});
  const [count, setCount] = useState<number>(0);
  const [appOpen, setAppOpen] = useState<boolean>(false);

  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const StatusEnum = {
    '1': '下发中',
    '2': '下发成功',
    '3': '下发失败',
    '4': '待支付',
    '5': '支付失败',
    '6': '支付超时',
    '7': '即将过期',
    '8': '已过期',
  };

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await vehicleAuthQueryByPage(params);
    return {
      data: res.data?.elements || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
  };

  const queryVehicleAuthReview = async () => {
    const res = await vehicleAuthReview({
      pageNo: 1,
      pageSize: 1000,
    });
    setCount(res.data?.elements?.length || 0);
  };

  useLayoutEffect(() => {
    queryVehicleAuthReview();
  }, []);

  const columns: ProColumns<VehicleAuthType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      order: 5,
      hideInTable: true,
      valueType: 'select',
      request: queryParkList,
    },
    {
      title: '套餐用途',
      dataIndex: 'packageType',
      order: 4,
      hideInTable: true,
      valueEnum: PackageUseEnum,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      order: 3,
      width: 100,
      render: (_, row) => {
        if (row.owner && row.owner.length) {
          return row.owner.map((item) => item.plate).join('/');
        } else {
          return _;
        }
      },
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      hideInSearch: true,
      width: 120,
      ellipsis: true,
    },
    {
      title: '套餐用途',
      dataIndex: 'packageType',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
      valueEnum: PackageUseEnum,
    },
    {
      title: '车辆套餐',
      dataIndex: 'packageName',
      hideInSearch: true,
      width: 120,
      ellipsis: true,
    },
    {
      title: '车主姓名',
      dataIndex: 'ownerName',
      order: 2,
      width: 120,
      ellipsis: true,
      render: (_, row) => {
        if (row.owner && row.owner.length) {
          return row.owner.map((item) => item.name).join('/');
        } else {
          return _;
        }
      },
    },
    {
      title: '手机号',
      dataIndex: 'ownerPhone',
      order: 1,
      width: 140,
      render: (_, row) => {
        if (row.owner && row.owner.length) {
          return row.owner.map((item) => <DataMasking key="onlysee" text={item.phone} />);
        } else {
          return _;
        }
      },
    },
    {
      title: '有效期',
      key: 'gmtCreated',
      dataIndex: 'startDate',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
      valueType: 'date',
      render: (_, row) => {
        return `${row.startDate?.substring(0, 10)}/${row.endDate?.substring(0, 10)}`;
      },
    },
    {
      title: '下发状态',
      dataIndex: 'status',
      width: 150,
      hideInSearch: true,
      valueEnum: StatusEnum,
      render: (_, row: any) => {
        const text = row.statusName;
        const source = row?.source;
        const isXCX = source === '02' ? true : false;
        const cancel = (
          <Access key="6" accessible={access.functionAccess('alitaParking_refund')}>
            <a
              onClick={() => {
                Modal.confirm({
                  title: '取消授权',
                  icon: <ExclamationCircleFilled />,
                  content: '确定取消该车辆授权，取消后，该车辆无法正常通行',
                  centered: true,
                  onOk: async () => {
                    const res = await vehicleAuthDelete(row.id);
                    if (res.code === 'SUCCESS') {
                      message.success('取消授权成功');
                      actionRef.current?.reload();
                    }
                  },
                });
              }}
            >
              取消授权
            </a>
          </Access>
        );
        const reAuth = (
          <Access key="7" accessible={access.functionAccess('alitaParking_refund')}>
            <a
              onClick={() => {
                Modal.confirm({
                  title: '重新下发',
                  icon: <ExclamationCircleFilled />,
                  content: '确定重新下发吗',
                  centered: true,
                  onOk: async () => {
                    const res = await reSendAuth(row);
                    if (res.code === 'SUCCESS') {
                      message.success('重新下发成功');
                      actionRef.current?.reload();
                    }
                  },
                });
              }}
            >
              重新下发
            </a>
          </Access>
        );
        const reFee = (
          <Access key="6" accessible={access.functionAccess('alitaParking_refund')}>
            <a
              onClick={async () => {
                setRefrePayModalShow(true);
                setRefrePayModalData(row);
              }}
            >
              重新支付
            </a>
          </Access>
        );

        switch (row.status) {
          case '1': // 下发中
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {cancel}
              </Space>
            );
          case '2': // 下发成功
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {cancel}
              </Space>
            );
          case '3': // 下发失败
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {reAuth}
              </Space>
            );
          case '4': // 待支付
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {!isXCX && reFee}
              </Space>
            );
          case '5': // 支付失败
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {!isXCX && reFee}
              </Space>
            );
          case '6': // 支付超时
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {!isXCX && reFee}
              </Space>
            );
          case '7': // 即将过期
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
                {cancel}
              </Space>
            );
          case '8': // 已过期
            return (
              <Space>
                <div style={{ width: '60px' }}>{text}</div>
              </Space>
            );
        }
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      render: (_, row) => {
        const isSuccessStatus = row.status === '2'; // 下发成功
        const isInvalid = row.status === '8'; // 已过期
        let actions: ActionGroupItem[] = [];
        switch (row.packageType as string) {
          case '产权':
            actions = [
              {
                key: 'detail',
                accessKey: 'alitaParking_list2',
                text: '查看',
                onClick() {
                  history.push({
                    pathname: '/park-center/carManage/authorization-manage/detail',
                    query: {
                      id: row?.id || '',
                      readonly: 'true',
                    },
                  });
                },
              },
              {
                key: 'changeCarNo',
                accessKey: 'alitaParking_plateChange',
                text: '更换车牌',
                hidden: !isSuccessStatus,
                onClick() {
                  setChangeCarShow(true);
                  setChangeCarData(row);
                },
              },
              {
                key: 'postpone',
                accessKey: 'alitaParking_postpone',
                text: '延期',
                onClick() {
                  setPostShow(true);
                  setPostModalData(row);
                },
              },
            ];
            break;
          case '月租':
            actions = [
              {
                key: 'detail',
                accessKey: 'alitaParking_list2',
                text: '查看',
                onClick() {
                  history.push({
                    pathname: '/park-center/carManage/authorization-manage/detail',
                    query: {
                      id: row?.id || '',
                      readonly: 'true',
                    },
                  });
                },
              },
              {
                key: 'renew',
                accessKey: 'alitaParking_renew',
                text: '续费',
                onClick() {
                  setRenewModalData(row);
                  setRenewModalShow(true);
                },
              },
              {
                key: 'changeCarNo',
                accessKey: 'alitaParking_plateChange',
                text: '更换车牌',
                hidden: !isSuccessStatus,
                onClick() {
                  setChangeCarShow(true);
                  setChangeCarData(row);
                },
              },
              {
                key: 'returnFee',
                accessKey: 'alitaParking_refund',
                text: '退费',
                hidden: isInvalid,
                onClick() {
                  Modal.confirm({
                    title: '退费',
                    icon: <ExclamationCircleFilled />,
                    content: '确定退费该车辆，退费进行线下财务退回，平台将清除该车辆的权限',
                    centered: true,
                    onOk: async () => {
                      const res = await vehicleAuthRefund(row.id);
                      if (res.code === 'SUCCESS') {
                        message.success('退费成功');
                        actionRef.current?.reload();
                      }
                    },
                  });
                },
              },
            ];
            break;
          case '免费':
            actions = [
              {
                key: 'detail',
                accessKey: 'alitaParking_list2',
                text: '查看',
                onClick() {
                  history.push({
                    pathname: '/park-center/carManage/authorization-manage/detail',
                    query: {
                      id: row?.id || '',
                      readonly: 'true',
                    },
                  });
                },
              },
              {
                key: 'postpone',
                accessKey: 'alitaParking_postpone',
                text: '延期',
                onClick() {
                  setPostShow(true);
                  setPostModalData(row);
                },
              },
              {
                key: 'changeCarNo',
                accessKey: 'alitaParking_plateChange',
                text: '更换车牌',
                hidden: !isSuccessStatus,
                onClick() {
                  setChangeCarShow(true);
                  setChangeCarData(row);
                },
              },
            ];
            break;
          case '其它':
            actions = [
              {
                key: 'detail',
                accessKey: 'alitaParking_list2',
                text: '查看',
                onClick() {
                  history.push({
                    pathname: '/park-center/carManage/authorization-manage/detail',
                    query: {
                      id: row?.id || '',
                      readonly: 'true',
                    },
                  });
                },
              },
              {
                key: 'postpone',
                accessKey: 'alitaParking_postpone',
                text: '延期',
                onClick() {
                  setPostShow(true);
                  setPostModalData(row);
                },
              },
              {
                key: 'changeCarNo',
                accessKey: 'alitaParking_plateChange',
                text: '更换车牌',
                hidden: !isSuccessStatus,
                onClick() {
                  setChangeCarShow(true);
                  setChangeCarData(row);
                },
              },
            ];
            break;
        }
        return <ActionGroup limit={3} actions={actions} />;
      },
    },
  ];
  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    exportExcel('/parking/mng/vehicle_auth/export', '授权管理', params);
  };
  const onPostSubmit = () => {
    setPostShow(false);
    actionRef.current?.reload();
  };
  const onRenewModalSubmit = () => {
    setPostShow(false);
    actionRef.current?.reload();
  };
  // 变更车牌
  const onChangeCarSubmit = async () => {
    setChangeCarShow(false);
    actionRef.current?.reload();
  };

  const refrePayModalSubmit = () => {
    setRefrePayModalShow(false);
    queryVehicleAuthReview();
    actionRef.current?.reload();
  };

  const onAppSubmit = () => {
    setAppOpen(false);
  };

  const beforeUpload = (file: any) => {
    // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
    const isFormat =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // 校验图片大小
    const is5M = file.size / 1024 / 1024 < 5;

    if (!isFormat) {
      message.error('仅支持.xlsx格式文件');
      // return Upload.LIST_IGNORE;
    } else if (!is5M) {
      message.error('文件不能超过10M,请重新选择文件');
      return Upload.LIST_IGNORE;
    }
    return isFormat && is5M;
  };

  const resultModal = (
    res: ResultData<ImportResultType>,
    title: string,
    successText: string,
    errorText: string,
  ) => {
    if (res.code === 'SUCCESS' && res.data?.errTotal > 0) {
      Modal.confirm({
        title,
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            {successText}
            <a>{res.data?.sucTotal}</a>条{errorText}
            <a style={{ color: 'red' }}>{res.data.errTotal}</a>条
          </div>
        ),
        okText: '导出失败数据',
        async onOk() {
          exportExcel(
            `/parking/mng/vehicle_auth/batch/export/${res.data.taskId}`,
            '批量授权失败数据',
            {},
          );
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      actionRef.current?.reload();
    } else if (res.code === 'SUCCESS' && res.data?.errTotal === 0) {
      Modal.success({
        title,
        icon: <ExclamationCircleFilled />,
        content: (
          <div>
            成功处理数据<a>{res.data?.sucTotal}</a>条
          </div>
        ),
        onCancel() {
          console.log('Cancel');
        },
      });
    }
  };

  const upload = async (options: any) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', project.bid);
    const res = await authImport(formData);
    resultModal(res as ResultData<ImportResultType>, '批量导入', '导入成功数据', '导入失败数据');
  };

  return (
    <PageContainer
      header={{
        // title: '授权管理',
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<VehicleAuthType>
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
            defaultColsNumber: 1,
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
            <Access key="1" accessible={access.functionAccess('alitaParking_vehicle_authall')}>
              <Upload
                accept=".xlsx"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={upload}
              >
                <Button>批量导入</Button>
              </Upload>
            </Access>
            <Access key="2" accessible={access.functionAccess('alitaParking_vehicle_authall')}>
              <Button
                key="export"
                onClick={() => {
                  exportExcel('/parking/mng/vehicle_auth/batch', '批量授权', {});
                }}
              >
                下载模板
              </Button>
            </Access>
            <Access key="3" accessible={access.functionAccess('alitaParking_vehicle_authall')}>
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('alitaParking_vehicle_auth')}>
            <Button
              onClick={() => {
                history.push('/park-center/carManage/authorization-manage/add');
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增车辆授权
            </Button>
          </Access>,
          <Access key="button" accessible={access.functionAccess('alitaParking_vehicle_auth')}>
            <Badge key="1" count={count}>
              <Button
                onClick={() => {
                  setAppOpen(true);
                }}
                // type="primary"
              >
                待处理
              </Button>
            </Badge>
          </Access>,
        ]}
      />
      <PostponeModal
        open={postShow}
        onOpenChange={setPostShow}
        onSubmit={onPostSubmit}
        data={postModalData}
      />
      <RenewModal
        open={renewModalShow}
        onOpenChange={setRenewModalShow}
        onSubmit={onRenewModalSubmit}
        data={renewModalData}
      />
      <ChangeCarModal
        open={changeCarShow}
        onOpenChange={setChangeCarShow}
        onSubmit={onChangeCarSubmit}
        data={changeCarData}
      />
      <RefrePayModal
        open={refrePayModalShow}
        onOpenChange={setRefrePayModalShow}
        onSubmit={refrePayModalSubmit}
        data={refrePayModalData}
      />
      <ApprovalModal open={appOpen} onOpenChange={setAppOpen} onSubmit={onAppSubmit} />
    </PageContainer>
  );
};
