import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Col, Modal, Row, message } from 'antd';
import ActionGroup from '@/components/ActionGroup';
import { useEffect, useRef, useState } from 'react';
import { waterColumns } from '../columns';
import style from './style.less';
import StatisticCard from '../StatisticCard';
import { history } from 'umi';
import { propertyBill } from '@/components/FileUpload/business';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  billListClose,
  billListRefund,
  billListReview,
  billListWater,
  qryTotalSummary,
} from '@/services/payment';
import { Method } from '@/utils';
import dayjs from 'dayjs';
import { uniqBy } from 'lodash';
import ProjectSelect from '@/components/ProjectSelect';
import { storageSy } from '@/utils/Setting';

export interface IProps {
  month: string;
}

export default ({ month }: IProps) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [arrearageAmount, setArrearageAmount] = useState<number>(0);
  const [arrearageRate, setArrearageRate] = useState<string>('');
  const [paidRate, setPaidRate] = useState<string>('');
  const [closedAmount, setClosedAmount] = useState<number>(0);
  const [exporting, setExporting] = useState<boolean>(false);
  const [tableData, setTableData] = useState<BillListWaterType[]>([]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectBid, setProjectBid] = useState<string>(project.bid);

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.billMonth = month;
    params.projectBid = projectBid;
    const res = await billListWater(params);
    setTableData(res.data?.items || []);
    return {
      data: (res.data?.items || []).map((item: any) => {
        return {
          ...item,
          price: item.price ? Number(item.price / 100).toFixed(2) : '',
          waterFee: item.waterFee ? Number(item.waterFee / 100).toFixed(2) : '',
          indoorFee: item.indoorFee ? Number(item.indoorFee / 100).toFixed(2) : '',
          publicFee: item.publicFee ? Number(item.publicFee / 100).toFixed(2) : '',
          waterAmount: item.waterAmount ? Number(item.waterAmount / 100).toFixed(2) : '',
          indoorAmount: item.indoorAmount ? Number(item.indoorAmount / 100).toFixed(2) : '',
          publicAmount: item.publicAmount ? Number(item.publicAmount / 100).toFixed(2) : '',

          totalAmountTax: item.totalAmountTax ? Number(item.totalAmountTax / 100).toFixed(2) : '',
          totalAmount: item.totalAmount ? Number(item.totalAmount / 100).toFixed(2) : '',
          taxAmount: item.taxAmount ? Number(item.taxAmount / 100).toFixed(2) : '',
          paidAmount: item.paidAmount ? Number(item.paidAmount / 100).toFixed(2) : '',
          refundAmount: item.refundAmount ? Number(item.refundAmount / 100).toFixed(2) : '',
          paidOffAmount: item.paidOffAmount ? Number(item.paidOffAmount / 100).toFixed(2) : '',
          paidOnlineAmount: item.paidOnlineAmount
            ? Number(item.paidOnlineAmount / 100).toFixed(2)
            : '',
        };
      }),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  // 查询汇总数据
  const queryTotalAmount = async () => {
    const res = await qryTotalSummary({
      billMonth: month,
      type: '0',
      pageSize: 100,
      pageNo: 1,
      projectBid: projectBid,
    });
    setTotalAmount(
      res.data?.totalAmountTax ? (Number(res.data?.totalAmountTax / 100).toFixed(2) as any) : 0,
    );
    setPaidAmount(
      res.data?.paidAmount ? (Number(res.data?.paidAmount / 100).toFixed(2) as any) : 0,
    );
    setArrearageAmount(
      res.data?.arrearageAmount ? (Number(res.data?.arrearageAmount / 100).toFixed(2) as any) : 0,
    );
    setClosedAmount(
      res.data?.closedAmount ? (Number(res.data?.closedAmount / 100).toFixed(2) as any) : 0,
    );

    if (res.data?.totalAmountTax) {
      setPaidRate(((res.data?.paidAmount / res.data?.totalAmountTax) * 100).toFixed(2));
      setArrearageRate(((res.data?.arrearageAmount / res.data?.totalAmountTax) * 100).toFixed(2));
    }
  };
  useEffect(() => {
    queryTotalAmount();
    actionRef?.current?.reload();
  }, [month]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    defaultSelectedRowKeys: [1],
    onChange: onSelectChange,
  };
  // 导出
  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
      billMonth: month,
    };
    Method.exportExcel(
      `/content/mng/bill_list/water`,
      `水费账单_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'POST',
    ).finally(() => {
      setExporting(false);
    });
  };
  // 关闭
  const closeBill = async (sltKeys: any) => {
    let res: ResultData<any>;
    if (sltKeys && sltKeys.length > 0) {
      res = await billListClose(sltKeys);
    } else {
      res = await billListClose(selectedRowKeys as any);
    }
    if (res.code === 'SUCCESS') {
      message.success('关闭成功');
      actionRef?.current?.reload();
      queryTotalAmount();
      return true;
    }
    return false;
  };

  const handleChange = (bid: string, name: any) => {
    setProjectBid(bid);
    queryTotalAmount();
    actionRef.current?.reload();
  };

  const columns: ProColumns<BillListWaterType>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectBid',
      valueType: 'select',
      hideInTable: true,
      renderFormItem: () => {
        return <ProjectSelect name="projectBid" handleChange={handleChange} />;
      },
    },
    ...waterColumns,
    {
      title: '操作',
      fixed: 'right',
      width: 150,
      valueType: 'option',
      // hideInSearch: true,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'close',
                text: '关闭账单',
                hidden: row.billStatusName === '关闭',
                onClick() {
                  Modal.confirm({
                    title: '是否确认关闭账单？',
                    content: '账单关闭后不可恢复，用户无法在小程序查看该账单',
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    onOk: async () => {
                      return closeBill([row.code]);
                    },
                  });
                },
              },
              {
                key: 'edit',
                text: '退款',
                onClick() {
                  Modal.confirm({
                    title: '是否确认退款？',
                    // content: '账单关闭后不可恢复，用户无法在小程序查看该账单',
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    onOk: async () => {
                      const res = await billListRefund([row.code]);
                      if (res.code === 'SUCCESS') {
                        message.success('退款成功');
                        actionRef?.current?.reload();
                        return true;
                      }
                      return false;
                    },
                  });
                },
              },
              {
                key: 'detail',
                text: '详情',
                onClick() {
                  history.push({
                    pathname: '/living-payment/bill/receivable/detail',
                    query: { code: row.code, type: '0' },
                  });
                },
              },
              {
                key: 'collection',
                text: '线下收款',
                onClick() {
                  history.push({
                    pathname: '/living-payment/bill/receivable/collection',
                    query: {
                      type: '0',
                      codes: [row.code],
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
  return (
    <>
      <Row style={{ margin: '0 16px' }} gutter={16} justify="space-between">
        <Col span={6}>
          <StatisticCard label="应收" value={totalAmount} unit={'元'} />
        </Col>
        <Col span={6}>
          <StatisticCard label="实收" value={paidAmount} unit={'元'} rate={paidRate} />
        </Col>
        <Col span={6}>
          <StatisticCard label="欠费" value={arrearageAmount} unit={'元'} rate={arrearageRate} />
        </Col>
        <Col span={6}>
          <StatisticCard label="关闭" value={closedAmount} unit={'元'} />
        </Col>
      </Row>
      <ProTable<BillListWaterType>
        className={style.cusTable}
        columns={columns}
        form={{
          colon: false,
        }}
        cardBordered
        actionRef={actionRef}
        formRef={formRef}
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-detail',
          persistenceType: 'localStorage',
        }}
        rowKey="code"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        tableAlertRender={false}
        rowSelection={rowSelection}
        dateFormatter="string"
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            selection={{
              show: true,
              count: selectedRowKeys.length,
            }}
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
              {
                key: 'batchImport',
                text: '批量导入账单',
                onClick: () => {
                  history.push({
                    pathname: `/living-payment/bill/receivable/batch-import`,
                    query: {
                      businessId: propertyBill.id,
                      businessType: '4',
                      path: propertyBill.path,
                      billType: '0',
                      projectBid: projectBid,
                    },
                  });
                },
              },
              {
                key: 'shoukuan',
                text: '批量线下收款',
                onClick: () => {
                  const sltRowDatas = tableData?.filter((item) =>
                    selectedRowKeys.includes(item.code),
                  );
                  const uniqData = uniqBy(sltRowDatas, 'owner');
                  if (selectedRowKeys.length === 0) {
                    message.warning('请勾选数据');
                    return;
                  } else if (uniqData.length >= 2) {
                    message.warn('勾选的账单中包含不同的收费对象，请重新选择');
                    return;
                  }
                  history.push({
                    pathname: '/living-payment/bill/receivable/collection',
                    query: {
                      type: '0',
                      codes: selectedRowKeys as any,
                    },
                  });
                },
              },
              {
                key: 'disabled',
                text: '批量审核并下发',
                onClick: () => {
                  if (selectedRowKeys.length === 0) {
                    message.warning('请勾选数据');
                    return;
                  }
                  Modal.confirm({
                    title: '确认下发？',
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    onOk: async () => {
                      const res = await billListReview(selectedRowKeys as any);
                      if (res.code === 'SUCCESS') {
                        message.success('下发成功');
                        actionRef?.current?.reload();
                        return true;
                      } else {
                        message.warn('下发失败');
                        return false;
                      }
                    },
                  });
                },
              },
            ]}
          >
            <Button>批量操作</Button>
          </ActionGroup>
        }
      />
    </>
  );
};
