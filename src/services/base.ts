import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const base = HIDE_GETEWAY ? '' : '/base';

/** 员工分页查询列表 */
export async function getQueryStaff(
  options?: Record<string, any>,
): Promise<ResultPageData<staffType>> {
  return request<ResultPageData<staffType>>('/staff/mng/staff', {
    method: 'GET',
    params: options,
  });
}

/** 获取员工详情 */
export async function getStaffDetails(id: string): Promise<ResultData<staffType>> {
  return request<ResultData<staffType>>(`/staff/mng/staff/${id}`, {
    method: 'GET',
  });
}

/** 同步员工数据 */
export async function getStaffSync(params: Record<string, any>): Promise<ResultData<staffType>> {
  return request<ResultData<staffType>>(`/staff/mng/staff/sync`, {
    method: 'GET',
    params,
  });
}

/** 查询空间树当前节点的所有父节点 */
export async function getPhysicalSpaceParents(
  params: Record<string, any>,
): Promise<ResultData<TreeNodeType[]>> {
  return request<ResultData<TreeNodeType[]>>(`${base}/auth/space/physical_space/parents`, {
    method: 'GET',
    params,
  });
}

/**通过项目，查询整个组织机构数据 */
export async function getOrganizationTree(
  params: Record<string, any>,
): Promise<ResultData<staffType>> {
  return request<ResultData<staffType>>(`/staff/mng/organization/tree`, {
    method: 'GET',
    params,
  });
}

/**给员工开通账号 */
export async function createAccount(data: Record<string, any>): Promise<ResultData<staffType>> {
  return request<ResultData<staffType>>(`/staff/mng/staff/createAccount`, {
    method: 'POST',
    data,
  });
}

/** 新建部门 */
export async function addStaffOrg(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/organization`, {
    method: 'POST',
    data,
  });
}
/** 根据组织Id删除组织机构 */
export async function deleteStaffOrg(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/organization/${data.id}`, {
    method: 'DELETE',
    data,
  });
}
/** 修改组织机构 */
export async function updateStaffOrg(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/organization`, {
    method: 'PUT',
    data,
  });
}
/** 新建员工 */
export async function addStaff(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/staff`, {
    method: 'POST',
    data,
  });
}
/** 删除员工 */
export async function deleteStaff(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/staff/${data.id}`, {
    method: 'DELETE',
    data,
  });
}
/** 修改员工 */
export async function updateStaff(data: Record<string, any>) {
  return request<ResultData<void>>(`/staff/mng/staff`, {
    method: 'PUT',
    data,
  });
}
/** 导入组织数据 */
export async function importExlDp(params: Record<string, any>) {
  return request<ResultData<Record<string, any>>>(`/staff/mng/organization/import`, {
    method: 'POST',
    params,
  });
}

/** 导入员工数据 */
export async function importExlStaff(params: Record<string, any>) {
  return request<ResultData<Record<string, any>>>(`/staff/mng/staff/import`, {
    method: 'POST',
    params,
  });
}
