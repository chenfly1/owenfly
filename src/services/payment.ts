import { request } from 'umi';

/** 发票列表 */
export async function invoiceList(params: any) {
  return request<ResultPageData<ResultElementsType<InvoiceListType>>>('/content/mng/invoice', {
    method: 'GET',
    params,
  });
}

/** 发票详情 */
export async function invoiceDetail(params: any) {
  return request<ResultData<InvoiceListType>>(`/content/mng/invoice/${params.id}`, {
    method: 'GET',
    params,
  });
}

/** 账单汇总信息 */
export async function qryTotalSummary(params: any) {
  return request<ResultData<QryTotalSummaryType>>(`/content/mng/bill_list/qry_total_summary`, {
    method: 'GET',
    params,
  });
}

/** 单个或者批量审核下发 */
export async function billListReview(data: string[]) {
  return request<ResultData<any>>(`/content/mng/bill_list/review`, {
    method: 'POST',
    data,
  });
}

/** 单个或者批量关闭帐单 */
export async function billListClose(data: string[]) {
  return request<ResultData<any>>(`/content/mng/bill_list/close`, {
    method: 'POST',
    data,
  });
}

/** 单个或者批量线下支付账单 */
export async function billListOfflinePay(data: Record<string, any>) {
  return request<ResultData<any>>(`/content/mng/bill_list/offline_pay`, {
    method: 'POST',
    data,
  });
}

/** 单个或者批量退款 */
export async function billListRefund(data: string[]) {
  return request<ResultData<any>>(`/content/mng/bill_list/refund`, {
    method: 'POST',
    data,
  });
}
/** 获取项目帐单类目列表 */
export async function propertyCategoryList(params: Record<string, any>) {
  return request<ResultData<{ code: string; name: string }[]>>(
    `/content/mng/common/category_list`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 分页查询交易记录 */
export async function tradeList(params: Record<string, any>) {
  return request<ResultPageData<TradeListType>>(`/content/mng/trade`, {
    method: 'GET',
    params,
  });
}

/** 查询交易记录详情 */
export async function tradeDetail(params: Record<string, any>) {
  return request<ResultData<TradeDetailType>>(`/content/mng/trade/${params?.id}`, {
    method: 'GET',
    params,
  });
}

/** 分页查询账户列表 */
export async function tradeAccountList(params: Record<string, any>) {
  return request<ResultPageData<TradeAccountListType>>(`/content/mng/account`, {
    method: 'GET',
    params,
  });
}

/** 创建账户 */
export async function createTradeAccount(data: Record<string, any>) {
  return request<ResultData<any>>(`/content/mng/account`, {
    method: 'POST',
    data,
  });
}

/** 编辑账户 */
export async function updateTradeAccount(data: Record<string, any>) {
  return request<ResultData<any>>(`/content/mng/account/${data.id}`, {
    method: 'PUT',
    data,
  });
}

/** 查询账户详情 */
export async function tradeAccountDetail(params: Record<string, any>) {
  return request<ResultData<any>>(`/content/mng/account/${params.id}`, {
    method: 'GET',
    params,
  });
}

/** 停启用 */
export async function tradeAccountOnOff(data: Record<string, any>) {
  return request<ResultData<any>>(`/content/mng/account/onOff/${data.id}`, {
    method: 'PUT',
    data,
  });
}

/** 查询当前项目下收费项 */
export async function tradeCategoryList(params?: Record<string, any>) {
  return request<ResultData<{ id: string; name: string }[]>>(`/content/mng/category`, {
    method: 'GET',
    params,
  });
}

/** 查询当前项目下收费项 */
export async function billListWater(data?: Record<string, any>) {
  return request<ResultPageData<BillListWaterType>>(`/content/mng/bill_list/water`, {
    method: 'POST',
    data,
  });
}

/** 查询水费账单列表，可用于数据导出和分页查询  */
export async function billListElectric(data?: Record<string, any>) {
  return request<ResultPageData<BillListElectricType>>(`/content/mng/bill_list/electric`, {
    method: 'POST',
    data,
  });
}

/** 查询物管账单列表，可用于数据导出和分页查询  */
export async function billListManage(data?: Record<string, any>) {
  return request<ResultPageData<BillListManageType>>(`/content/mng/bill_list/manage`, {
    method: 'POST',
    data,
  });
}
// 导入
export async function importMainData(data: ImportBillType) {
  return request<ResultData<ImportErrorFileType>>('/content/mng/bill_list/upload', {
    method: 'POST',
    data,
    // requestType: 'form',
  });
}

// 查询导入列表
export async function excelRecord(params: Record<string, any>) {
  return request<ResultPageData<ExcelRecordType>>('/content/auth/excel/record', {
    method: 'GET',
    params,
  });
}

// 查询账单的缴费记录详情
export async function billListDetailTrade(params: Record<string, any>) {
  return request<ResultData<BillListDetailTradeType[]>>('/content/mng/bill_list/detail/trade', {
    method: 'GET',
    params,
  });
}
