import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import ActionGroup from '@/components/ActionGroup';
import { tradeAccountList, tradeList } from '@/services/payment';
import { Method } from '@/utils';
import dayjs from 'dayjs';
import ProjectSelect from '@/components/ProjectSelect';
import { storageSy } from '@/utils/Setting';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [exporting, setExporting] = useState<boolean>(false);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectBid, setProjectBid] = useState<string>(project.bid);

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectBid = projectBid;
    const res = await tradeList(params);
    return {
      data: (res.data?.items || []).map((item: any) => {
        return {
          ...item,
          tradeAmount: item.tradeAmount ? Number(item.tradeAmount / 100).toFixed(2) : 0,
        };
      }),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page.totalItems || 0,
    };
  };

  // 导出
  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
    };
    Method.exportExcel(
      `/content/mng/trade`,
      `交易记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'GET',
    ).finally(() => {
      setExporting(false);
    });
  };

  const handleChange = (bid: string, name: any) => {
    setProjectBid(bid);
    actionRef.current?.reload();
  };

  const columns: ProColumns<TradeListType>[] = [
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
      title: '商户',
      dataIndex: 'accountBid',
      hideInTable: true,
      request: async () => {
        const res = await tradeAccountList({ pageSize: 100, pageNo: 1, state: 0 });
        return [
          ...res.data.items.map((item: any) => ({
            label: item.accountName,
            value: item.accountBid,
          })),
        ];
      },
      ellipsis: true,
    },
    {
      title: '交易流水号',
      dataIndex: 'traceId',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '用户姓名',
      dataIndex: 'name',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      ellipsis: true,
      hideInTable: true,
    },
    {
      title: '账单编号',
      dataIndex: 'billCode',
      ellipsis: true,
      hideInTable: true,
    },
    {
      title: '交易时间',
      dataIndex: 'dateRange',
      ellipsis: true,
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            gmtCreatedStart: value[0],
            gmtCreatedEnd: value[1],
          };
        },
      },
    },

    {
      title: '交易流水号',
      dataIndex: 'tradeId',
      ellipsis: true,
      search: false,
    },
    {
      title: '交易时间',
      dataIndex: 'tradeDoneDate',
      ellipsis: true,
      search: false,
    },
    {
      title: '类目',
      dataIndex: 'categoryName',
      ellipsis: true,
      search: false,
    },
    {
      title: '交易金额(元)',
      dataIndex: 'tradeAmount',
      ellipsis: true,
      search: false,
    },
    {
      title: '交易用户',
      dataIndex: 'username',
      ellipsis: true,
      search: false,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      ellipsis: true,
      search: false,
    },
    {
      title: '用户房产',
      dataIndex: 'propertyName',
      ellipsis: true,
      search: false,
    },
    {
      title: '关联账单',
      dataIndex: 'billIds',
      ellipsis: true,
      render: (_, row) => {
        if (row.billIds && row.billIds.length >= 2) {
          return (
            <span
              onClick={() => {
                history.push({
                  pathname: '/living-payment/bill/deal/detail',
                  query: { id: row.id },
                });
              }}
              style={{ color: '#3175ff', textDecoration: 'underline', cursor: 'pointer' }}
            >{`(${row.billIds.length})`}</span>
          );
        } else if (row.billIds && row.billIds.length === 1) {
          return row.billIds[0];
        } else {
          return _;
        }
      },
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
                key: 'detail',
                text: '详情',
                onClick() {
                  history.push({
                    pathname: '/living-payment/bill/deal/detail',
                    query: { id: row.id },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<TradeListType>
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
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            // selection={{
            //   show: false,
            //   count: selectedRowKeys.length,
            // }}
            limit={2}
            actions={[
              {
                key: 'exportAcc',
                text: '导出账单',
                loading: exporting,
                onClick: () => {
                  exportClick();
                },
              },
            ]}
          >
            <Button>批量操作</Button>
          </ActionGroup>
        }
      />
    </PageContainer>
  );
};
