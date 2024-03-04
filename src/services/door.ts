import { request } from 'umi';
const { HIDE_GETEWAY } = process.env;

const door = HIDE_GETEWAY ? '' : '/door';
/** 分页查询设备列表 */
export async function getDevicePage(
  options?: Record<string, any>,
): Promise<ResultPageData<devicesListType>> {
  return request<ResultPageData<devicesListType>>(`${door}/auth/door/device/page`, {
    method: 'GET',
    params: options,
  });
}
/** 分页查询统一授权用户 */
export async function doorUserPage(
  options?: Record<string, any>,
): Promise<ResultPageData<DoorUserListType>> {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/user/page`, {
    method: 'GET',
    ...(options || {}),
  });
}
// 保存或者更新
export async function doorUserSave(params: DoorUserListType) {
  return request<ResultData<DoorUserListType>>(`${door}/auth/door/user/save`, {
    method: 'POST',
    data: params,
  });
}

/** 删除用户 */
export async function doorUserDelete(id?: string) {
  return request<ResultData<boolean>>(`${door}/auth/door/user/delete`, {
    method: 'DELETE',
    params: { id },
  });
}
// 用户详情
export async function doorUserDetail(id?: string): Promise<ResultData<DoorUserListType>> {
  return request<ResultData<DoorUserListType>>(`${door}/auth/door/user/detail`, {
    method: 'GET',
    params: { id },
  });
}
// 分页查询人脸授权用户
export async function doorFacePage(
  options?: Record<string, any>,
): Promise<ResultPageData<DoorFaceListType>> {
  return request<ResultPageData<DoorFaceListType>>(`${door}/auth/door/face/page`, {
    method: 'GET',
    ...(options || {}),
  });
}
/** 删除人脸 */
export async function doorFaceDelete(id?: string) {
  return request<ResultData<boolean>>(`${door}/auth/door/face/delete`, {
    method: 'DELETE',
    params: { id },
  });
}
// 授权结果
export async function doorFaceDownLog(id: string): Promise<ResultData<FaceDownLogType[]>> {
  return request<ResultData<FaceDownLogType[]>>(`${door}/auth/door/face/down_log`, {
    method: 'GET',
    params: { id },
  });
}

// 访客通行记录
export async function vistorRecordPage(
  params?: Record<string, any>,
): Promise<ResultPageData<visitPassItem>> {
  return request<ResultPageData<visitPassItem>>(`${door}/auth/visitor/access_record/list`, {
    method: 'GET',
    params,
  });
}

// 访客通行详情
export async function visitPassDetail(id: number) {
  return request<ResultData<visitPassItem>>(`${door}/auth/visitor/access_record/${id}`, {
    method: 'GET',
  });
}

// 人员通行记录
export async function accessRecordPage(
  params?: Record<string, any>,
): Promise<ResultPageData<AccessRecordType>> {
  return request<ResultPageData<AccessRecordType>>(`${door}/auth/door/access_record/page`, {
    method: 'GET',
    params,
  });
}
// 通行记录详情
export async function accessRecordDetail(id?: string): Promise<ResultData<AccessRecordType>> {
  return request<ResultData<AccessRecordType>>(`${door}/auth/door/access_record/detail`, {
    method: 'GET',
    params: { id },
  });
}

// 批量授权保存或者更新
export async function doorUserBatchSave(data: DoorUserListType[]) {
  return request<ResultData<DoorUserListType>>(`${door}/auth/door/user/batch_save`, {
    method: 'POST',
    data,
  });
}

// 批量 删除人员
export async function doorUserBatchDelete(ids: React.Key[]) {
  return request<ResultData<boolean>>(`${door}/auth/door/user/batch_delete`, {
    method: 'DELETE',
    data: ids,
  });
}

// 批量重发 -- 下发与取消授权失败的重发
export async function doorFaceRebatchDown(data: Record<string, any>[]) {
  return request<ResultData<boolean>>(`${door}/auth/door/face/re_batch_down`, {
    method: 'POST',
    data,
  });
}

export async function downloadTemplate(params: DownloadTemplateParam) {
  return request<ResultData<DownloadTemplate>>(
    `${door}/auth/door/import_template/downloadTemplate`,
    {
      method: 'GET',
      params,
    },
  );
}

export async function getImportMainDataFileList(
  params: Record<string, any>,
): Promise<ResultPageData<ImportMainDataFileList>> {
  return request(`${door}/auth/door/excel/user_record`, {
    method: 'GET',
    params,
  });
}

export async function importMainDataVerifiction(data: string) {
  return request<ResultData<userCheckResultType>>(`${door}/auth/door/excel/user_check_url`, {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
export async function importMainData(data: string) {
  return request<ResultData<userCheckResultType>>(`${door}/auth/door/excel/user_import_url`, {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function getMainDataErroFile(params: any) {
  return request(`${door}/auth/door/excel/user_write`, {
    method: 'GET',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    responseType: 'blob',
  });
}

// IC设备配置
export async function saveDeviceConfig(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/device_config/save`, {
    method: 'POST',
    data,
  });
}

