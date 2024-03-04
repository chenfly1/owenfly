import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const base = HIDE_GETEWAY ? '' : '/base';

/** 空间数据列表 */
export async function getSpaceList(
  params: Record<string, any>,
): Promise<ResultData<SpaceListType[]>> {
  return request<ResultData<SpaceListType[]>>(`${base}/space/physical_space/list`, {
    method: 'GET',
    params,
  });
}

/** 公共区域列表 */
export async function getTreelist(
  params: Record<string, any>,
): Promise<ResultData<SpaceListType[]>> {
  return request<ResultData<SpaceListType[]>>(`${base}/space/physical_space/treelist`, {
    method: 'GET',
    params,
  });
}

/** 新增公共区域 */
export async function addPublicArea(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/space/physical_space`, {
    method: 'POST',
    data,
  });
}

/** 修改公共区域 */
export async function updatePublicArea(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/space/physical_space/update/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除公共区域 */
export async function delPublicArea(id: number): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/space/physical_space/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 删除全部公共区域 */
export async function delAllPublicArea(bid: string): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/space/physical_space/project/delete/${bid}`, {
    method: 'DELETE',
  });
}

/** 上传图纸 */
export async function spaceUploadImage(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/space/physical_space/upload`, {
    method: 'POST',
    data,
  });
}

/** 分页查询物理空间 */
export async function getPhysicalSpaceList(
  params: Record<string, any>,
): Promise<ResultPageData<SpacePhysicalType>> {
  return request<ResultPageData<SpacePhysicalType>>(
    `${base}/auth/space/physical_space/queryByPage`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 创建空间 */
export async function createSpace(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/space/physical_space`, {
    method: 'POST',
    data,
  });
}

/** 批量新建空间 */
export async function batchCreateSpace(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/space/physical_space/batchCreate`, {
    method: 'POST',
    data,
  });
}

/** 批量新建空间 */
export async function batchCreateSpaceV2(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/space/physical_space/v2/batchCreate`, {
    method: 'POST',
    data,
  });
}

/** 更新物理空间 */
export async function updateSpace(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${base}/auth/space/physical_space/update/${data.id}`, {
    method: 'PUT',
    data,
  });
}
/** 删除当前空间及其子空间 */
export async function deleteSpace(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<any>>(`${base}/auth/space/physical_space/delete/${data.id}`, {
    method: 'DELETE',
  });
}

/** 导入物理空间 */
export async function importPhysicalSpace(params: Record<string, any>) {
  return request<ResultData<ImportPhysicalSpaceType>>(`${base}/auth/space/physical_space/import`, {
    method: 'POST',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/** 导入绑定 */
export async function importBind(params: Record<string, any>) {
  return request<ResultData<ImportPhysicalSpaceType>>(
    `/masdata/mng/property_space/bind/import/bind`,
    {
      method: 'POST',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
}

/** 空间-产权绑定列表 */
export async function getPropertySpaceList(data: Record<string, any>) {
  return request<ResultPageData<PropertySpaceType[]>>(
    `/masdata/mng/property_space/bind/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 空间-产权绑定自动绑定 */
export async function autoBindPropertySpace(data: Record<string, any>) {
  return request<ResultData<AutoBindPropertySpace>>(`/masdata/mng/property_space/bind/auto_bind`, {
    method: 'POST',
    data,
  });
}

/** 空间-产权绑定批量解绑 */
export async function unbindPropertySpace(data: Record<string, any>) {
  return request<ResultData<AutoBindPropertySpace>>(`/masdata/mng/property_space/bind/unbind`, {
    method: 'PUT',
    data,
  });
}

/** 空间-产权绑定获取产权列表 */
export async function getPropertySpaceListSearch(data: Record<string, any>) {
  return request<ResultData<PropertySpaceListSearchType[]>>(
    `/masdata/mng/property_space/bind/property/list`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 空间-产权绑定单个绑定 */
export async function bindPropertySpace(data: Record<string, any>) {
  return request<ResultData<boolean>>(`/masdata/mng/property_space/bind/single`, {
    method: 'PUT',
    data,
  });
}
