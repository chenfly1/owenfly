import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const security = HIDE_GETEWAY ? '' : '/security';

/** 查询项目树列表 */
export async function projectTreeList(params: Record<string, any>) {
  return request<ResultData<ProjectTreeType[]>>(`${security}/projects/tree/list`, {
    method: 'POST',
    data: params,
  });
}

/** 切换B端项目 */
export async function peojectSwitch(data: { projectBid: string }) {
  return request<ResultData<ProjectListType>>(`${security}/auth/projects/switch`, {
    method: 'POST',
    data,
  });
}

/** 查询B端项目 */
export async function peojectCurrent() {
  return request<ResultData<ProjectListType>>(`${security}/auth/projects/current`, {
    method: 'GET',
  });
}

/** 换绑用户手机号 */
export async function userPhoneUpdate(params: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/auth/account/update/phone/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}
/** 重置密码 */
export async function passwordUpdate(params: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/auth/account/reset/password`, {
    method: 'PUT',
    data: params,
  });
}
/** 更新用户信息 */
export async function usersUpdate(params: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/auth/users/update/${params.id}`, {
    method: 'POST',
    data: params,
  });
}
/** 身份验证，换绑手机使用 */
export async function checkAuthAccount(params: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/auth/account/auth_account`, {
    method: 'POST',
    data: params,
  });
}
/** 通过组织id集合，查询项目Id */
export async function getProjectIdsByOrg(
  params: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`${security}/projects/list_by_org`, {
    method: 'GET',
    params,
  });
}
