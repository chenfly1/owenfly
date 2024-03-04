import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import Add from './add';
import ActionGroup from '@/components/ActionGroup';
import { tradeAccountList, tradeAccountOnOff } from '@/services/payment';
import ProjectSelect from '@/components/ProjectSelect';
import { storageSy } from '@/utils/Setting';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<TradeAccountListType>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectBid, setProjectBid] = useState<string>(project.bid);

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectBid = projectBid;
    if (params.dateRange) {
      params.entryStartTime = params.dateRange[0] + ' 00:00:00';
      params.entryEndTime = params.dateRange[1] + ' 23:59:59';
    }
    const res = await tradeAccountList(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page.totalItems,
    };
  };

  const onStateChange = (row: any) => {
    const isOnline = row.state === 0;
    Modal.confirm({
      title: isOnline ? '确定停用吗？' : '确定启用吗？',
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        let res: any;
        if (isOnline) {
          res = await tradeAccountOnOff({ id: row?.id });
        } else {
          res = await tradeAccountOnOff({ id: row?.id });
        }
        if (res.code === 'SUCCESS') {
          actionRef.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const handleChange = (bid: string, name: any) => {
    setProjectBid(bid);
    actionRef.current?.reload();
  };

  const columns: ProColumns<TradeAccountListType>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectBid',
      valueType: 'select',
      hideInTable: true,
      renderFormItem: () => {
        return <ProjectSelect name="projectBid" handleChange={handleChange} />;
      },
    },
    {
      title: '商户账户编号',
      dataIndex: 'accountBid',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '商户名称',
      dataIndex: 'accountName',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '商户状态',
      dataIndex: 'state',
      ellipsis: true,
      hideInTable: true,
      valueEnum: {
        0: '启用',
        1: '停用',
      },
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (item) => {
          return {
            gmtCreatedStart: item[0] + ' 00:00:00',
            gmtCreatedEnd: item[1] + ' 23:59:59',
          };
        },
      },
    },

    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '商户账户编号',
      dataIndex: 'accountBid',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
      search: false,
    },
    {
      title: '商户名称',
      dataIndex: 'accountName',
      ellipsis: true,
      search: false,
    },
    {
      title: '商户号',
      dataIndex: 'accountNumber',
      ellipsis: true,
      search: false,
    },
    {
      title: '商户状态',
      dataIndex: 'state',
      ellipsis: true,
      search: false,
      valueEnum: {
        0: {
          text: '启用',
          status: 'Success',
        },
        1: {
          text: '停用',
          status: 'Error',
        },
      },
    },
    {
      title: '最近修改人',
      dataIndex: 'updater',
      ellipsis: true,
      search: false,
    },
    {
      title: '最近修时间',
      dataIndex: 'gmtUpdated',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'online',
                text: row.state === 0 ? '停用' : '启用',
                onClick() {
                  onStateChange(row);
                },
              },
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  setModalData(row);
                  setDrawerVisit(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];
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
      <ProTable<TradeAccountListType>
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
        }}
        rowKey="id"
        search={
          {
            labelWidth: 88,
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
        toolBarRender={() => [
          <Button
            key="1"
            onClick={() => {
              setModalData({});
              setDrawerVisit(true);
            }}
            icon={<PlusOutlined />}
            type="primary"
          >
            新建收款账户
          </Button>,
        ]}
      />

      <Add open={drawerVisit} onOpenChange={setDrawerVisit} onSubmit={onSubmit} data={modalData} />
    </PageContainer>
  );
};
