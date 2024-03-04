import {
  CaretDownOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space, Dropdown } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import Add from './add';
import { merchantAbled, merchantDisabled, merchantQueryByPage } from '@/services/park';
import DataMasking from '@/components/DataMasking';
import { exportExcel } from '../../utils/constant';
import dayjs from 'dayjs';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<MerchantType>();
  const access = useAccess();
  const [readonly, setReadonly] = useState<boolean>();
  access.functionAccess = () => true;

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await merchantQueryByPage(params);
    const data = (res.data?.items || []).map((item: MerchantType) => {
      return {
        ...item,
        gmtCreated: dayjs(item.gmtCreated).format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return {
      data: data || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const onStateChange = (isOpen: boolean, row: any) => {
    Modal.confirm({
      title: isOpen ? '确定禁用吗？' : '确定启用吗？',
      content: isOpen ? '禁用后，该商家无法登录小程序' : '启动后，该商家可以登录小程序',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        const qfn = isOpen ? merchantDisabled : merchantAbled;
        const res = await qfn({ id: row?.id });
        if (res.code === 'SUCCESS') {
          actionRef.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const columns: ProColumns<MerchantType>[] = [
    {
      title: '手机号',
      dataIndex: 'adminMobile',
      ellipsis: true,
      order: 1,
      hideInTable: true,
    },
    {
      title: '商家编号',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      order: 2,
      ellipsis: true,
    },
    {
      title: '管理员姓名',
      dataIndex: 'accountNameStr',
      search: false,
      render: (_, row) => {
        if (row.adminsRel && row.adminsRel.length) {
          return row.adminsRel.map((item) => item.accountName).join('/');
        } else {
          return _;
        }
      },
    },
    {
      title: '手机号',
      dataIndex: 'mobileStr',
      search: false,
      render: (_, row) => {
        if (row.adminsRel && row.adminsRel.length) {
          return row.adminsRel.map((item) => <DataMasking key="onlysee" text={item.mobile} />);
        } else {
          return _;
        }
      },
    },
    {
      title: '注册时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: {
          text: '禁用',
          status: 'Default',
        },
        1: {
          text: '使用中',
          status: 'Success',
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (_, row) => {
        const isOpen = row.status === 1 ? true : false;
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                accessKey: 'alitaParking_queryMerchant',
                text: '查看',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                  setReadonly(true);
                },
              },
              {
                key: 'edit',
                accessKey: 'alitaParking_saveMerchant',
                text: '编辑',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                  setReadonly(false);
                },
              },
              {
                key: 'disabled',
                accessKey: 'alitaParking_enableMerchant',
                text: isOpen ? '禁用' : '启用',
                danger: true,
                onClick() {
                  onStateChange(isOpen, row);
                },
              },
            ]}
          />
        );
        // const isOpen = row.status === 1 ? true : false;
        const edit = (
          <Access key="1" accessible={access.functionAccess('alitaParking_saveMerchant')}>
            <a
              onClick={() => {
                setModalData(row);
                setDrawerVisit(true);
                setReadonly(false);
              }}
            >
              编辑
            </a>
          </Access>
        );
        const detail = (
          <Access key="2" accessible={access.functionAccess('alitaParking_queryMerchant')}>
            <a
              onClick={() => {
                setModalData(row);
                setDrawerVisit(true);
                setReadonly(true);
              }}
            >
              查看
            </a>
          </Access>
        );
        const open = (
          <Access key="3" accessible={access.functionAccess('alitaParking_enableMerchant')}>
            <a
              onClick={() => {
                onStateChange(isOpen, row);
              }}
            >
              {isOpen ? '禁用' : '启用'}
            </a>
          </Access>
        );

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: detail,
                },
                {
                  key: '2',
                  label: edit,
                },
                {
                  key: '3',
                  label: open,
                },
                {
                  key: '4',
                  label: close,
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                更多
                <CaretDownOutlined />
              </Space>
            </a>
          </Dropdown>
          // <Space>{detail}</Space>
        );
      },
    },
  ];
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 10000;
    params.excel = 'export';
    exportExcel('/parking/mng/merchant', '商家管理', params, 'GET');
  };
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
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
      <ProTable<MerchantType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
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
            <Access key="2" accessible={access.functionAccess('alitaParking_queryMerchant')}>
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access key="button" accessible={access.functionAccess('alitaParking_saveMerchant')}>
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setModalData({} as any);
                setReadonly(false);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增商家
            </Button>
          </Access>,
        ]}
      />

      <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={readonly}
      />
    </PageContainer>
  );
};
