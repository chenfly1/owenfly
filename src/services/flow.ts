import { request } from 'umi';
import { flowOrgData } from './mock';

/** 适用标准请求响应数据场景，消除 code 判断逻辑 */
const simpleReq = <T>(url: any, options: Record<string, any>) => {
  return new Promise<T>((resolve, reject) => {
    request<ResultData<T>>(url, options)
      .then((res) => {
        if (res.code === 'SUCCESS') {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((err) => reject(err));
  });
};

/** 获取租户列表 */
export async function getTenantList(params: any) {
  return simpleReq<ResultPageData<TenantListType>['data']>('/wps/admin/tenant/queryByPage', {
    method: 'GET',
    params,
  });
}

/** 获取表单列表 */
export async function getFormList(params: any) {
  return simpleReq<ResultPageData<FormItemType>['data']>('/flowcenter/formFormInfo/page', {
    method: 'GET',
    params,
  });
}

/** 删除表单 */
export async function removeForm(id: number) {
  return simpleReq<void>('/flowcenter/formFormInfo/delete', {
    method: 'POST',
    data: { ids: [id] },
  });
}

/** 更新表单 */
export async function updateForm(data: any) {
  return simpleReq<FormItemType>('/flowcenter/formFormInfo/saveOrUpdate', {
    method: 'POST',
    data,
  });
}

/** 复制表单 */
export async function copyForm(id: number) {
  return simpleReq<void>(`/flowcenter/formFormInfo/copy/${id}`, {
    method: 'PUT',
  });
}

/** 获取流程列表 */
export async function getFLowList(params: any) {
  return simpleReq<ResultPageData<FlowItemType>['data']>('/flowcenter/flowModelInfo/page', {
    method: 'GET',
    params,
  });
}

/** 删除流程 */
export async function removeFlow(id: number) {
  return simpleReq<void>('/flowcenter/flowModelInfo/delete', {
    method: 'POST',
    data: [id],
  });
}

/** 更新流程 */
export async function updateFlow(data: any) {
  return simpleReq<FlowItemType>('/flowcenter/flowModelInfo/saveOrUpdate', {
    method: 'POST',
    data,
  });
}

/** 保存 bpmnModel */
export async function updateBpmnModel(data: any) {
  return simpleReq<void>('/flowcenter/flow/flowable/bpmn/saveBpmnModel', {
    method: 'POST',
    data,
  });
}

/** 获取流程详情 */
export async function getFlowDetail(params: { id?: string; modelKey?: string }) {
  return simpleReq<FlowItemType>(
    params.id
      ? `/flowcenter/flowModelInfo/detailByModelId/${params.id}`
      : `/flowcenter/flowModelInfo/detailByModelKey/${params.modelKey}`,
    {
      method: 'GET',
    },
  );
}

/** 删除流程 */
export async function deleteFlow(data: any) {
  return simpleReq<void>('/flowcenter/flowModelInfo/delete', {
    method: 'POST',
    data,
  });
}

/** 获取表单详情 */
export async function getFormDetail(params: { id?: string; modelKey?: string }) {
  return simpleReq<FormItemType>(
    params.id
      ? `/flowcenter/formFormInfo/detailById/${params.id}`
      : `/flowcenter/formFormInfo/detailByModelKey/${params.modelKey}`,
    {
      method: 'GET',
    },
  );
}

/** 获取 bpmn 模型详情 */
export async function getBpmnModel(id: string) {
  return simpleReq<BpmnModelType>(`/flowcenter/flow/flowable/bpmn/getBpmnByModelId/${id}`, {
    method: 'GET',
    params: { id },
  });
}

/** 发布 bpmn 模型 */
export async function publishBpmnModel(id: string) {
  return simpleReq<void>(`/flowcenter/flow/flowable/bpmn/publishBpmn/${id}`, {
    method: 'PUT',
  });
}

/** 启动流程 */
export async function startFlow(data: any) {
  return simpleReq<string>(`/flowcenter/auth/flow/start`, {
    method: 'POST',
    data,
  });
}

/** 获取发起流程列表 */
export async function getApplyFlow(params: any) {
  return simpleReq<ResultPageData<FlowInstanceItemType>['data']>(
    '/flowcenter/auth/flow/instance/list',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取待办流程列表 */
export async function getTodoFlow(params: any) {
  return simpleReq<ResultPageData<FlowInstanceItemType>['data']>(
    '/flowcenter/auth/flow/unCompletedList',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取已办流程列表 */
export async function getDoneFlow(params: any) {
  return simpleReq<ResultPageData<FlowInstanceItemType>['data']>(
    '/flowcenter/auth/flow/completedList',
    {
      method: 'GET',
      params,
    },
  );
}

/** 审批通过 */
export async function passFlow(data: any) {
  return simpleReq<any>('/flowcenter/auth/flow/complete', {
    method: 'POST',
    data,
  });
}

/** 审批拒绝 */
export async function rejectFlow(data: any) {
  return simpleReq<any>('/flowcenter/auth/flow/stopProcess', {
    method: 'POST',
    data,
  });
}

/** 获取流程头部信息 */
export async function getFlowInstanceInfo(id: string) {
  return simpleReq<any>(`/flowcenter/auth/flow/baseInfo/${id}`, {
    method: 'GET',
  });
}

/** 获取审批记录列表 */
export async function getFlowHandleHistory(id: string) {
  return simpleReq<any>(`/flowcenter/auth/flow/comment/list/${id}`, {
    method: 'GET',
  });
}

/** 根据流程实例获取表单数据 */
export async function getFlowFormData(id: string) {
  return simpleReq<any>(`/flowcenter/auth/flow/formDataInfo/${id}`, {
    method: 'GET',
  });
}

/** 获取组织人员节点 */
export async function getOrgList(params?: any) {
  return simpleReq<any>(`/flowcenter/base/org/list`, {
    method: 'GET',
    params,
  });
}

/** 获取角色人员节点 */
export async function getRoleList(params?: any) {
  return simpleReq<any>(`/flowcenter/base/role/list`, {
    method: 'GET',
    params,
  });
}

/** 获取人员节点树信息 */
export async function getMemberList(params?: any) {
  return simpleReq<{ code: string; name: string }[]>('/flowcenter/base/person/list', {
    method: 'GET',
    params,
  });
}

/** 获取字典类型数据 */
export async function getDicTypes(params?: any) {
  return simpleReq<DicTypeItemType[]>('/flowcenter/base/dict/type', {
    method: 'GET',
    params,
  });
}

/** 获取字典项数据 */
export async function getDicItems(params?: any) {
  return simpleReq<DicItemType[]>('/flowcenter/base/dict/item', {
    method: 'GET',
    params,
  });
}

/** 转办流程处理 */
export async function transferFlow(data: any) {
  return simpleReq<void>('/flowcenter/auth/flow/transfer', {
    method: 'POST',
    data,
  });
}

/** 获取租户配置 */
export async function getTenantSetting(params: any) {
  return simpleReq<ResultPageData<TenantSettingItemType>['data']>('/flowcenter/tenantConfig/page', {
    method: 'GET',
    params,
  });
}

/** 更新租户配置 */
export async function updateTenatSetting(data: any) {
  return simpleReq<void>('/flowcenter/tenantConfig/saveOrUpdate', {
    method: 'POST',
    data,
  });
}

/** 删除租户配置 */
export async function removeTenatSetting(data: any) {
  return simpleReq<void>('/flowcenter/tenantConfig/delete', {
    method: 'POST',
    data,
  });
}

/** 获取流程配置 */
export async function getFlowSetting(key: string) {
  return simpleReq<FlowSettingType>(`/flowcenter/flowProcessConfig/detail/${key}`, {
    method: 'GET',
  });
}

/** 保存流程配置 */
export async function updateFlowSetting(data: any) {
  return simpleReq<void>('/flowcenter/flowProcessConfig/save', {
    method: 'POST',
    data,
  });
}

/** 获取超时设置 */
export async function getFlowTimeoutSetting(key: string) {
  return simpleReq<FlowTimeoutSettingType>(`/flowcenter/flowTimeOut/detail/${key}`, {
    method: 'GET',
  });
}

/** 保存超时配置 */
export async function updateFlowTimeoutSetting(data: any) {
  return simpleReq<void>('/flowcenter/flowTimeOut/save', {
    method: 'POST',
    data,
  });
}

/** 获取流程详情 */
export async function getFlowInstanceDetail(id: string) {
  return simpleReq<FlowInstanceDetailType>(`/flowcenter/api/processInstance/detail/${id}`, {
    method: 'GET',
  });
}

/** 流程审批 */
export async function handlerFlow(data: any) {
  return simpleReq<void>(`/flowcenter/api/processInstance/operate`, {
    method: 'POST',
    data,
  });
}
