/*
 * @Author: mhf
 * @Date: 2023-02-14 11:17:26
 * @description:
 */
import { simpleReq } from '@/utils/Request';
import { config } from '@/utils/config';
import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const base = HIDE_GETEWAY ? '' : '/base';

/** 设备分页列表 */
export async function getQueryByDevicePage(
  options?: Record<string, any>,
): Promise<ResultPageData<devicesListType>> {
  return request<ResultPageData<devicesListType>>(`${base}/auth/mng/device`, {
    method: 'GET',
    params: options,
  });
}
/** 设备列表 */
export async function getQueryByDeviceList(
  options?: Record<string, any>,
): Promise<ResultData<devicesListType[]>> {
  return request<ResultData<devicesListType[]>>(`${base}/auth/mng/device/list`, {
    method: 'GET',
    params: options,
  });
}

/** 设备类型列表 */
export async function getDeviceTypeList(): Promise<ResultData<devicesType[]>> {
  return request<ResultData<devicesType[]>>(`${base}/auth/mng/device_type/list`, {
    method: 'GET',
  });
}

/** 新增/更新设备 */
export async function addOrUpdateDevice(
  params: Record<string, any>,
): Promise<ResultData<devicesListType>> {
  return request<ResultData<devicesListType>>(`${base}/auth/mng/device`, {
    method: 'POST',
    data: params,
  });
}

/** 删除设备 */
export async function deleteDevice(id: string): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/device/${id}`, {
    method: 'DELETE',
  });
}

/** 设备详情 */
export async function deviceDetails(id: string): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/device/${id}`, {
    method: 'GET',
  });
}

/** 设备摘要列表 */
export async function getDeviceSummary(
  options?: Record<string, any>,
): Promise<ResultData<transferType[]>> {
  return request<ResultData<transferType[]>>(`${base}/auth/mng/device/summary`, {
    method: 'GET',
    params: options,
  });
}

/** 设备注册 */
export async function getDeviceRegister(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/device/register`, {
    method: 'POST',
    data,
  });
}

/** 设备类型分页查询 */
export async function getDeviceTypePage(
  options?: Record<string, any>,
): Promise<ResultPageData<devicesType>> {
  return request<ResultPageData<devicesType>>(`${base}/auth/mng/device_type`, {
    method: 'GET',
    params: options,
  });
}

/** 新建、编辑设备类型 */
export async function createUpdateDeviceType(
  options?: Record<string, any>,
): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/device_type`, {
    method: 'POST',
    data: options,
  });
}

/** 删除设备类型 */
export async function deleteDeviceType(id: string): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/device_type/${id}`, {
    method: 'DELETE',
  });
}

/** 设备事件日志分页查询 */
export async function getDeviceEventLog(
  options?: Record<string, any>,
): Promise<ResultPageData<devicesType>> {
  return request<ResultPageData<devicesType>>(`${base}/auth/mng/device_event_log`, {
    method: 'GET',
    params: options,
  });
}

/** 设备实时数据 */
export async function getRealTimeData(id: string): Promise<ResultData<devicesListType>> {
  return request<ResultData<devicesListType>>(`${base}/auth/mng/device/live_data/${id}`, {
    method: 'GET',
  });
}

/** 设备OTA升级 */
export async function upgrade(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/device/upgrade`, {
    method: 'POST',
    data,
  });
}

/** 处理设备异常 */
export async function exceptionDevice(
  data: Record<string, any>,
): Promise<ResultData<devicesListType>> {
  return request<ResultData<devicesListType>>(`${base}/auth/mng/device/handle_exception`, {
    method: 'POST',
    data,
  });
}

/** 设备编辑 */
export async function updateDevice(
  data: Record<string, any>,
): Promise<ResultData<devicesListType>> {
  return request<ResultData<devicesListType>>(`${base}/auth/mng/device`, {
    method: 'PUT',
    data,
  });
}

/** 获取最新的设备名称 */
export async function latestDeviceName(
  data: Record<string, any>,
): Promise<ResultData<{ code: string; name: string }>> {
  return request<ResultData<{ code: string; name: string }>>(`/auth/mng/device/latest_name`, {
    method: 'POST',
    data,
  });
}

// 分页查询边缘端设备列表
export async function queryEdgeDevicePage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/edge_server`, {
    method: 'GET',
    params,
  });
}

/** 删除边缘设备类型 */
export async function deleteEdgeDevice(id: string): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/edge_server/${id}`, {
    method: 'DELETE',
  });
}

/** 边缘实例明细 */
export async function getEdgeDeviceDetails(id: string): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/edge_server/${id}`, {
    method: 'GET',
  });
}

// 分页查询IP位置规划设备列表
export async function queryIpSpacePage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/ipSpace/page`, {
    method: 'GET',
    params,
  });
}

/** 保存IP位置规划 */
export async function saveIpSpace(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/ipSpace/save`, {
    method: 'POST',
    data,
  });
}

/** 删除IP位置规划 */
export async function deleteIpSpace(id: string): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/mng/ipSpace/delete/${id}`, {
    method: 'DELETE',
  });
}