// 查看IC设备配置
export async function queryDeviceConfig(): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/door/device_config/detail`, {
    method: 'GET',
  });
}

/** 分页查询物业公告 */
export async function getAnnouncementByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<AnnouncementType>> {
  return request<ResultPageData<AnnouncementType>>(`${door}/auth/door/announcement/page`, {
    method: 'GET',
    params,
  });
}

/** 新增物业公告 */
export async function saveAnnouncement(params: Record<string, any>) {
  return request<ResultData<AnnouncementType>>(`${door}/auth/door/announcement/save `, {
    method: 'POST',
    data: params,
  });
}

/** 物业公告详情 */
export async function getAnnouncement(id: string) {
  return request<ResultData<AnnouncementType>>(`${door}/auth/door/announcement/detail/${id}`, {
    method: 'GET',
  });
}

/** 删除 */
export async function deleteAnnouncement(id: number) {
  return request<ResultData<boolean>>(`${door}/auth/door/announcement/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 分页查询报警记录 */
export async function getWornLogByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<WornLogType>> {
  return request<ResultPageData<WornLogType>>(`${door}/auth/door/worn_log/page`, {
    method: 'GET',
    params,
  });
}

/** 报警类型 */
export async function getWornTypeList(
  params?: Record<string, any>,
): Promise<ResultData<{ code: string; name: string }[]>> {
  return request<ResultData<{ code: string; name: string }[]>>(
    `${door}/auth/common/alarm_type/list`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 分页对讲记录 */
export async function getTalkBackLogByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<TlakbackLogType>> {
  return request<ResultPageData<TlakbackLogType>>(`${door}/auth/door/talkbackRecord/page`, {
    method: 'GET',
    params,
  });
}

/** 部门与通行区域关联列表 */
export async function getpassingAreaOrgByList(
  params?: Record<string, any>,
): Promise<ResultData<passingAreaOrgType>> {
  return request<ResultData<passingAreaOrgType>>(
    `${door}/auth/door/passing_area_organization_link/list`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 分页查询 部门与通行区域关联列表 */
export async function getpassingAreaOrgByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<passingAreaOrgType>> {
  return request<ResultPageData<passingAreaOrgType>>(
    `${door}/auth/door/organization_passing_area_link/page`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 新增 部门与通行区域关联(按部门授权) */
export async function saveOrgPassingArea(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/organization_passing_area_link/save`, {
    method: 'POST',
    data,
  });
}

/** 删除 部门与通行区域关联(按部门授权)*/
export async function delOrgPassingArea(
  params?: Record<string, any>,
): Promise<ResultData<passingAreaOrgType[]>> {
  return request<ResultData<passingAreaOrgType[]>>(
    `${door}/auth/door/organization_passing_area_link/delete`,
    {
      method: 'DELETE',
      params,
    },
  );
}

/** 分页查询 空间与通行区域关联(按产权授权) 列表*/
export async function querySpacePassingAreaByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<passingAreaOrgType>> {
  return request<ResultPageData<passingAreaOrgType>>(
    `${door}/auth/door/space_passing_area_link/page`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 查询 空间与通行区域关联(按产权授权) 列表*/
export async function querySpacePassingAreaList(
  params?: Record<string, any>,
): Promise<ResultData<passingAreaOrgType[]>> {
  return request<ResultData<passingAreaOrgType[]>>(
    `${door}/auth/door/space_passing_area_link/list`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 删除 空间与通行区域关联(按产权授权)*/
export async function delSpacePassingArea(
  params?: Record<string, any>,
): Promise<ResultData<passingAreaOrgType[]>> {
  return request<ResultData<passingAreaOrgType[]>>(
    `${door}/auth/door/space_passing_area_link/delete`,
    {
      method: 'DELETE',
      params,
    },
  );
}

/** 新增 空间与通行区域关联(按产权授权) */
export async function saveSpacePassingArea(
  data?: Record<string, any>,
): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/space_passing_area_link/save`, {
    method: 'POST',
    data,
  });
}

/** 分页查询 按人员授权列表*/
export async function queryUserByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<DoorUserListType>> {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/user/page`, {
    method: 'GET',
    params,
  });
}

/** 新增通行区域_人员 */
export async function addPassingArea(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/passing_area/add`, {
    method: 'POST',
    data,
  });
}

/** 查看通行区域_人员详情 */
export async function getPassingAreaDetails(id?: string): Promise<ResultData<DoorUserListType>> {
  return request<ResultData<DoorUserListType>>(`${door}/auth/door/user/detail`, {
    method: 'GET',
    params: { id },
  });
}

/** 编辑通行区域_人员 */
export async function editUserPassingArea(data?: Record<string, any>) {
  return request(`${door}/auth/door/passing_area/user/edit`, {
    method: 'PUT',
    data,
  });
}

/** 编辑通行区域_访客 */
export async function editVisitorPassingArea(data?: Record<string, any>) {
  return request(`${door}/auth/door/passing_area/visitor/edit`, {
    method: 'PUT',
    data,
  });
}

/** 新增/编辑人员 */
export async function addPassingUser(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/user/save`, {
    method: 'POST',
    data,
  });
}

// 写卡参数转16进制
export async function protocoltransition(data?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/door/card/protocol_transition`, {
    method: 'POST',
    data,
  });
}

// 读卡参数16进制转十进制
export async function protocoltransitionRead(data?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/door/card/protocol_transition/read`, {
    method: 'POST',
    data,
  });
}

/** 查看IC卡详情 */
export async function getICcardDetails(params?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/door/card/detail`, {
    method: 'GET',
    params,
  });
}

/** 分页查询 门禁梯控设备、可视化对接设备列表*/
export async function queryDoorDeviceByPage(
  params?: Record<string, any>,
): Promise<ResultPageData<devicesListType>> {
  return request<ResultPageData<devicesListType>>(`${door}/auth/door/device/page`, {
    method: 'GET',
    params,
  });
}

// 访客邀约新增
export async function addVisitor(data?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/visitor/add `, {
    method: 'POST',
    data,
  });
}

// 访客邀约时间校验
export async function repeatVisitor(params?: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>(`${door}/auth/visitor/repeat_appointment`, {
    method: 'GET',
    params,
  });
}

// 访客邀约分页查询
export async function visitApplyByPage(params: any) {
  return request<ResultPageData<visitApplyItem>>(`${door}/auth/visitor/list`, {
    method: 'GET',
    params,
  });
}

// 访客邀约详情
export async function visitApplyDetail(uuid: string) {
  return request<ResultData<visitApplyItem>>(`${door}/auth/visitor/${uuid}`, {
    method: 'GET',
  });
}

// 设置设备机号
export async function setDeviceNo(data: Record<string, any>) {
  return request<ResultData<string>>(`${door}/auth/door/device_config/set_device_no`, {
    method: 'POST',
    data,
  });
}

// 设备配置 重新下发
export async function redownDeviceConfig(params: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/device_config/redown`, {
    method: 'GET',
    params,
  });
}

// 根据通行区域获取机号
export async function getDevicenos(params: Record<string, any>) {
  return request<ResultData<number[]>>(`${door}/auth/door/card/passingareaids/get_devicenos`, {
    method: 'GET',
    params,
  });
}

// 保存ic卡授权信息
export async function icSave(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/ic_save`, {
    method: 'POST',
    data,
  });
}

// 凭证下发分页查询
export async function queryCertificatePage(params: any) {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/user/certificate/page`, {
    method: 'GET',
    params,
  });
}

