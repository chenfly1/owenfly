import { request } from 'umi';

/** 查询车场基础指标情况  */
export async function indicatorBasic(data: Record<string, any>) {
  return request<ResultData<IndicatorBasicType>>('/bi/mng/parking/indicator/basic', {
    method: 'POST',
    data,
  });
}
/** 查询车场基础指标情况  */
export async function deviceOnlineInfo(data: Record<string, any>) {
  return request<ResultData<DeviceOnlineInfoType>>('/bi/mng/parking/device/status/collect', {
    method: 'POST',
    data,
  });
}
/** 查询设备在离线排名   */
export async function deviceOnlineRank(data: Record<string, any>) {
  return request<ResultPageData<DeviceOnlineRankType>>('/bi/mng/parking/device/status/rank', {
    method: 'POST',
    data,
  });
}

/** 费用统计 获取总费用、临停费用、月租费用  */
export async function parkingFee(data: Record<string, any>) {
  return request<ResultData<ParkingFeeType>>('/bi/mng/parking/fee', {
    method: 'POST',
    data,
  });
}
/** 费用统计排行  */
export async function parkingFeeRank(data: Record<string, any>) {
  return request<ResultPageData<ParkingFeeRankType>>('/bi/mng/parking/fee/rank', {
    method: 'POST',
    data,
    params: { type: data.type },
  });
}
/**  查询车辆授权指标情况 */
export async function authVehicStatic(data: Record<string, any>) {
  return request<ResultData<AuthVehicStaticType>>('/bi/mng/parking/vehicle/auth/collect', {
    method: 'POST',
    data,
  });
}

/** 查询车辆授权排名 */
export async function authVehicStaticRank(data: Record<string, any>) {
  return request<ResultPageData<AuthVehicStaticRankType>>('/bi/mng/parking/vehicle/auth/rank', {
    method: 'POST',
    data,
  });
}
/** 单项目通行指标 */
export async function parkPassDetail(data: Record<string, any>) {
  return request<ResultData<ParkPassDetailType>>('/bi/mng/parking/passrecord/project', {
    method: 'POST',
    data,
  });
}
/** 多项目通行指标 */
export async function parkPassDetailRank(data: Record<string, any>) {
  return request<ResultPageData<ParkPassDetailRankType>>(
    '/bi/mng/parking/passrecord/project/rank',
    {
      method: 'POST',
      data,
    },
  );
}

// 门禁设备数量统计，包含在线率
export async function getDevicesCount(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`/bi/mng/door/device/count`, {
    method: 'GET',
    params,
  });
}

// 门禁设备按类型统计
export async function getDevicesCountType(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`/bi/mng/door/device/count/type`, {
    method: 'GET',
    params,
  });
}

// 查询指定项目下，指定时间范围内的通行记录数量（包含访客） 默认统计今日的数据
export async function getPassRecordCount(
  params?: Record<string, any>,
): Promise<ResultData<number>> {
  return request<ResultData<number>>(`/bi/mng/door/passRecord/count`, {
    method: 'GET',
    params,
  });
}

// 人员通行频次趋势分析
export async function getPassRecordCountTrend(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`/bi/mng/door/passRecord/count/trend`, {
    method: 'GET',
    params,
  });
}

// 用户授权数量趋势分析
export async function getUserAuthCountTrend(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`/bi/mng/door/userAuth/count/trend`, {
    method: 'GET',
    params,
  });
}

// 统计各个开门方式的通行数量（取昨日一天的数据）
export async function getPassRecordCountAccessType(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`/bi/mng/door/passRecord/count/accessType`, {
    method: 'GET',
    params,
  });
}

// 访客来访数量统计，包含今日与昨日的比率
export async function getVistorCount(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`/bi/mng/door/visitor/count`, {
    method: 'GET',
    params,
  });
}

// 查询指定项目下，指定时间范围内的用户授权数量，包含与昨日的比率
export async function getUserAuthCount(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`/bi/mng/door/userAuth/count`, {
    method: 'GET',
    params,
  });
}
