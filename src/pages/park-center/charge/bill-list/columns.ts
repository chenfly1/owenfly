import type { ProColumns } from '@ant-design/pro-components';
import { parkTitles } from '@/pages/park-center/utils/constant';

export const billStatus = {
  1: '支付中',
  2: '支付成功',
  3: '支付超时',
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
  // {
  //   title: '项目名称',
  //   dataIndex: 'projectName',
  // },
  {
    title: '订单编号',
    dataIndex: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatusName',
    width: 100,
    ellipsis: true,
    valueEnum: {
      待支付: { text: '待支付', status: 'Error' },
      支付成功: { text: '支付成功', status: 'Success' },
      支付超时: { text: '支付超时', status: 'Warning' },
      支付失败: { text: '支付失败', status: 'Error' },
      已取消: { text: '已取消', status: 'Default' },
      已关闭: { text: '已关闭', status: 'Default' },
    },
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
  // {
  //   title: '入场时间',
  //   dataIndex: 'enterTime',
  // },
  {
    title: '订单创建时间',
    dataIndex: 'gmtCreated',
    width: 150,
    ellipsis: true,
  },
  {
    title: '支付成功时间',
    dataIndex: 'paySuccessTime',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单失效时间',
    dataIndex: 'failureTime',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单取消时间',
    dataIndex: 'cancelTime',
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
  //   title: '项目名称',
  //   dataIndex: 'projectName',
  // },
  {
    title: '订单编号',
    dataIndex: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatusName',
    width: 100,
    ellipsis: true,
    valueEnum: {
      待支付: { text: '待支付', status: 'Error' },
      支付成功: { text: '支付成功', status: 'Success' },
      支付超时: { text: '支付超时', status: 'Warning' },
      支付失败: { text: '支付失败', status: 'Error' },
      已取消: { text: '已取消', status: 'Default' },
      已关闭: { text: '已关闭', status: 'Default' },
    },
  },
  {
    title: '套餐名称',
    dataIndex: 'packageName',
    width: 120,
    ellipsis: true,
  },
  {
    title: '套餐单价',
    dataIndex: 'packagePrice',
    width: 100,
    ellipsis: true,
  },
  {
    title: '数量',
    dataIndex: 'packageCount',
    width: 100,
    ellipsis: true,
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
    title: '订单创建时间',
    dataIndex: 'gmtCreated',
    width: 150,
    ellipsis: true,
  },
  {
    title: '支付成功时间',
    dataIndex: 'paySuccessTime',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单失效时间',
    dataIndex: 'failureTime',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单取消时间',
    dataIndex: 'cancelTime',
    width: 150,
    ellipsis: true,
  },
].map((column) => ({ ...column, search: false }));