// ic卡批量拉黑
export async function icLose(data?: any[]): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/batch_ic_lose`, {
    method: 'POST',
    data,
  });
}

// ic卡批量解挂
export async function icCancelLose(data?: any[]): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/batch_ic_cancle_lose`, {
    method: 'POST',
    data,
  });
}

// id卡是否被使用
export async function idCardCheck(params?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/id_check`, {
    method: 'GET',
    params,
  });
}

// id卡删除
export async function idCardDel(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/id_del`, {
    method: 'POST',
    data,
  });
}

// 人脸删除
export async function facePassDel(params?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/face/delete`, {
    method: 'DELETE',
    params,
  });
}

// 批量上传人脸
export async function faceBatchUpload(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/face/batch_upload`, {
    method: 'POST',
    data,
  });
}

// 人脸下发结果
export async function queryFaceDownResultPage(
  params?: Record<string, any>,
): Promise<ResultPageData<DoorUserListType>> {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/face/down_result_page`, {
    method: 'GET',
    params,
  });
}

// 人脸下发结果数量统计
export async function queryFaceDownResultCount(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${door}/auth/door/face/down_result_count`, {
    method: 'GET',
    params,
  });
}

// IC卡黑名单下发结果
export async function queryICDownResultPage(
  params?: Record<string, any>,
): Promise<ResultPageData<DoorUserListType>> {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/card/ic_down_result_page`, {
    method: 'GET',
    params,
  });
}

// IC卡黑名单下发结果数量统计
export async function queryICDownResultCound(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${door}/auth/door/card/ic_down_result_count`, {
    method: 'GET',
    params,
  });
}

