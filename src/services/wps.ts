import { request } from 'umi';

/** 分页查询租户列表 */
export async function getQueryByPage(
  options?: Record<string, any>,
): Promise<ResultPageData<TenantListType>> {
  return request<ResultPageData<TenantListType>>('/wps/admin/tenant/queryByPage', {
    method: 'GET',
    params: options,
  });
}

/** 删除租户 */
export async function deleteTenantData(id: number): Promise<ResultData<string>> {
  return request<ResultData<string>>(`/wps/admin/tenant/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 创建租户 */
export async function createTenant(params: Record<string, any>) {
  return request('/wps/admin/tenant/create', {
    method: 'POST',
    data: params,
  });
}

/** 租户详情 */
export async function getTenantDetails(id: number) {
  return request(`/wps/admin/tenant/detail/${id}`, {
    method: 'GET',
  });
}

/** 租户编辑 */
export async function updateTenant(id: number, params: Record<string, any>) {
  return request(`/wps/admin/tenant/update/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/** 分页获取应用列表 */
export async function setMealList(params: Record<string, any>) {
  return request('/wps/admin/system/queryByPage', {
    method: 'GET',
    params,
  });
}

/** 应用列表 */
export async function setMealListAll(params: {
  name?: string;
  tenantBid: string;
}): Promise<ResultData<MealListData[]>> {
  return request<ResultData<MealListData[]>>('/wps/admin/system/list/all', {
    method: 'GET',
    params,
  });
}

/** 应用详情 */
export async function setMealDetail(id: number) {
  return request(`/wps/admin/system/detail/${id}`, {
    method: 'GET',
  });
}

/** 应用创建 */
export async function setMealCreate(data: Record<string, any>) {
  return request(`/wps/admin/system/create`, {
    method: 'POST',
    data,
  });
}

/** 应用编辑 */
export async function setMealUpdate(id: number, data: Record<string, any>) {
  return request(`/wps/admin/system/update/${id}`, {
    method: 'PUT',
    data,
  });
}

/**删除应用 */
export async function delateApplication(params: { id: number }): Promise<Result> {
  return request<Result>(`/wps/admin/system/delete/${params.id}`, {
    method: 'DELETE',
  });
}

/** 模块列表 */
export async function getGdcTree(): Promise<ResultData<ApplicationItemType[]>> {
  return request('/wps/admin/resource/gdc/all/tree', {
    method: 'GET',
  });
}

/** A端资源列表 */
export async function getGdcAllTree(): Promise<ResultData<ApplicationItemType[]>> {
  return request('/wps/admin/resource/gdc/all/tree', {
    method: 'GET',
  });
}

/** 获取模块列表 */
export async function getGdcTreeDetail(id: number): Promise<ResultData<ApplicationItemType>> {
  return request(`/wps/admin/resource/gdc/detail/${id}`, {
    method: 'GET',
  });
}

/** 获取资源code列表 */
export async function gdcAuthority(
  data: Record<string, any>,
): Promise<ResultData<AuthorityType[]>> {
  return request(`/wps/admin/resource/gdc/authority`, {
    method: 'GET',
    params: data,
  });
}

/** 更新模块列表 */
export async function updateGdcTree(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<ApplicationItemType>> {
  return request(`/wps/admin/resource/gdc/update/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除模块列表 */
export async function delResource(id: number): Promise<ResultData<ApplicationItemType>> {
  return request(`/wps/admin/resource/gdc/delete/${id}`, {
    method: 'DELETE',
  });
}

/** A端更新模块列表 */
export async function updateResource(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<ApplicationItemType>> {
  return request(`/wps/admin/system/update/resource/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 创建模块列表 */
export async function registerGdcTree(
  data: Record<string, any>,
): Promise<ResultData<ApplicationItemType>> {
  return request(`/wps/admin/resource/gdc/register`, {
    method: 'POST',
    data,
  });
}

/** 获取地区省市 */
export async function getDistrictQuery(params: Record<string, any>) {
  return request('/wps/api/v1/district/queryByLevel', {
    method: 'POST',
    data: params,
  });
}

/** 模块列表(关联租户) */
export async function getModuleList(
  params: Record<string, any>,
): Promise<ResultData<ApplicationItemType[]>> {
  return request(`/wps/admin/system/modules`, {
    method: 'GET',
    params,
  });
}

/** 模块列表(关联租户) */
export async function getModuleAllList(
  params: Record<string, any>,
): Promise<ResultData<ApplicationItemType[]>> {
  return request(`/wps/admin/system/all/modules`, {
    method: 'GET',
    params,
  });
}

/** 模块列表 */
export async function getGlobalList(
  params: Record<string, any>,
): Promise<ResultData<ApplicationItemType[]>> {
  return request(`/wps/admin/system/global/module`, {
    method: 'GET',
    params,
  });
}

/** 开通模块 */
export async function updateBatchState(
  data: { id: number; state: string }[],
): Promise<ResultData<string>> {
  return request(`/wps/admin/system/updateBatchState`, {
    method: 'PUT',
    data,
  });
}

/** 开通模块 */
export async function updateBatch(
  data: { id: number; state: string }[],
): Promise<ResultData<string>> {
  return request(`/wps/admin/system/updateBatch`, {
    method: 'PUT',
    data,
  });
}

/** 修改密保手机号 */
export async function modifyPhone(tenantBid: string, data: Record<string, any>) {
  return request<ResultData<string>>(`/wps/api/v1/tenantInfo/modify/${tenantBid} `, {
    method: 'PUT',
    data,
  });
}

/** 租户列表导出 */
export async function tenantExport(params: Record<string, any>) {
  return request<ResultData<string>>(`/wps/admin/tenant/export `, {
    method: 'GET',
    params,
  });
}

/** 全局资源系统层排序 */
export async function sortWpsSystem(data: { id: number }[]): Promise<Result> {
  return request<Result>('/wps/admin/system/sort', {
    method: 'PUT',
    data,
  });
}

/** 全局资源资源层排序 */
export async function sortWpsResource(data: { id: number }[]): Promise<Result> {
  return request<Result>('/wps/admin/resource/gdc/sort', {
    method: 'PUT',
    data,
  });
}

export async function globalResourceSync(
  data: { id: number; state: string }[],
): Promise<ResultData<string>> {
  return request('/wps/admin/system/global/sync', {
    method: 'PUT',
    data,
  });
}
