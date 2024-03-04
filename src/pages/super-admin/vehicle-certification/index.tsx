import { history } from 'umi';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { queryApprovingPage, vehicleAttestateQueryByPage } from '@/services/park';
import { Badge, Button } from 'antd';
import ApprovalModal from './approvalModal';
import { useLayoutEffect, useRef, useState } from 'react';
import DataMasking from '@/components/DataMasking';

export default () => {
  const [appOpen, setAppOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const actionRef = useRef<ActionType>();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await vehicleAttestateQueryByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const columns: ProColumns<VehicleAttestateType>[] = [
    {
      title: '车牌号码',
      dataIndex: 'plate',
    },
    {
      title: '车主姓名',
      dataIndex: 'name',
      hideInTable: true,
    },
    {
      title: '车主姓名',
      dataIndex: 'authName',
      search: false,
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
      render: (_, row) => {
        return <DataMasking text={row.mobile} />;
      },
    },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      search: false,
      valueEnum: {
        1: '小型车',
        2: '中型车',
      },
    },

    {
      title: '车辆状态',
      dataIndex: 'authStatus',
      search: false,
      valueEnum: {
        0: '已绑定',
        1: '认证成功',
        2: '认证失败',
        3: '认证中',
        4: '申诉中',
        5: '申诉失败', // 认证状态 0-已绑定，1-认证成功，2-认证失败，3-认证中，4-申诉中，5-申诉失败
      },
    },
    // {
    //   title: '操作',
    //   valueType: 'option',
    //   key: 'option',
    //   render: () => {
    //     const check = <a onClick={async () => {}}>查看</a>;
    //     return (
    //       <Space align="center">
    //         {/* <Access accessible={access.functionAccess('alitaDoor_queryVisitorPassLog')}> */}
    //         {check}
    //         {/* </Access> */}
    //       </Space>
    //     );
    //   },
    // },
  ];

  const queryAppList = () => {
    queryApprovingPage({
      pageSize: 20,
      pageNo: 1,
    }).then((res) => {
      setCount(res.data?.page?.totalItems || 0);
    });
  };

  const onAppSubmit = () => {
    setAppOpen(false);
    queryAppList();
    actionRef?.current?.reload();
  };

  useLayoutEffect(() => {
    queryAppList();
  }, []);

  const tableColumns: ProColumns[] = columns.map((column) => ({
    ...column,
  }));

  return (
    <PageContainer
      header={{
        // title: '车辆认证',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable
        columns={tableColumns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        request={queryList}
        rowKey="relId"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
            // defaultColsNumber: 7,
          } as any
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        toolBarRender={() => {
          return [
            <Badge key="1" count={count}>
              <Button
                key="1"
                type="primary"
                onClick={() => {
                  setAppOpen(true);
                }}
              >
                待审核
              </Button>
            </Badge>,
          ];
        }}
        dateFormatter="string"
      />
      <ApprovalModal open={appOpen} onOpenChange={setAppOpen} onSubmit={onAppSubmit} />
    </PageContainer>
  );
};
