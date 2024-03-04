import { request } from 'umi';

// 管家分页查询

export async function butlerPageQuery(
  options?: Record<string, any>,
): Promise<ResultPageData<butlerPageType>> {
  return request<ResultPageData<butlerPageType>>('/content/auth/mng/steward/page', {
    method: 'GET',
    params: options,
  });
}

//管家删除
export async function deleteHousekeeper(id: number) {
  return request<ResultData<boolean>>(`/content/auth/mng/steward/delete/${id}`, {
    method: 'DELETE',
  });
}

//批量删除
export async function batchDeletion(ids: any) {
  return request<ResultData<boolean>>(`/content/auth/mng/steward/batch_delete`, {
    method: 'POST',
    data: ids,
  });
}

// 管家保存
export async function butlerSave(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/steward/save', {
    method: 'POST',
    data,
  });
}

//管家批量保存
export async function batchSteward(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/steward/batch_save', {
    method: 'POST',
    data,
  });
}

// 管家上线
export async function golive(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/steward/online', {
    method: 'POST',
    data,
  });
}

//管家批量上线

export async function batchGolive(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/steward/batch_online', {
    method: 'POST',
    data,
  });
}

//管家详情
export async function detailedSteward(id: string) {
  return request<ResultData<Housekeeper>>(`/content/auth/mng/steward/detail/${id}`, {
    method: 'GET',
  });
}
