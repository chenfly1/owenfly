import { request } from 'umi';
import type { TreeNodeType } from './data.d';

/** 空间树 */
export async function getSpaceTreeList(
  params: Record<string, any>,
): Promise<ResultData<TreeNodeType[]>> {
  return request<ResultData<TreeNodeType[]>>(`/base/space/physical_space`, {
    method: 'GET',
    params,
  });
}

/** 查询空间树 */
export async function getPhysicalSpaceTree(
  params: Record<string, any>,
): Promise<ResultData<TreeNodeType[]>> {
  return request<ResultData<TreeNodeType[]>>(`/base/auth/space/physical_space/tree`, {
    method: 'GET',
    params,
  });
}

// 查看安防空间树
export async function getMonitoringSpaceTree(
  params: Record<string, any>,
): Promise<ResultData<TreeNodeType[]>> {
  return request<ResultData<TreeNodeType[]>>(`/monitor/business/getSpaceTree`, {
    method: 'GET',
    params,
  });
}
