import { request } from 'umi';

/** 告警列表 */
export async function getAlarmEventPage(data: Record<string, any>) {
  return request<ResultPageData<AlarmEventPageType>>('/monitor/alarmEvent/getAlarmEventPage', {
    method: 'POST',
    data,
  });
}
/** 告警详情 */
export async function getAlarmEventDetail(params: Record<string, any>) {
  return request<ResultData<AlarmEventPageType>>(
    `/monitor/alarmEvent/getAlarmEventDetail/${params.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 删除 */
export async function deleteAlarmEvent(data: Record<string, any>) {
  return request<ResultData<any>>('/monitor/alarmEvent/deleteAlarmEvent', {
    method: 'DELETE',
    data,
  });
}
// 视频取流 包含实时播放、回放
export async function getMediaStream(data: VideoRequestType) {
  return request<ResultData<VideoResultType>>('/monitor/mng/video/getMediaStream', {
    method: 'POST',
    data,
  });
}

// 视频取流 包含实时播放、回放、另外的 token
export async function getMediaStreamH5(data: VideoRequestType, xtoken: string) {
  return request<ResultData<VideoResultType>>('/monitor/mng/video/getMediaStream', {
    method: 'POST',
    data,
    headers: {
      xtoken,
    },
  });
}

// 查询监控概括的空间和设备
export async function getSpaceDevice(data: { spaceId: string }) {
  return request<ResultData<SpaceDeviceType>>('/monitor/monitorOverview/getSpaceDevice', {
    method: 'POST',
    data,
  });
}

// 查询监控概括的空间和设备
export async function getDeviceDetail(params: Record<string, any>) {
  return request<ResultData<DeviceVOListType>>(
    `/monitor/monitorOverview/getDeviceDetail/${params.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
// 修改设备信息
export async function updateDevice(data: Record<string, any>) {
  return request<ResultData<DeviceVOListType>>(`/monitor/monitorOverview/updateDevice`, {
    method: 'PUT',
    data,
  });
}

// 查看设备列表
export async function listDevices(data: Record<string, any>) {
  return request<ResultData<DeviceVOListType[]>>(`/monitor/monitorOverview/listDevices`, {
    method: 'POST',
    data,
  });
}

// 查看设备列表
export async function saveShowToAppDevice(data: Record<string, any>) {
  return request<ResultData<DeviceVOListType[]>>(`/monitor/monitorOverview/saveShowToAppDevice`, {
    method: 'POST',
    data,
  });
}
/** 告警预案分页查询 */
export async function getAlarmPlanPage(data: Record<string, any>) {
  return request<ResultPageData<AlarmPlanPageType>>('/monitor/alarmPlan/getAlarmPlanPage', {
    method: 'POST',
    data,
  });
}
/** 获取告警预案详情 */
export async function getAlarmPlanDetail(params: Record<string, any>) {
  return request<ResultData<AlarmPlanPageType>>(
    `/monitor/alarmPlan/getAlarmPlanDetail/${params.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 新增告警预案 */
export async function addAlarmPlan(data: AddAlarmPlanType) {
  return request<ResultData<any>>(`/monitor/alarmPlan/addAlarmPlan`, {
    method: 'POST',
    data,
  });
}
/** 修改告警预案 */
export async function updateAlarmPlan(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/alarmPlan/updateAlarmPlan`, {
    method: 'PUT',
    data,
  });
}
/** 删除告警预案 */
export async function deleteAlarmPlan(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/alarmPlan/deleteAlarmPlan`, {
    method: 'DELETE',
    data,
  });
}
/** 人脸组分页查询 */
export async function getFaceGroupPage(data: Record<string, any>) {
  return request<ResultPageData<FaceGroupType>>(`/monitor/faceGroup/getFaceGroupPage`, {
    method: 'POST',
    data,
  });
}
/** 获取人脸组详情 */
export async function getFaceGroupDetail(params: Record<string, any>) {
  return request<ResultData<FaceGroupType>>(`/monitor/faceGroup/getFaceGroupDetail/${params.id}`, {
    method: 'GET',
    params,
  });
}
/** 新增人脸组 */
export async function addFaceGroup(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceGroup/addFaceGroup`, {
    method: 'POST',
    data,
  });
}
/** 修改人脸组 */
export async function updateFaceGroup(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceGroup/updateFaceGroup`, {
    method: 'PUT',
    data,
  });
}
/** 删除人脸组 */
export async function deleteFaceGroup(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceGroup/deleteFaceGroup`, {
    method: 'DELETE',
    data,
  });
}
/** 人脸信息表分页查询 */
export async function getFaceInfoPage(data: Record<string, any>) {
  return request<ResultPageData<FaceInfoType>>(`/monitor/faceInfo/getFaceInfoPage`, {
    method: 'POST',
    data,
  });
}
/** 获取人脸信息表详情 */
export async function getFaceInfoDetail(params: Record<string, any>) {
  return request<ResultData<FaceInfoType>>(`/monitor/faceInfo/getFaceInfoDetail/${params.id}`, {
    method: 'GET',
    params,
  });
}
/** 新增人脸信息表 */
export async function addFaceInfo(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceInfo/addFaceInfo`, {
    method: 'POST',
    data,
  });
}
/** 修改人脸信息表 */
export async function updateFaceInfo(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceInfo/updateFaceInfo`, {
    method: 'PUT',
    data,
  });
}
/** 删除人脸信息表 */
export async function deleteFaceInfo(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/faceInfo/deleteFaceInfo`, {
    method: 'DELETE',
    data,
  });
}

/** 布控任务表分页查询 */
export async function getMonitoringTaskPage(data: Record<string, any>) {
  return request<ResultPageData<MonitoringTaskType>>(
    `/monitor/monitoringTask/getMonitoringTaskPage`,
    {
      method: 'POST',
      data,
    },
  );
}
/** 获取布控任务表详情 */
export async function getMonitoringTaskDetail(params: Record<string, any>) {
  return request<ResultData<MonitoringTaskType>>(
    `/monitor/monitoringTask/getMonitoringTaskDetail/${params.id}`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 新增布控任务表 */
export async function addMonitoringTask(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/monitoringTask/addMonitoringTask`, {
    method: 'POST',
    data,
  });
}
/** 修改布控任务表 */
export async function updateMonitoringTask(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/monitoringTask/updateMonitoringTask`, {
    method: 'PUT',
    data,
  });
}
/** 修改布控任务状态 */
export async function updateMonitoringTaskState(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/monitoringTask/update`, {
    method: 'PUT',
    data,
  });
}
/** 删除布控任务表 */
export async function deleteMonitoringTask(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/monitoringTask/deleteMonitoringTask`, {
    method: 'DELETE',
    data,
  });
}
/** 图片检索-人脸组 */
export async function intelligentfaceGroup(data: Record<string, any>) {
  return request<ResultData<FaceIntelligentGroupType[]>>(
    `/monitor/intelligentRetrieval/search/faceGroup`,
    {
      method: 'POST',
      data,
    },
  );
}
/** 图片检索-抓拍库 */
export async function intelligentRetrievalCapture(data: Record<string, any>) {
  return request<ResultData<FaceIntelligentType[]>>(
    `/monitor/intelligentRetrieval/search/capture`,
    {
      method: 'POST',
      data,
    },
  );
}
/** 云台控制 */
export async function ptzsControl(data: { deviceId: string; command: CommandType }) {
  return request<ResultData<FaceIntelligentType[]>>(`/monitor/camera/ptzsControl`, {
    method: 'POST',
    data,
  });
}
/** 设备类型 */
export async function autoUpdateDeviceType(data: Record<string, any>) {
  return request<ResultData<Record<string, any>>>(`/monitor/monitorOverview/autoUpdateDeviceType`, {
    method: 'PUT',
    data,
  });
}
/** 生成推文 */
export async function businessContentPush(data: Record<string, any>) {
  return request<ResultData<Record<string, any>>>(`/monitor/business/content/push`, {
    method: 'POST',
    data,
  });
}
/** 获取项目平台配置详情 */
export async function getProjectBrandConfigDetail(params?: Record<string, any>) {
  return request<ResultData<ProjectBrandConfigDetailType>>(
    `/monitor/brandConfig/getProjectBrandConfigDetail`,
    {
      method: 'GET',
      params,
    },
  );
}
/** 新增项目平台配置 */
export async function addBrandConfig(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/brandConfig/addBrandConfig`, {
    method: 'POST',
    data,
  });
}
/** 修改项目平台配置 */
export async function updateBrandConfig(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/brandConfig/updateBrandConfig`, {
    method: 'PUT',
    data,
  });
}
/** 事件类型配置分页查询 */
export async function listEventTypeConfig(data?: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/eventTypeConfig/listEventTypeConfig`, {
    method: 'POST',
    data,
  });
}
/** 批量保存事件类型配置 */
export async function eventTypeConfigBatchSava(data: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/eventTypeConfig/batchSava`, {
    method: 'POST',
    data,
  });
}
/** 事件类型分页查询 */
export async function listEventType(data?: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/eventType/listEventType`, {
    method: 'POST',
    data,
  });
}
/** 事件类型全部类型 */
export async function listAllEventType(params?: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/eventType/listAllEventType`, {
    method: 'GET',
    params,
  });
}
/** 检查IP地址 */
export async function checkAddress(data?: Record<string, any>) {
  return request<ResultData<any>>(`/monitor/brandConfig/checkAddress`, {
    method: 'PUT',
    data,
  });
}
