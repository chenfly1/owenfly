import { ProColumns } from '@ant-design/pro-components';

export const beforeColumns: ProColumns<BillListBaseType>[] = [
  {
    title: '账单编号',
    dataIndex: 'code',
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreated',
    valueType: 'dateTime',
  },
  {
    title: '房产',
    dataIndex: 'property',
  },
  {
    title: '收费对象',
    dataIndex: 'owner',
  },
  {
    title: '联系方式',
    dataIndex: 'mobile',
  },
  {
    title: '收费项',
    dataIndex: 'typeName',
    // valueType: 'select',
    // valueEnum: {
    //   0: '水费',
    //   1: '电费',
    //   2: '物业费',
    // },
  },
];

export const afterColumns: ProColumns<BillListBaseType>[] = [
  {
    title: '应收金额(含税)(元)',
    dataIndex: 'totalAmountTax',
  },
  {
    title: '应收金额(不含税)(元)',
    dataIndex: 'totalAmount',
  },
  {
    title: '税率',
    dataIndex: 'taxRate',
  },
  {
    title: '税金(元)',
    dataIndex: 'taxAmount',
  },
  {
    title: '账单所属月份',
    dataIndex: 'billMonth',
  },
  {
    title: '账单实际产生时间',
    dataIndex: 'billStartTime',
  },
  {
    title: '支付状态',
    dataIndex: 'billStatusName',
  },
  {
    title: '下发状态',
    dataIndex: 'statusName',
  },
  {
    title: '实收金额(元)',
    dataIndex: 'paidAmount',
  },
  {
    title: '线下支付(元)',
    dataIndex: 'paidOffAmount',
  },
  {
    title: '缴费用户',
    dataIndex: 'realPayUser',
  },
  {
    title: '支付时间',
    dataIndex: 'paidOffTime',
  },
  {
    title: '线上支付(元)',
    dataIndex: 'paidOnlineAmount',
  },
  {
    title: '线上支付时间',
    dataIndex: 'payTime',
  },
  {
    title: '退款金额',
    dataIndex: 'refundAmount',
  },
  {
    title: '退款时间',
    dataIndex: 'refundTime',
  },
  {
    title: '退款结果',
    dataIndex: 'refundStatusName',
  },
];

export const waterMiddleColumns: ProColumns<BillListWaterType>[] = [
  {
    title: '合计用量(吨)',
    dataIndex: 'waterAmount',
  },
  {
    title: '单价(元/吨)',
    dataIndex: 'price',
  },
  {
    title: '合计费用(元)',
    dataIndex: 'waterFee',
  },
  {
    title: '室内用量(吨)',
    dataIndex: 'indoorAmount',
  },
  {
    title: '室内费用(元)',
    dataIndex: 'indoorFee',
  },
  {
    title: '公区用量(吨)',
    dataIndex: 'publicAmount',
  },
  {
    title: '公区费用(元)',
    dataIndex: 'publicFee',
  },
];
export const eleMiddleColumns: ProColumns<BillListElectricType>[] = [
  {
    title: '合计用量(度)',
    dataIndex: 'electricAmount',
  },
  {
    title: '单价(元/度)',
    dataIndex: 'price',
  },
  {
    title: '合计费用(元)',
    dataIndex: 'electricFee',
  },
  {
    title: '室内用量(度)',
    dataIndex: 'indoorAmount',
  },
  {
    title: '室内费用(元)',
    dataIndex: 'indoorFee',
  },
  {
    title: '公区用量(度)',
    dataIndex: 'publicAmount',
  },
  {
    title: '公区费用(元)',
    dataIndex: 'publicFee',
  },
];
export const propMiddleColumns: ProColumns<BillListManageType>[] = [
  {
    title: '合计用量(m²)',
    dataIndex: 'manageAmount',
  },
  {
    title: '单价(元/m²)',
    dataIndex: 'price',
  },
  {
    title: '合计费用(元)',
    dataIndex: 'manageFee',
  },
];

export const formColumns: ProColumns<BillListBaseType>[] = [
  {
    title: '账单编号',
    dataIndex: 'code',
  },
  {
    title: '用户姓名',
    dataIndex: 'owner',
  },
  {
    title: '联系方式',
    dataIndex: 'mobile',
  },
  {
    title: '账单状态',
    dataIndex: 'billStatus',
    valueType: 'select',
    valueEnum: {
      0: '欠费',
      1: '已缴',
      2: '关闭',
    },
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreated',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value: any) => {
        return {
          gmtStartCreated: value[0],
          gmtEndCreated: value[1],
        };
      },
    },
  },
  {
    title: '下发状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
      0: '未下发',
      1: '已下发',
    },
  },
].map((item) => ({
  ...item,
  hideInTable: true,
}));

export const watColumns: ProColumns<BillListWaterType>[] = [
  ...beforeColumns,
  ...waterMiddleColumns,
  ...afterColumns,
].map((item) => ({
  ...item,
  width: 120,
  search: false,
  ellipsis: true,
}));
export const eleColumns: ProColumns<BillListElectricType>[] = [
  ...beforeColumns,
  ...eleMiddleColumns,
  ...afterColumns,
].map((item) => ({
  ...item,
  width: 120,
  search: false,
  ellipsis: true,
}));

export const propColumns: ProColumns<BillListManageType>[] = [
  ...beforeColumns,
  ...propMiddleColumns,
  ...afterColumns,
].map((item) => ({
  ...item,
  width: 120,
  search: false,
  ellipsis: true,
}));

// 水费
export const waterColumns: ProColumns<BillListWaterType>[] = [...formColumns, ...watColumns];

// 电费
export const electricColumns: ProColumns<BillListElectricType>[] = [...formColumns, ...eleColumns];

// 物业费
export const propertyColumns: ProColumns<BillListManageType>[] = [...formColumns, ...propColumns];
