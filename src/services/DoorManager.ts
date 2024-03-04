/*
 * @Author: mhf
 * @Date: 2023-02-14 09:54:33
 * @description:
 */
import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const door = HIDE_GETEWAY ? '' : '/door';

/** 分页通行区域列表 */
export async function getAreaListByPage(
  options?: Record<string, any>,
): Promise<ResultPageData<areaListType>> {
  return request<ResultPageData<areaListType>>(`${door}/auth/door/passing_area/page`, {
    method: 'GET',
    params: options,
  });
}

/** 根据通行区域id获取设备列表 */
export async function getDeviceListByAreaId(
  passingAreaId: number,
): Promise<ResultData<devicesListType[]>> {
  return request<ResultData<devicesListType[]>>(
    `${door}/auth/door/passing_area/device_list/${passingAreaId}`,
    {
      method: 'GET',
    },
  );
}

/** 通行区域名称判断是否重复的接口 */
export async function repeatedJudgment(
  options?: Record<string, any>,
): Promise<ResultData<boolean>> {
  return request<ResultData<boolean>>(`${door}/auth/door/passing_area/name/repeated_judgment`, {
    method: 'GET',
    params: options,
  });
}

/** 判断设备是否已被关联的接口 */
export async function deviceIsAssociated(
  options?: Record<string, any>,
): Promise<ResultData<boolean>> {
  return request<ResultData<boolean>>(`${door}/auth/door/passing_area/device/is_associated`, {
    method: 'GET',
    params: options,
  });
}

/** 新增通行区域 */
export async function addPassingArea(params: Record<string, any>): Promise<ResultData<number>> {
  return request<ResultData<number>>(`${door}/auth/door/passing_area/add`, {
    method: 'POST',
    data: params,
  });
}

/** 编辑通行区域_人员 */
export async function editUserPassingArea(params: Record<string, any>) {
  return request(`${door}/auth/door/passing_area/user/edit`, {
    method: 'PUT',
    data: params,
  });
}

/** 删除通行区域_人员 */
export async function delUserPassingArea(id: number): Promise<ResultData<areaListType>> {
  return request<ResultData<areaListType>>(`${door}/auth/door/passing_area/user/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 编辑通行区域_访客 */
export async function editVisitorPassingArea(params: Record<string, any>) {
  return request(`${door}/auth/door/passing_area/visitor/edit`, {
    method: 'PUT',
    data: params,
  });
}

/** 删除通行区域_人员 */
export async function delVisitorPassingArea(id: number) {
  return request(`${door}/auth/door/passing_area/visitor/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 根据通行区域id获取区域详情 */
export async function getPassingAreaById(passingAreaId: number) {
  return request<ResultData<{ deviceVoList: devicesListType[]; spaceIds: string[] }>>(
    `${door}/auth/door/passing_area/detail/${passingAreaId}`,
    {
      method: 'GET',
    },
  );
}
