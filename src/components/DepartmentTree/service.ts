import { request } from 'umi';
import type { TreeNodeType } from './data.d';

/** 部门组织树 */
export async function getStaffTree(
  params: Record<string, any>,
): Promise<ResultData<TreeNodeType[]>> {
  return request<ResultData<TreeNodeType[]>>(`/staff/mng/organization/tree`, {
    method: 'GET',
    params,
  });
}
