type InvoiceListType = {
  code: string;
  userName: string;
  phone: string;
  gmtCreated: string;
  room: string;
  title: string;
  taxNo: string;
  unitAddr: string;
  unitPhone: string;
  bankName: string;
  bankAccount: string;
};

type QryTotalSummaryType = {
  projectId: string;
  type: number;
  totalAmountTax: number;
  paidAmount: number;
  arrearageAmount: number;
  closedAmount: number;
};

type TradeListType = {
  id: string;
  tradeId: string;
  tradeDoneDate: string;
  categoryName: string;
  tradeAmount: number;
  tradeAmountType: number;
  username: string;
  phone: string;
  propertyName: string;
  billIds: string[];
  state: number;
};

type TradeDetailType = {
  id: number;
  tradeId: string;
  tradeDoneDate: string;
  categoryName: string;
  tradeAmount: number;
  tradeAmountType: number;
  username: string;
  phone: string;
  propertyName: string;
  billIds: string[];
  state: number;
  account: Record<string, any>;
  billList: Record<string, any>[];
  personal: string;
};

type TradeAccountListType = {
  id: string;
  accountBid: string;
  accountName: string;
  accountNumber: string;
  appId: string;
  state: number;
  creator: string;
  gmtCreated: string;
  updater: string;
  gmtUpdated: string;
};

type BillListBaseType = {
  id: string;
  code: string;
  gmtCreated: string;
  propertyId: string;
  property: string;
  ownerId: string;
  owner: string;
  mobile: string;
  type: number;
  typeName: string;
  totalAmount: number;
  totalAmountTax: number;
  billMonth: string;
  taxRate: string;
  taxAmount: number;
  billStartTime: string;
  billEndTime: string;
  billStatus: number;
  billStatusName: string;
  status: number;
  statusName: string;
  paidAmount: number;
  payUserId: string;
  payUserName: string;
  payTime: string;
  refundAmount: number;
  refundTime: string;
  refundStatus: number;
  refundStatusName: string;
  projectId: string;
  paidOffAmount: number;
  paidOffTime: string;
  paidOffUser: string;
  paidOnlineAmount: number;
};

type BillListWaterType = BillListBaseType & {
  waterAmount: number;
  price: number;
  waterFee: number;
  indoorAmount: number;
  indoorFee: number;
  publicAmount: number;
  publicFee: number;
};

type BillListElectricType = BillListBaseType & {
  electricAmount: number;
  price: number;
  electricFee: number;
  indoorAmount: number;
  indoorFee: number;
  publicAmount: number;
  publicFee: number;
};

type BillListManageType = BillListBaseType & {
  manageAmount: number;
  price: number;
  manageFee: number;
};

type ImportBillType = {
  excelObjectId: string;
  businessId: string;
  type: number; // 0 水费 1 电费 2 物管费
  params: {
    checkOrImport: 'check' | 'import';
  };
};

type ImportErrorFileType = {
  successCount: number;
  failureCount: number;
  custom: Record<string, any>;
  errorFileUrl: string;
};

type ExcelRecordType = {
  id: string;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  projectBid: string;
  name: string;
  businessId: string;
  fileUrl: string;
  errorFileUrl: string;
  creator: string;
  updater: string;
};

type BillListDetailTradeType = {
  personal: string;
  accountName: string;
  id: number;
  tradeId: string;
  tradeDoneDate: string;
  categoryName: string;
  tradeAmount: number;
  tradeAmountType: number;
  username: string;
  phone: string;
  propertyName: string;
  billIds: number[];
  state: number;
};
