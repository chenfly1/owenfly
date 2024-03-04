import { request } from 'umi';

/** 公司、人员、部门树 */
export async function queryAccountList(data: { pageNo: number; pageSize: number }) {
  return request<ResultData<any[]>>('/wps/admin/account/queryByPage', {
    method: 'GET',
    data,
  });
}
export async function fakeSubmitForm(params: any) {
  return request('/api/advancedForm', {
    method: 'POST',
    data: params,
  });
}
