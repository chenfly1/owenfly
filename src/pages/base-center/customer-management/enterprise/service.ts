import { request } from 'umi';
import type { TableItem } from './data.d';

//获取表格数据
export async function getTableDate(params: any) {
  params.pageNo = params.current;
  const res = await request<ResultPageData<TableItem>>('/auth/user/queryByPage', {
    method: 'GET',
    params,
  });
  return {
    data: res.data.items,
    success: res.code === 'SUCCESS' ? true : false,
    total: res.data.page.totalItems,
  };
}
