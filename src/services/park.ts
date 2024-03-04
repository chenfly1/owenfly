import { request } from 'umi';

/** 车场列表 */
export async function parkYardListByPage(data: any) {
  return request<ResultPageData<ParkYardType>>('/parking/mng/park/queryByPage', {
    method: 'POST',
    data,
  });
}

/** 车场下拉列表  */
export async function parkYardDropDownList(id: string, data: any) {
  return request<ResultData<ParkYardType[]>>(`/parking/mng/park/options/${id}`, {
    method: 'POST',
    data,
  });
}

/** 车场准入区域树 */
export async function parkAreaTree(id: string) {
  return await request<ResultData<ParkAreaTreeType[]>>(`/parking/mng/park/area/tree/${id}`, {
    method: 'GET',
  });
}

/** 查看车场详情  */
export async function parkDetail(id: string) {
  return await request<ResultData<ParkDetailType>>(`/parking/mng/park/detail/${id}`, {
    method: 'GET',
  });
}
/** 查看车场二维码  */
export async function parkQrcode(params: Record<string, any>) {
  return await request<ResultData<ParkQrcodeType>>(`/parking/mng/park/qr_code`, {
    method: 'GET',
    params,
  });
}

// 绑定车场
export async function parkBind(data: ParkBindParams & Record<string, any>) {
  return request<ResultData<any>>('/parking/mng/park/bind', {
    method: 'POST',
    data,
  });
}
// 更新车场
export async function parkModify(data: ParkModifyParams & Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/park/modify/${data?.id}`, {
    method: 'PUT',
    data,
  });
}
// 同步刷新车场区域及通道
export async function parkSyncRefresh(id: string) {
  return request<ResultData<any>>(`/parking/mng/park/sync_refresh/${id}`, {
    method: 'POST',
  });
}

/** 区域列表 */
export async function parkAreaByPage(data: any) {
  return request<ResultPageData<ParkAreaType>>('/parking/mng/park_area/queryByPage', {
    method: 'POST',
    data,
  });
}

/** 区域详情 */
export async function parkAreaDetail(id: string) {
  return request<ResultData<ParkAreaType>>(`/parking/mng/park_area/detail/${id}`, {
    method: 'GET',
  });
}

/** 更新区域 */
export async function updateParkArea(id: string, data: any) {
  return request<ResultData<ParkAreaType>>(`/parking/mng/park_area/modify/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 车位列表 */
export async function placeQueryByPage(data: any) {
  return request<ResultPageData<SpaceType>>('/parking/mng/place/queryByPage', {
    method: 'POST',
    data,
  });
}

/** 套餐列表 */
export async function serviceListByPage(data: any) {
  return request<ResultPageData<ParkServiceType>>('/parking/mng/package/queryByPage', {
    method: 'POST',
    data,
  });
}

/** 套餐详情 */
export async function serviceDetail(id: string) {
  return request<ResultData<ParkServiceType>>(`/parking/mng/package/detail/${id}`, {
    method: 'GET',
  });
}

/** 创建套餐 */
export async function addService(data: any) {
  return request<ResultData<ParkServiceType>>('/parking/mng/package/create', {
    method: 'POST',
    data,
  });
}

/** 更新套餐 */
export async function updateService(id: string, data: Record<string, any>): Promise<Result> {
  return request<Result>(`/parking/mng/package/modify/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 更改套餐使用状态 */
export async function updateServiceStatus(id: string): Promise<Result> {
  return request<Result>(`/parking/mng/package/modify/state/${id}`, {
    method: 'PUT',
  });
}

/** 删除套餐 */
export async function deleteService(id: string): Promise<Result> {
  return request<Result>(`/parking/mng/package/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 车场下拉生效套餐 */
export async function packageOptions(data: any) {
  return request<ResultData<ParkServiceType[]>>(
    `/parking/mng/package/options/active/${data.parkId}`,
    {
      method: 'POST',
      data,
    },
  );
}
/** 车场下拉生效套餐 */
export async function refrePay(id: string) {
  return request<ResultData<Record<string, any>>>(`/parking/mng/vehicle_auth/refrePay/${id}`, {
    method: 'POST',
  });
}

/** 通道列表 */
export async function passageList(params: Record<string, any>) {
  return request<ResultData<PassageDetailType[]>>(`/parking/mng/passage/list`, {
    method: 'GET',
    params,
  });
}

/** 通道明细 */
export async function passageDetail(id: string) {
  return request<ResultData<PassageDetailType>>(`/parking/mng/passage/${id}`, {
    method: 'GET',
  });
}

/** 通道分页列表 */
export async function passageQueryByPage(params: Record<string, any>) {
  return request<ResultPageData<PassageDetailType>>(`/parking/mng/passage`, {
    method: 'GET',
    params,
  });
}

/** 同步厂商通道 */
export async function passageSync(data: { parkId: string }) {
  return request<ResultData<any>>('/parking/mng/passage', {
    method: 'POST',
    data,
  });
}

/** 通道编辑 */
export async function passageUpdate(data: PassageEditParamsType & Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/passage`, {
    method: 'PUT',
    data,
  });
}

/** 使用状态切换 */
export async function passageChangeState(data: { id: string; useStatus: string }) {
  return request<ResultData<ParkServiceType>>('/parking/mng/passage/change/status', {
    method: 'POST',
    data,
  });
}

/** 通道二维码生成 */
export async function passageQrcode(params: Record<string, any>) {
  return request<ResultData<any>>('/parking/mng/passage/qrcode', {
    method: 'GET',
    params,
  });
}

/** 设备列表 */
export async function deviceList(params: Record<string, any>) {
  return request<ResultData<DeviceItemType[]>>('/parking/mng/device/list', {
    method: 'GET',
    params,
  });
}

/** 设备明细 */
export async function deviceDetail(id: string) {
  return request<ResultData<DeviceItemType>>(`/parking/mng/device/${id}`, {
    method: 'GET',
  });
}

/** 设备分页列表 */
export async function deviceQueryByPage(params: Record<string, any>) {
  return request<ResultPageData<DeviceItemType>>(`/parking/mng/device`, {
    method: 'GET',
    params,
  });
}

/** 同步厂商设备 */
export async function deviceSync(data: { parkId: string; projectId: string }) {
  return request<ResultData<any>>('/parking/mng/device/sync', {
    method: 'POST',
    data,
  });
}

/** 设备编辑 */
export async function deviceUpdate(data: DeviceEditParamsType & Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/device`, {
    method: 'PUT',
    data,
  });
}

/** 使用状态切换 */
export async function deviceChangeState(data: { id: string; useStatus: number }) {
  return request<ResultData<ParkServiceType>>('/parking/mng/device/change/status', {
    method: 'POST',
    data,
  });
}

/** 计费规则 */
export async function chargeRuleByPage(params: any) {
  return request<ResultPageData<ParkChargeRuleType[]>>('/parking/mng/charge_rule', {
    method: 'GET',
    params,
  });
}
/** 同步计费规则 */
export async function syncChargeRule(data: { projectId: string; parkId: string }) {
  return request<ResultData<boolean>>('/parking/mng/charge_rule/sync', {
    method: 'POST',
    data,
  });
}

/** 业务规则 */
export async function ruleConfigDetail(id: string) {
  return request<ResultData<ParkRuleConfigType>>(`/parking/mng/business_rule/${id}`, {
    method: 'GET',
  });
}

/** 更新缴费规则 */
export async function updateRuleConfigCharge(data: any) {
  return request<ResultData<string>>('/parking/mng/business_rule/payment', {
    method: 'POST',
    data,
  });
}

/** 更新通行规则 */
export async function updateRuleConfigPass(data: any) {
  return request<ResultData<string>>('/parking/mng/business_rule/pass', {
    method: 'POST',
    data,
  });
}

/** 更新支付规则 */
export async function updateRuleConfigPay(data: any) {
  return request<ResultData<string>>('/parking/mng/business_rule/disbursement', {
    method: 'POST',
    data,
  });
}

/** 分页查询车主车辆 */
export async function platformVehicleQueryByPage(
  data: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultPageData<PlatformVehicleType>>('/parking/mng/platform_vehicle/queryByPage', {
    method: 'POST',
    data,
  });
}
/** 查看车主车辆详情 */
export async function platformVehicleDetail(id: string) {
  return request<ResultData<PlatformVehicleType>>(`/parking/mng/platform_vehicle/detail/${id}`, {
    method: 'GET',
  });
}
/** 创建车主车辆 */
export async function platformVehicleCreate(data: PlatformVehicleCreateType & Record<string, any>) {
  return request<ResultData<boolean>>('/parking/mng/platform_vehicle/create', {
    method: 'POST',
    data,
  });
}
/** 更新车主车辆 */
export async function platformVehicleModify(
  data: PlatformVehicleType & { id: string } & Record<string, any>,
) {
  return request<ResultData<boolean>>(`/parking/mng/platform_vehicle/modify/${data.id}`, {
    method: 'PUT',
    data,
  });
}
/** 删除车主车辆 */
export async function platformVehicleDelete(id?: string) {
  return request<ResultData<boolean>>(`/parking/mng/platform_vehicle/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 授权记录列表 */
export async function vehicleAuthQueryByPage(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultData<ResultElementsType<VehicleAuthType>>>('/parking/mng/vehicle_auth', {
    method: 'GET',
    params,
  });
}
/** 新增授权 */
export async function vehicleAuthCreate(data: VehicleAuthCreateType & Record<string, any>) {
  return request<ResultData<Record<string, any>>>('/parking/mng/vehicle_auth', {
    method: 'POST',
    data,
  });
}
/** 解绑车辆授权 */
export async function vehicleAuthDelete(id: string) {
  return request<ResultData<boolean>>(`/parking/mng/vehicle_auth/unbound/${id}`, {
    method: 'DELETE',
  });
}
/** 退费接口 */
export async function vehicleAuthRefund(id: string) {
  return request<ResultData<boolean>>(`/parking/mng/vehicle_auth/refund/${id}`, {
    method: 'POST',
  });
}
/** 车辆授权延期 */
export async function vehicleAuthDate(data: { id: string; authId: string; endDate: string }) {
  return request<ResultData<boolean>>(`/parking/mng/vehicle_auth/date/${data.id}`, {
    method: 'PUT',
    data,
  });
}
/** 更换车牌 */
export async function vehicleAuthPlate(data: { id: string; carIds?: string[] }) {
  return request<ResultData<boolean>>(`/parking/mng/vehicle_auth/plate/${data.id}`, {
    method: 'PUT',
    data,
  });
}
/** 授权详情 */
export async function vehicleAuthDetail(id: string) {
  return request<ResultData<vehicleAuthDetailType>>(`/parking/mng/vehicle_auth/detail/${id}`, {
    method: 'GET',
    // data,
  });
}
/** 授权详情 */
export async function orderState(id: string) {
  return request<ResultData<any>>(`/parking/mng/vehicle_auth/order_state/${id}`, {
    method: 'GET',
    // data,
  });
}
/** 续费 */
export async function vehicleAutRenew(data: VehicleAutRenewParamsType) {
  return request<ResultData<Record<string, any>>>(`/parking/mng/vehicle_auth/renew/${data.id}`, {
    method: 'PUT',
    data,
  });
}

/** 临停交易记录查询 */
export async function transRecordsLt(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultData<ResultElementsType<TransRecordsltType>>>(
    `/parking/mng/trans_records/lt`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 月租交易记录查询 */
export async function transRecordsYz(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultData<ResultElementsType<TransRecordsyzType>>>(
    `/parking/mng/trans_records/yz`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 临停订单记录查询 */
export async function orderRecordsLt(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultData<ResultElementsType<OrderRecordsltType>>>(
    `/parking/mng/order_records/lt`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 月租交易记录查询 */
export async function orderRecordsYz(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultData<ResultElementsType<OrderRecordsyzType>>>(
    `/parking/mng/order_records/yz`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 通行记录分页列表 */
export async function passageRecord(
  params: { pageNo: number; pageSize: number } & Record<string, any>,
) {
  return request<ResultPageData<PassageRecordType>>(`/parking/mng/passage_record`, {
    method: 'GET',
    params,
  });
}
/** 查询厂商列表 */
export async function factoryList() {
  return request<ResultData<{ name: string; code: string }[]>>(`/parking/mng/factory/list`, {
    method: 'GET',
  });
}
/** 查询厂商列表 */
export async function parkList(params: Record<string, any>) {
  return request<ResultPageData<{ name: string; code: string; totalCarports: string }>>(
    `/parking/mng/factory/park/list/${params.factoryCode}`,
    {
      method: 'GET',
      params,
    },
  );
}

export async function parkExportExcel(data: Record<string, any>) {
  return request<ResultPageData<ParkYardType[]>>(`/parking/parking/auth/excel`, {
    responseType: 'blob',
    method: 'GET',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
}
// 车主认证查询
export async function vehicleAttestateQueryByPage(data: Record<string, any>) {
  return request<ResultPageData<VehicleAttestateType>>(
    `/parking/mng/vehicle_attestate/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}
// 字典接口
export async function getDict(code: string) {
  return request<
    ResultData<{ groupCode: string; groupName: string; code: string; name: string }[]>
  >(`/parking/resource/param/options/${code}`, {
    method: 'GET',
  });
}

// 分页查询待审核列表
export async function queryApprovingPage(data: Record<string, any>) {
  return request<ResultPageData<VehicleApprovingType>>(
    `/parking/mng/vehicle_attestate/queryApprovingPage`,
    {
      method: 'POST',
      data,
    },
  );
}

// 查询车辆认证详情
export async function queryApprovingDetail(params: Record<string, any>) {
  return request<ResultData<VehicleApprovingDetailType>>(
    `/parking/mng/vehicle_attestate/approve/detail/${params.id}`,
    {
      method: 'GET',
      params,
    },
  );
}

// 车辆申诉审核
export async function vehicleAttestateApprove(data: Record<string, any>) {
  return request<ResultData<VehicleApprovingDetailType>>(
    `/parking/mng/vehicle_attestate/approve/handle/${data.id}`,
    {
      method: 'POST',
      data,
    },
  );
}
// 授权待审列表查询
export async function vehicleAuthReview(params: Record<string, any>) {
  return request<ResultData<ResultElementsType<VehicleAuthReviewType>>>(
    `/parking/mng/vehicle_auth_review`,
    {
      method: 'GET',
      params,
    },
  );
}
// 授权通过/办理
export async function vehicleAuthHandle(data: Record<string, any>) {
  return request<ResultData<string>>(`/parking/mng/vehicle_auth_review/review/${data.reviewType}`, {
    method: 'POST',
    data,
  });
}

// C端业务配置信息
export async function appConfigDetail(params?: Record<string, any>) {
  return request<ResultData<AppConfigType>>(`/parking/mng/app_config/detail`, {
    method: 'GET',
    params,
  });
}

// C端业务配置信息修改
export async function appConfigEdit(data: Record<string, any>) {
  return request<ResultData<string>>(`/parking/mng/app_config/detail`, {
    method: 'PUT',
    data,
  });
}

// 批量授权导入
export async function authImport(data: Record<string, any>) {
  return request<ResultData<Record<string, any>>>(`/parking/mng/vehicle_auth/batch/upload`, {
    method: 'POST',
    data,
    requestType: 'form',
  });
}

// 查询空间车场
export async function spaceParkList(data?: Record<string, any>) {
  return request<ResultData<SpaceParkType>>(`/parking/mng/mas/park/queryByPage`, {
    method: 'POST',
    data,
  });
}

// 重新下发
export async function reSendAuth(data?: Record<string, any>) {
  return request<ResultData<SpaceParkType>>(`/parking/mng/vehicle_auth/reSendAuth/${data?.id}`, {
    method: 'POST',
    data,
  });
}

// 黑名单列表查询
export async function blackCarQueryByPage(params?: Record<string, any>) {
  return request<ResultPageData<BlackListType>>(`/parking/mng/black_list`, {
    method: 'GET',
    params,
  });
}

// 添加黑名单车辆
export async function createBlackCar(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/black_list`, {
    method: 'POST',
    data,
  });
}

// 移除黑名单车辆
export async function removeBlackCar(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/black_list/${data?.id}`, {
    method: 'DELETE',
    data,
  });
}

// 分页查询商户列表，同时具备导出功能
export async function merchantQueryByPage(params?: Record<string, any>) {
  return request<ResultPageData<MerchantType>>(`/parking/mng/merchant`, {
    method: 'GET',
    params,
  });
}

// 商户详情
export async function merchantDetail(params?: Record<string, any>) {
  return request<ResultData<MerchantType>>(`/parking/mng/merchant/${params?.id}`, {
    method: 'GET',
    params,
  });
}

// 编辑商户
export async function merchantCreatUpdate(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/merchant`, {
    method: 'POST',
    data,
  });
}

// 商户启用
export async function merchantAbled(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/merchant/enable/${data?.id}`, {
    method: 'POST',
    data,
  });
}
// 商户禁用
export async function merchantDisabled(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/merchant/disable/${data?.id}`, {
    method: 'POST',
    data,
  });
}

// 优惠卷查询
export async function couponQeryByPage(params?: Record<string, any>) {
  return request<ResultData<ResultElementsType<CouponType>>>(`/parking/mng/coupon`, {
    method: 'GET',
    params,
  });
}
// 优惠卷新增
export async function couponCreate(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon`, {
    method: 'POST',
    data,
  });
}
// 优惠卷详情
export async function couponDetai(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon/detail/${data?.id}`, {
    method: 'GET',
    data,
  });
}
// 优惠卷上线
export async function couponOnline(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon/on/${data?.id}`, {
    method: 'PUT',
    data,
  });
}
// 优惠卷下线
export async function couponOffline(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon/off/${data?.id}`, {
    method: 'PUT',
    data,
  });
}
// 优惠卷销售查询
export async function couponSale(params?: Record<string, any>) {
  return request<ResultData<ResultElementsType<CouponSaleType>>>(`/parking/mng/coupon_sales`, {
    method: 'GET',
    params,
  });
}
// 优惠卷销售查询
export async function couponSaleCreate(data?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon_sales`, {
    method: 'POST',
    data,
  });
}
// 优惠卷销售导出
export async function couponSaleExport(params?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/coupon_sales/export`, {
    method: 'GET',
    params,
  });
}

// 优惠券发放记录
export async function couponReceive(params?: Record<string, any>) {
  return request<ResultPageData<CouponReceiveType>>(`/parking/mng/coupon/record/receive`, {
    method: 'GET',
    params,
  });
}

// 优惠券使用记录
export async function recordUsed(params?: Record<string, any>) {
  return request<ResultPageData<RecordUsedType>>(`/parking/mng/coupon/record/used`, {
    method: 'GET',
    params,
  });
}
// 员工数据
export async function queryUser(data?: Record<string, any>) {
  return request<ResultData<Record<string, any>[]>>(`/parking/mng/platform_vehicle/queryUser`, {
    method: 'POST',
    data,
  });
}
// 设置访客规则配置
export async function businessRuleVisitor(data?: Record<string, any>) {
  return request<ResultData<Record<string, any>[]>>(`/parking/mng/business_rule/visitor`, {
    method: 'POST',
    data,
  });
}

// 设置访客规则配置
export async function getVisitorConfig(params?: Record<string, any>) {
  return request<ResultData<Record<string, any>[]>>(
    `/parking/mng/business_rule/visitor/${params?.projectId}`,
    {
      method: 'GET',
      params,
    },
  );
}

// 退费
export async function orderRecordsRefund(data?: Record<string, any>) {
  return request<ResultData<string>>(`/parking/mng/order_records/refund`, {
    method: 'POST',
    data,
  });
}

// 查询楼栋列表
export async function buildingList(params?: Record<string, any>) {
  return request<ResultData<BuildItemType[]>>(`/masdata/mng/building/list`, {
    method: 'GET',
    params,
  });
}

// 停临退款详情
export async function ltRefund(params?: Record<string, any>) {
  return request<ResultData<LtRefundType>>(`/parking/mng/trans_records/lt_refund/${params?.id}`, {
    method: 'GET',
    params,
  });
}

// 月租退款详情
export async function yzRefund(params?: Record<string, any>) {
  return request<ResultData<YzRefundType>>(`/parking/mng/trans_records/yz_refund/${params?.id}`, {
    method: 'GET',
    params,
  });
}

// 对账列表
export async function tradebillList(data?: Record<string, any>) {
  return request<ResultData<ResultElementsType<TradebillListType>>>(`/parking/mng/tradebill/list`, {
    method: 'POST',
    data,
  });
}

// 对账列表明细
export async function tradebillDetail(data?: Record<string, any>) {
  return request<ResultData<ResultElementsType<TradebillDetailType>>>(
    `/parking/mng/tradebill/detail`,
    {
      method: 'POST',
      data,
    },
  );
}

// 退款记录表
export async function refundRecord(params?: Record<string, any>) {
  return request<ResultData<ResultElementsType<RefundRecordType>>>(`/parking/mng/refund_record`, {
    method: 'GET',
    params,
  });
}

// 退款记录详情
export async function refundRecordDetail(params?: Record<string, any>) {
  return request<ResultData<RefundRecordDetailType>>(`/parking/mng/refund_record/${params?.id}`, {
    method: 'GET',
    params,
  });
}

// 月租支付订单详情
export async function transRecordsDetailYz(params?: Record<string, any>) {
  return request<ResultData<TransRecordsDetailYzType>>(
    `/parking/mng/trans_records/detail/yz/${params?.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
// 临停支付订单详情
export async function transRecordsDetailLt(params?: Record<string, any>) {
  return request<ResultData<TransRecordsDetailLtType>>(
    `/parking/mng/trans_records/detail/lt/${params?.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
// 分页查询开闸记录
export async function getOpenGateList(data?: Record<string, any>) {
  return request<ResultPageData<OpenGateRecordQueryType>>(
    `/parking/mng/pass/record/open_gate/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}
// 查询开闸详情
export async function getOpenGateDetail(params?: Record<string, any>) {
  return request<ResultData<OpenGateDetailType>>(
    `/parking/mng/pass/record/open_gate/detail/${params?.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
// 分页查询放行记录
export async function getUnusualReleaseList(data?: Record<string, any>) {
  return request<ResultPageData<UnusualReleaseRecordQueryType>>(
    `/parking/mng/pass/record/unusual_release/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}
// 查询放行详情
export async function getReleaseRecordDetail(params?: Record<string, any>) {
  return request<ResultData<ReleaseRecordDetailType>>(
    `/parking/mng/pass/record/unusual_release/detail/${params?.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
// 分页查询车辆变更记录
export async function getPlateChangeList(data?: Record<string, any>) {
  return request<ResultPageData<PlateChangeType>>(
    `/parking/mng/operate/log/plate_change/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}
// 分页查询固定车辆操作记录
export async function getOperateLogList(data?: Record<string, any>) {
  return request<ResultPageData<OperateLogType>>(`/parking/mng/operate/log/vehicle/queryByPage`, {
    method: 'POST',
    data,
  });
}
// 分页查询异常对账记录列表
export async function getBillErr(params?: Record<string, any>) {
  return request<ResultData<any>>(`/parking/mng/bill_chk_err`, {
    method: 'GET',
    params,
  });
}
// 查询异常对账记录详情
export async function getBillChkErr(params?: Record<string, any>) {
  return request<ResultData<BillErrInfo>>(`/parking/mng/bill_chk_err/${params?.id}`, {
    method: 'GET',
  });
}
// 异常对账人工核销
export async function billErrReview(data?: Record<string, any>) {
  return request<ResultData<string>>(`/parking/mng/bill_chk_err/review`, {
    method: 'POST',
    data,
  });
}
// 查询三方支付订单
export async function getThirdOrder(params?: Record<string, any>) {
  return request<ResultData<ThirdOrder>>(`/parking/mng/order_records/third_order/${params?.id}`, {
    method: 'GET',
  });
}
// 订单关闭
export async function closeOrderRecord(params?: Record<string, any>) {
  return request<ResultData<void>>(`/parking/mng/order_records/close`, {
    method: 'GET',
    params,
  });
}