/** IP位置规划批量导入 */
export async function ipSpaceImport(
  params: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/ipSpace/import`, {
    method: 'POST',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/** IP位置规划批量导入校验 */
export async function ipSpaceImportCheck(
  params: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/ipSpace/import_check`, {
    method: 'POST',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// 分页查询IP位置规划批量导入记录
export async function queryIpSpaceImportRecordPage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/ipSpace/import_record`, {
    method: 'GET',
    params,
  });
}

// 设备告警分页查询
export async function queryDeviceAlarmPage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/device_alarm/page`, {
    method: 'GET',
    params,
  });
}

/** 设备告警保存 */
export async function saveDeviceAlarm(data: Record<string, any>): Promise<Result> {
  return request<Result>(`${base}/auth/mng/device_alarm/save`, {
    method: 'POST',
    data,
  });
}

/** 设备告警详情查询 */
export async function getDeviceAlarmDetails(id: string): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/device_alarm/detail/${id}`, {
    method: 'GET',
  });
}

/** 设备告警上线 */
export async function deviceAlarmOnline(
  params: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/device_alarm/online`, {
    method: 'PUT',
    params,
  });
}

// 设备告警日志分页查询
export async function queryDeviceAlarmLogPage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/device_alarm_log/page`, {
    method: 'GET',
    params,
  });
}

/** 设备告警日志详情查询 */
export async function getDeviceAlarmLogDetails(
  id: string,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(
    `${base}/auth/mng/device_alarm_log/detail/${id}`,
    {
      method: 'GET',
    },
  );
}

export async function deviceDebugProperty(
  data?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/device/debug_property`, {
    method: 'POST',
    data,
  });
}

export async function getDeviceRemoteDebug(id: string): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/device/remote_debug/${id}`, {
    method: 'GET',
  });
}

// 获取产品升级任务列表
export async function getProductUpgradeTask(params: any) {
  return simpleReq<ResultPageData<ProductUpgradeTaskItemType>['data']>(
    `${base}/admin/auth/mng/device_firmware_upgrade_task/queryByPage`,
    {
      method: 'GET',
      params,
    },
  );
}

// 获取产品列表
export async function getProducts() {
  return simpleReq<ProductItemType[]>(`${base}/admin/auth/mng/device/product/list`, {
    method: 'GET',
  });
}

// 获取设备升级列表
export async function getDeviceUpgradeTask({ id, ...params }: Record<string, any> = {}) {
  return simpleReq<ResultPageData<DeviceUpgradeTaskItemType>['data']>(
    `${base}/admin/auth/mng/device_firmware_upgrade_task/detail/${id}`,
    {
      method: 'GET',
      params,
    },
  );
}

// 获取指定任务信息
export async function getProductUpgradeTaskDetail(id: string) {
  return simpleReq<DeviceUpgradeTaskItemType>(
    `${base}/admin/auth/mng/device_firmware_upgrade_task/${id}`,
    {
      method: 'GET',
    },
  );
}

// 产品任务重新升级
export async function upgradeProductTask(id: number) {
  return simpleReq<void>(`${base}/admin/auth/mng/device_firmware_upgrade_task/upgrade/${id}`, {
    method: 'PUT',
  });
}

// 设置任务重新升级
export async function upgradeDeviceTask(id: number) {
  return simpleReq<void>(
    `${base}/admin/auth/mng/device_firmware_upgrade_task/did_task/upgrade/${id}`,
    {
      method: 'PUT',
    },
  );
}

// 删除产品任务
export async function removeProductTask(id: number) {
  return simpleReq<void>(`${base}/admin/auth/mng/device_firmware_upgrade_task/delete/${id}`, {
    method: 'DELETE',
  });
}

// 获取升级资源最新版本
export async function getUpgradeSourceVersion(params: any) {
  return simpleReq<UpgradeSourceItemType>(`${config.xspec_host}/v1/resource`, {
    method: 'GET',
    params,
  });
}

// 创建产品升级任务
export async function createProductUpgradeTask(data: any) {
  return simpleReq<void>(`${base}/admin/auth/mng/device_firmware_upgrade_task`, {
    method: 'POST',
    data,
  });
}

// 删除设备任务
export async function removeDeviceTask(id: number) {
  return simpleReq<void>(`${base}/admin/auth/mng/device_firmware_upgrade_task/did_task/${id}`, {
    method: 'DELETE',
  });
}

// 获取租户所有列表
export async function getTenantProjects(params: any) {
  return simpleReq<TenantProjectItemType[]>(`/masdata/admin/mng/project/tenant/all`, {
    method: 'GET',
    params,
  });
}

// 更新设备点位信息
export async function updateDeviceMapMark(data: any) {
  return simpleReq<void>(`${base}/auth/app/device/batch/update`, {
    method: 'POST',
    data,
  });
}
