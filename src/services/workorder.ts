import { request } from 'umi';

// 工单分页查询
export async function workOrderQuery(
  params: Record<string, any>,
): Promise<ResultPageData<WorkOrderType>> {
  return request<ResultPageData<WorkOrderType>>('/workorder/mng/workorder/getWorkorderPage', {
    method: 'GET',
    params,
  });
}

// 新增工单
export async function addWorkOrder(data: Record<string, any>): Promise<Result> {
  return request<Result>('/workorder/mng/workorder/addWorkorder', {
    method: 'POST',
    data,
  });
}

// 获取详情列表
export async function detailedList(id: string) {
  return request<ResultData<WorkOrderType>>(`/workorder/mng/workorder/getWorkorderDetail/${id}`, {
    method: 'GET',
  });
}

//字典分组列表
export async function dictionaryGroupList() {
  return request<ResultData<Group>>(`/workorder/resource/param/options/group`, {
    method: 'GET',
  });
}
// 字典列表
export async function dictionaryList(groupCode: string) {
  return request<ResultData<WorkOrderSource>>(`/workorder/resource/param/options/${groupCode}`, {
    method: 'GET',
  });
}

// 工单类型树结构查询
export async function ticketType(params: Record<string, any>): Promise<ResultData<Category>> {
  return request<ResultData<Category>>(
    '/workorder/mng/workorderCategory/getWorkorderCategoryTree',
    {
      method: 'GET',
      params,
    },
  );
}

// 操作工单
export async function operationWorkOrder(data: Record<string, any>): Promise<Result> {
  return request<Result>('/workorder/mng/workorder/operateWorkOrder', {
    method: 'POST',
    data,
  });
}

// 工单类型-用户关系表分页查询
export async function workUserQuery() {
  return request<ResultData<DataType | any>>(
    `/workorder/mng/workorderCategoryUserRef/getWorkorderCategoryUserRefPage`,
    {
      method: 'GET',
    },
  );
}

// 工单类型-用户关系表分页查询
export async function workUserQueryA(params: Record<string, any>): Promise<ResultData<DataType>> {
  return request<ResultData<DataType>>(
    '/workorder/mng/workorderCategoryUserRef/getWorkorderCategoryUserRefPage',
    {
      method: 'GET',
      params,
    },
  );
}

// 删除工单类型-用户关系表
export async function userWorkUserDelete(ids: any) {
  return request<ResultData<boolean>>(
    `/workorder/mng/workorderCategoryUserRef/deleteWorkorderCategoryUserRef`,
    {
      method: 'DELETE',
      data: ids,
    },
  );
}

// 修改按类别定制
export async function modifyCustomizeByCategory(params: Record<string, any>) {
  return request('/workorder/mng/workorderCategory/updateCustomUser', {
    method: 'PUT',
    data: params,
  });
}

//查询项目下的所有账号信息
export async function allUse(params: Record<string, any>): Promise<ResultData<DataType>> {
  return request<ResultData<any>>('/security/auth/account/project/list', {
    method: 'GET',
    params,
  });
}

// 新增工单类型-用户关系表
export async function addUser(data: Record<string, any>): Promise<Result> {
  return request<Result>(
    '/workorder/mng/workorderCategoryUserRef/addWorkorderCategoryUserRefList',
    {
      method: 'POST',
      data,
    },
  );
}

// 获取详情列表
export async function getWorkorderCategoryDetail(id: string, projectId: string) {
  return request<ResultData<WorkOrderType>>(
    `/workorder/mng/workorderCategory/getWorkorderCategoryDetail/${id}?projectId=${projectId}`,
    {
      method: 'GET',
    },
  );
}

// 工单类型列表查询
export async function getWorkorderCategoryList(params: Record<string, any>) {
  return request<ResultData<WorkOrderType>>(
    `/workorder/mng/workorderCategory/getWorkorderCategoryList`,
    {
      method: 'GET',
      params,
    },
  );
}
