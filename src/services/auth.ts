import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const base = HIDE_GETEWAY ? '' : '/base';

/** 分页查询用户 */
export async function userQueryByPage(
  options?: Record<string, any>,
): Promise<ResultPageData<UserListType>> {
  return request<ResultPageData<UserListType>>(`/auth/account/queryByPage`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建用户 */
export async function userCreate(
  params: OrgCreateParamsType,
): Promise<ResultData<UserCreateParamsType>> {
  return request<ResultData<UserCreateParamsType>>(`/auth/account/create`, {
    method: 'POST',
    data: params,
  });
}
/** 更新用户 */
export async function userUpdate(
  params: OrgCreateParamsType,
): Promise<ResultData<UserCreateParamsType>> {
  return request<ResultData<UserCreateParamsType>>(`/auth/account/update/${params.id}`, {
    method: 'POST',
    data: params,
  });
}
/** 删除用户 */
export async function userDelete(id: number) {
  return request<ResultData<boolean>>(`/auth/account/delete/${id}`, {
    method: 'DELETE',
  });
}
/** 批量删除用户 */
export async function userBatchDelete(ids: string[]) {
  return request<ResultData<boolean>>(`/auth/account/batchDelete`, {
    method: 'POST',
    data: { ids },
  });
}
/** 用户详情 */
export async function userDetail(id: string): Promise<ResultData<UserDetailType>> {
  return request<ResultData<UserDetailType>>(`/auth/account/detail/${id}`, {
    method: 'GET',
  });
}

/** 分页查询角色 */
export async function roleQueryByPage(
  options?: Record<string, any>,
): Promise<ResultPageData<RoleListType>> {
  return request<ResultPageData<RoleListType>>(`/auth/role/queryByPage`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新增角色 */
export async function roleCreate(params: RoleCreateParamsType) {
  return request<ResultData<boolean>>(`/auth/role/create`, {
    method: 'POST',
    data: params,
  });
}
/** 删除 */
export async function roleDelete(id: number) {
  return request<ResultData<boolean>>(`/auth/role/delete/${id}`, {
    method: 'DELETE',
  });
}
/** 角色详情 */
export async function roleDetail(
  options?: Record<string, any>,
): Promise<ResultData<RoleDetailType>> {
  return request<ResultData<RoleDetailType>>(`/auth/role/detail/${options?.id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新角色 */
export async function roleUpdate(params: RoleCreateParamsType) {
  return request<ResultData<boolean>>(`/auth/role/update/${params.id}`, {
    method: 'POST',
    data: params,
  });
}
/** 查询功能树 */
// export async function resourceTree(params: any = { state: 'NORMAL' }) {
//   return request<ResultData<ResourceTreeItemType[]>>('${auth}/resource/tree', {
//     method: 'GET',
//     params,
//   });
// }
// /** 查询功能树 */
export async function resourceTree(): Promise<ResultData<ResourceTreeItemType[]>> {
  return request<ResultData<ResourceTreeItemType[]>>(`/auth/resource/menu/userAuthModuleList`, {
    method: 'GET',
  });
}

/** 查询组织树 */
export async function orgQueryTree(options?: Record<string, any>) {
  return request<ResultData<OrgListType[]>>(`/auth/org/query/tree`, {
    method: 'GET',
    ...(options || {}),
  });
}
/** 查询组织树list */
export async function orgQueryTreeList(options?: Record<string, any>) {
  return request<ResultData<OrgListType[]>>(`/auth/org/query/tree/list`, {
    method: 'GET',
    ...(options || {}),
  });
}
/** 分页查询组织 */
export async function orgQueryByPage(
  options?: Record<string, any>,
): Promise<ResultPageData<OrgListPageType>> {
  return request<ResultPageData<OrgListPageType>>(`/auth/org/queryByPage`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新增组织 */
export async function orgCreate(params: OrgCreateParamsType) {
  return request<ResultData<OrgListPageType>>(`/auth/org/create`, {
    method: 'POST',
    data: params,
  });
}

/** 删除组织 */
export async function orgDelete(id?: number) {
  return request<ResultData<boolean>>(`/auth/org/delete/` + id, {
    method: 'GET',
  });
}

/** 更新组织 */
export async function orgUpdate(params: OrgCreateParamsType) {
  return request<ResultData<boolean>>(`/auth/org/update`, {
    method: 'POST',
    data: params,
  });
}

/** A端菜单接口 */
export async function getSaMenu(params?: {
  type?: string;
  systemBid?: string;
}): Promise<ResultData<ResourceTreeItemType[]>> {
  return request<ResultData<ResourceTreeItemType[]>>(`/wps/admin/menu/routes`, {
    method: 'GET',
    params,
  });
}

/**
 * B端菜单接口
 */
export async function getMenu(params?: {
  type?: 'base' | 'verticals';
  systemBid?: string;
}): Promise<ResultData<ResourceTreeItemType[]>> {
  return request<ResultData<ResourceTreeItemType[]>>(`/auth/menu/routes`, {
    method: 'GET',
    params,
  });
}

// B端更新菜单接口
export async function updateResource(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<ResourceTreeItemType>> {
  return request<ResultData<ResourceTreeItemType>>(`/auth/resource/update/${id}`, {
    method: 'PUT',
    data,
  });
}

// B端获取菜单接口详情
export async function getResourceDetail(id: number): Promise<ResultData<ResourceTreeItemType>> {
  return request<ResultData<ResourceTreeItemType>>(`/auth/resource/detail/${id}`, {
    method: 'GET',
  });
}

// B端获取菜单接口详情
export async function getMenuDetail(id: number): Promise<ResultData<ResourceTreeItemType>> {
  return request<ResultData<ResourceTreeItemType>>(`/auth/menu/system/detail/${id}`, {
    method: 'GET',
  });
}

/** 更新模块列表 */
export async function updateMenu(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<ResourceTreeItemType>> {
  return request(`/auth/menu/system/update/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 所属应用 */
export async function resourceApps() {
  return request<ResultData<MealListData[]>>(`/auth/resource/apps `, {
    method: 'GET',
  });
}
export async function sortAuthSystem(data: { id: number }[]): Promise<Result> {
  return request<Result>(`/auth/menu/system/sort`, {
    method: 'PUT',
    data,
  });
}

export async function sortAuthResource(data: { id: number }[]): Promise<Result> {
  return request<Result>(`/auth/resource/sort`, {
    method: 'PUT',
    data,
  });
}

export async function getVerticalsSystem() {
  return request<ResultData<Application[]>>(`/auth/menu/system/verticals`, {
    method: 'GET',
  });
}

/** 操作日志分页查询 */
export async function getOperationLogByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<OperationType>> {
  return request<ResultPageData<OperationType>>(`${base}/auth/mng/audit`, {
    method: 'GET',
    params,
  });
}

/** 操作日志分页查询 */
export async function getOperationDetails(params?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${base}/auth/mng/audit/detail`, {
    method: 'GET',
    params,
  });
}

/** 意见反馈分页查询 */
export async function getFeedbackPage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>>>(`${base}/auth/mng/feedback/page`, {
    method: 'GET',
    params,
  });
}

// 意见反馈详情
export async function getFeedbackDetail(id: number): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${base}/auth/mng/feedback/detail/${id}`, {
    method: 'GET',
  });
}

/** 意见反馈查用户房产 */
export async function getFeedbackUserHousesPage(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>>> {
  return request<ResultPageData<Record<string, any>[]>>(`${base}/auth/mng/feedback/user_houses`, {
    method: 'GET',
    params,
  });
}

/** 可视对讲设备修改编号 */
export async function updateDeviceCode(
  data?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>[]>>(`${base}/auth/mng/device/updateLocation`, {
    method: 'PUT',
    data,
  });
}
