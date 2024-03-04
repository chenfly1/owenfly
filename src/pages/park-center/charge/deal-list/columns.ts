import type { ProColumns } from '@ant-design/pro-components';
import { parkTitles } from '@/pages/park-center/utils/constant';

export const billStatus = {
  1: '支付中',
  2: '支付成功',
  3: '支付超时',
};
export const backBillStatus = {
  '01': '退款成功',
  '02': '退款失败',
  '03': '退款中',
  '04': '退款超时',
  '05': '未退款',
};

export const temporaryColumns: ProColumns[] = [
  {
    title: '车牌号码',
    dataIndex: 'plate',
    width: 100,
    ellipsis: true,
  },
  {
    title: parkTitles.yardName,
    dataIndex: 'parkName',
    width: 120,
    ellipsis: true,
  },
  {
    title: '入场时间',
    dataIndex: 'inTime',
    width: 150,
    ellipsis: true,
  },
  {
    title: '计费开始时间',
    dataIndex: 'billingStart',
    width: 150,
    ellipsis: true,
  },
  {
    title: '计费结束时间',
    dataIndex: 'billingEnd',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatusName',
    valueEnum: billStatus,
    width: 120,
  },
  // {
  //   title: '交易类型',
  //   dataIndex: 'parkName',
  //   width: 120,
  //   ellipsis: true,
  // },
  {
    title: '订单编号',
    dataIndex: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '应收金额',
    dataIndex: 'totalAmount',
    width: 100,
  },
  {
    title: '支付金额',
    dataIndex: 'paidAmount',
    width: 100,
  },
  {
    title: '优惠金额',
    dataIndex: 'discountAmount',
    width: 100,
  },
  {
    title: '退款状态',
    dataIndex: 'refundStatus',
    width: 100,
    ellipsis: true,
    // valueEnum: backBillStatus,
  },
  {
    title: '退款金额',
    dataIndex: 'refundAmount',
    width: 100,
    ellipsis: true,
    // valueEnum: backBillStatus,
  },
  {
    title: '支付方式',
    dataIndex: 'payTypeName',
    width: 80,
  },
  {
    title: '支付渠道',
    dataIndex: 'payChannelName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '支付成功时间',
    dataIndex: 'paySuccessTime',
    width: 150,
    ellipsis: true,
  },
].map((column) => ({ ...column, search: false }));

export const monthlyColumns: ProColumns[] = [
  {
    title: '车牌号码',
    dataIndex: 'plate',
    width: 100,
    ellipsis: true,
  },
  {
    title: parkTitles.yardName,
    dataIndex: 'parkName',
    width: 120,
    ellipsis: true,
  },
  // {
  //   title: '子类型',
  //   dataIndex: 'parkName',
  //   width: 120,
  //   ellipsis: true,
  // },
  {
    title: '订单编号',
    dataIndex: 'orderId',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatusName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '套餐名称',
    dataIndex: 'pkgName',
    width: 150,
    ellipsis: true,
  },
  {
    title: '套餐单价',
    dataIndex: 'pkgPrice',
    width: 100,
    ellipsis: true,
  },
  {
    title: '数量',
    dataIndex: 'pkgCount',
    width: 100,
    ellipsis: true,
  },
  {
    title: '应收金额',
    dataIndex: 'totalAmount',
    width: 100,
    ellipsis: true,
  },
  {
    title: '支付金额',
    dataIndex: 'paidAmount',
    width: 100,
    ellipsis: true,
  },
  {
    title: '优惠金额',
    dataIndex: 'discountAmount',
    width: 100,
    ellipsis: true,
  },
  // {
  //   title: '开票状态',
  //   dataIndex: 'invoiceStatus',
  //   width: 100,
  //   ellipsis: true,
  // },
  {
    title: '退款状态',
    dataIndex: 'refundStatus',
    width: 100,
    ellipsis: true,
    // valueEnum: backBillStatus,
  },
  {
    title: '退款金额',
    dataIndex: 'refundAmount',
    width: 100,
    ellipsis: true,
    // valueEnum: backBillStatus,
  },
  {
    title: '支付方式',
    dataIndex: 'payTypeName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '支付渠道',
    dataIndex: 'payChannelName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '支付成功时间',
    dataIndex: 'paySuccessTime',
    width: 150,
    ellipsis: true,
  },
].map((column) => ({ ...column, search: false }));
