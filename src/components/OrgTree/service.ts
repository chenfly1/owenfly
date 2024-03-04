import { request } from 'umi';
import type { TreeNodeType } from './data';

/** 查询组织树 */
export async function getTreeData(options?: Record<string, any>) {
  return request<ResultData<TreeNodeType[]>>('/auth/org/query/tree/list', {
    method: 'GET',
    ...(options || {}),
  });
}
