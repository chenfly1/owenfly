import ActionGroup from '@/components/ActionGroup';
import { orderRecordsLt, parkYardListByPage, tradebillList } from '@/services/park';
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
      `/parking/mng/tradebill/export_list`,
      `对账列表_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'POST',
    ).finally(() => {
      setExporting(false);
    });
  };
  const columns: ProColumns<TradebillListType>[] = [
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
      dataIndex: 'chkDate',
      valueType: 'dateRange',
      hideInTable: true,
      order: 4,
      search: {
        transform: (item) => {
          return {
            startDate: item[0] + ' 00:00:00',
            endDate: item[1] + ' 23:59:59',
          };
        },
      },
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
      title: '对账状态',
      dataIndex: 'chkResult',
      hideInTable: true,
      valueEnum: {
        '00': '未对账',
        '01': '待对账',
        '02': '无文件',
        '03': '对账中',
        '04': '成功',
        '05': '失败',
      },
      order: 2,
    },
    {
      title: '收费科目',
      dataIndex: 'checkType',
      hideInTable: true,
      valueEnum: {
        '01': '停车费',
        '02': '车位管理费',
      },
      order: 1,
    },
    {
      title: '下账状态',
      dataIndex: 'chkStatus',
      hideInTable: true,
      valueEnum: {
        '01': '已下账',
        '00': '未下账',
      },
      order: 0,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      ellipsis: true,
      search: false,
    },
    {
      title: '日期',
      dataIndex: 'chkDate',
      valueType: 'date',
      ellipsis: true,
      search: false,
    },
    {
      title: '对账状态',
      dataIndex: 'result',
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
      title: '第三方对账平台',
      search: false,
      children: [
        {
          title: '业务类型',
          dataIndex: 'checkType',
          ellipsis: true,
          search: false,
        },
        {
          title: '交易笔数',
          dataIndex: 'thirdOrderNum',
          ellipsis: true,
          search: false,
        },
        {
          title: '交易金额',
          dataIndex: 'thirdTotalAmount',
          ellipsis: true,
          search: false,
        },
        {
          title: '手续费',
          dataIndex: 'fee',
          ellipsis: true,
          search: false,
        },
        {
          title: '到账金额',
          dataIndex: 'realAmount',
          ellipsis: true,
          search: false,
        },
      ],
    },
    {
      title: '下账状态',
      dataIndex: 'status',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      search: false,
      width: 100,
      fixed: 'right',
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                text: '详情',
                key: 'detail',
                onClick() {
                  history.push({
                    pathname: '/park-center/check-account/detail-list',
                    query: {
                      date: dayjs(row.chkDate).format('YYYY-MM-DD'),
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = project.bid;
    const res = await tradebillList(params);
    return {
      data: res.data?.elements,
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
            labelWidth: 80,
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
        dateFormatter="string"
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
      />
    </PageContainer>
  );
};
