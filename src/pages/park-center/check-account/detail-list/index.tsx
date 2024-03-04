import ActionGroup from '@/components/ActionGroup';
import { parkYardListByPage, tradebillDetail } from '@/services/park';
import { ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import style from './style.less';
import { useRef, useState } from 'react';
import { Method } from '@/utils';
import dayjs from 'dayjs';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [exporting, setExporting] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const query = history.location.query as any;

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };
  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
    };
    Method.exportExcel(
      `/parking/mng/tradebill/export_detail`,
      `对账明细_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'POST',
    ).finally(() => {
      setExporting(false);
    });
  };
  const columns: ProColumns<TradebillDetailType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkId',
      valueType: 'select',
      request: queryParkList,
      hideInTable: true,
      order: 5,
    },
    {
      title: '对账日期',
      dataIndex: 'date',
      initialValue: query.date ? [query.date, query.date] : [],
      valueType: 'dateRange',
      hideInTable: true,
      order: 4,
    },
    {
      title: '对账平台',
      dataIndex: 'plateFormId',
      hideInTable: true,
      order: 3,
      valueEnum: {
        '00': '支付中台',
        '01': '微信',
        '02': '支付宝',
      },
    },
    {
      title: '收费科目',
      dataIndex: 'checkType',
      hideInTable: true,
      valueEnum: {
        '01': '停车费',
        '02': '车位管理费',
      },
      order: 2,
    },
    {
      title: '交易流水号',
      dataIndex: 'plateformTradeNo',
      order: 1,
      hideInTable: true,
    },
    {
      title: '第三方交易流水号',
      dataIndex: 'thirdTradeNo',
      hideInTable: true,
      order: 0,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      ellipsis: true,
      search: false,
    },
    {
      title: '时间',
      dataIndex: 'tradeTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '车牌号',
      dataIndex: 'plate',
      ellipsis: true,
      search: false,
    },
    {
      title: '对账平台',
      dataIndex: 'thirdPlatform',
      ellipsis: true,
      search: false,
    },
    {
      title: '账户ID',
      dataIndex: 'thirdAccount',
      ellipsis: true,
      search: false,
    },
    {
      title: '对账结果',
      dataIndex: 'result',
      ellipsis: true,
      search: false,
    },
    {
      title: '交易流水号',
      dataIndex: 'plateformTradeNo',
      ellipsis: true,
      search: false,
    },
    {
      title: '第三方支付流水号',
      dataIndex: 'thirdTradeNo',
      ellipsis: true,
      search: false,
    },
    {
      title: '交易时间',
      dataIndex: 'tradeTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '第三方对账平台',
      search: false,
      children: [
        {
          title: '收费科目',
          dataIndex: 'checkType',
          ellipsis: true,
          search: false,
        },
        {
          title: '交易金额(元)',
          dataIndex: 'thirdTotalAmount',
          ellipsis: true,
          search: false,
        },
        {
          title: '手续费(元)',
          dataIndex: 'fee',
          ellipsis: true,
          search: false,
        },
        {
          title: '到账金额(元)',
          dataIndex: 'realAmount',
          ellipsis: true,
          search: false,
        },
      ],
    },
  ];

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    if (params.date && params.date.length) {
      params.startDate = params.date[0] + ' 00:00:00';
      params.endDate = params.date[1] + ' 23:59:59';
    }
    const res = await tradebillDetail(params);
    return {
      data: res.data?.elements.map((item) => ({
        ...item,
        thirdTotalAmount: item?.thirdTotalAmount
          ? Number(item?.thirdTotalAmount / 100).toFixed(2)
          : '',
        fee: item?.fee ? Number(item?.fee / 100).toFixed(2) : '',
        realAmount: item?.realAmount ? Number(item?.realAmount / 100).toFixed(2) : '',
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.total,
    };
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
      <ProTable
        className={style.cusCard}
        columns={columns}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={queryList}
        rowKey="areaNum"
        search={
          {
            labelWidth: 110,
            labelAlign: 'left',
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
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            limit={2}
            actions={[
              {
                key: 'export',
                text: '导出',
                loading: exporting,
                onClick() {
                  exportClick();
                },
              },
            ]}
          />
        }
        dateFormatter="string"
      />
    </PageContainer>
  );
};