// ID卡号下发结果
export async function queryIDDownResultPage(
  params?: Record<string, any>,
): Promise<ResultPageData<DoorUserListType>> {
  return request<ResultPageData<DoorUserListType>>(`${door}/auth/door/card/id_down_result_page`, {
    method: 'GET',
    params,
  });
}

// ID卡号下发结果数量统计
export async function queryIDDownResultCound(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>>> {
  return request<ResultData<Record<string, any>>>(`${door}/auth/door/card/id_down_result_count`, {
    method: 'GET',
    params,
  });
}

// 重新下发人脸
export async function reSendBatchDown(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/face/re_batch_down`, {
    method: 'POST',
    data,
  });
}

// 重新下发IC黑名单
export async function reSendICBatchDown(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/re_batch_down_ic`, {
    method: 'POST',
    data,
  });
}

// 重新下发ID卡号
export async function reSendIDBatchDown(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/card/re_batch_down_id`, {
    method: 'POST',
    data,
  });
}

// 编辑设备进出口
export async function editDevice(data?: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${door}/auth/door/device/edit_device `, {
    method: 'POST',
    data,
  });
}

// 根据人查通行区域
export async function getPassingAreaByUser(
  userId: string,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(
    `${door}/auth/door/passing_area/list/${userId}`,
    {
      method: 'GET',
    },
  );
}

// 根据通行区域id获取梯控设备列表 注：带楼层信息
export async function getLiftDeviceList(
  params?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`${door}/auth/door/device/lift_device_list`, {
    method: 'GET',
    params,
  });
}

// 凭证下发查看历史下发记录
export async function getCertificateHistory(
  params?: Record<string, any>,
): Promise<ResultPageData<Record<string, any>[]>> {
  return request<ResultPageData<Record<string, any>[]>>(
    `${door}/auth/door/user/certificate/history`,
    {
      method: 'GET',
      params,
    },
  );
}

// 远程开门
export async function openRemote(
  data?: Record<string, any>,
): Promise<ResultData<Record<string, any>[]>> {
  return request<ResultData<Record<string, any>[]>>(`${door}/auth/door/device/remote/open`, {
    method: 'POST',
    data,
  });
}

// 周期保存
export async function periodSave(data: Record<string, any>) {
  return request<ResultData<string>>(`${door}/auth/door/period/save`, {
    method: 'POST',
    data,
  });
}

// 周期分页查询
export async function queryPeriodpage(params: Record<string, any>) {
  return request<ResultPageData<PeriodType>>(`${door}/auth/door/period/page`, {
    method: 'get',
    params,
  });
}

// 周期详情查询
export async function getPeriodDetails(id: string) {
  return request<ResultPageData<PeriodType>>(`${door}/auth/door/period/detail/${id}`, {
    method: 'get',
  });
}

// 周期列表查询
export async function queryPeriodList() {
  return request<ResultData<PeriodType[]>>(`${door}/auth/door/period/list`, {
    method: 'get',
  });
}

// 周期列表查询
export async function delPeriod(id: number) {
  return request<ResultData<string>>(`${door}/auth/door/period/delete/${id}`, {
    method: 'DELETE',
  });
}
