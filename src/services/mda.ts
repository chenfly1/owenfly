import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const geteway = HIDE_GETEWAY ? '' : '/mda';

/** 房产列表 */
export async function getBuildingHouseList(data: Record<string, any>) {
  return request<ResultPageData<BuildingHouseListType>>(`${geteway}/api/v1/building_house/list`, {
    method: 'POST',
    data,
  });
}

/** 分页查询房产列表 */
export async function getBuildingHouseBypage(data: Record<string, any>) {
  return request<ResultPageData<BuildingHouseListType>>(
    `${geteway}/api/v1/building_house/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 房产批量删除接口 */
export async function delBuildingHouse(ids: number[]) {
  return request<ResultData<string>>(`${geteway}/api/v1/building_house/delete/batch`, {
    method: 'POST',
    data: ids,
  });
}

/** 新建房产 */
export async function createBuildingHouse(data: BuildingHouseType) {
  return request<ResultData<string>>(`${geteway}/api/v1/building_house/create`, {
    method: 'POST',
    data,
  });
}

/** 房产详情 */
export async function getBuildingHouseDetail(id: number) {
  return request<ResultData<BuildingHouseType>>(`${geteway}/api/v1/building_house/detail/${id}`, {
    method: 'GET',
  });
}

/** 房产编辑 */
export async function modifyBuildingHouse(id: number, data: BuildingHouseType) {
  return request<ResultData<BuildingHouseType>>(`${geteway}/api/v1/building_house/modify/${id}`, {
    method: 'Put',
    data,
  });
}

/** 批量删除房产 */
export async function batchBuildingHouse(data: string[]) {
  return request<ResultData<BuildingHouseType>>(`${geteway}/api/v1/building_house/delete/batch`, {
    method: 'POST',
    data: {
      ids: data,
    },
  });
}

/** 全部删除房产 */
export async function deleteBuildingHouse(bid: string) {
  return request<ResultData<string>>(`${geteway}/api/v1/building_house/delete/project/${bid}`, {
    method: 'DELETE',
  });
}

/** 分页查询车位列表 */
export async function getParkingQueryByPage(data: Record<string, any>) {
  return request<ResultPageData<ParkingPlaceListType>>(
    `${geteway}/api/v1/parking_place/queryByPage`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 新增车位 */
export async function createParkingPlace(data: Record<string, any>) {
  return request<ResultData<string>>(`${geteway}/api/v1/parking_place/create`, {
    method: 'POST',
    data,
  });
}

/** 车位修改 */
export async function modifyParkingPlace(id: number, data: Record<string, any>) {
  return request<ResultData<string>>(`${geteway}/api/v1/parking_place/modify/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 车位详情 */
export async function getParkingPlaceDetails(id: number) {
  return request<ResultData<ParkingPlaceListType>>(`${geteway}/api/v1/parking_place/detail/${id}`, {
    method: 'GET',
  });
}

/** 删除车位 */
export async function deleteParkingPlace(bid: string) {
  return request<ResultData<string>>(`${geteway}/api/v1/parking_place/delete/project/${bid} `, {
    method: 'DELETE',
  });
}

/** 批量删除车位 */
export async function batchParkingPlace(ids: number[]) {
  return request<ResultData<string>>(`${geteway}/api/v1/parking_place/delete/batch `, {
    method: 'POST',
    data: {
      ids: ids,
    },
  });
}

/** 项目列表 */
export async function getProjectAllList(): Promise<ResultPageData<ProjectListType>> {
  return request(`${geteway}/api/v1/project/list `, {
    method: 'GET',
  });
}

/** 项目分页查询列表 */
export async function getProjectList(
  params: Record<string, any>,
): Promise<ResultPageData<ProjectListType>> {
  return request(`${geteway}/api/v1/project/queryByPage`, {
    method: 'GET',
    params,
  });
}

/** 项目创建 */
export async function createProject(data: Record<string, any>): Promise<ResultData<object>> {
  return request(`${geteway}/api/v1/project/create `, {
    method: 'POST',
    data,
  });
}

/** 项目启用 */
export async function activeProject(id: number): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/project/active/${id}`, {
    method: 'POST',
  });
}

/** 项目停用 */
export async function stopProject(id: number): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/project/stop/${id}`, {
    method: 'POST',
  });
}

/** 项目详情 */
export async function getProjectDetails(id: number): Promise<ResultData<ProjectListType>> {
  return request(`${geteway}/api/v1/project/detail/${id}`, {
    method: 'GET',
  });
}

/** 项目批量删除 */
export async function deleteAllProject(deleteIds: number[]): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/project/deleteBatch`, {
    method: 'POST',
    data: { deleteIds: deleteIds },
  });
}

/** 项目删除 */
export async function deleteProject(id: number): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/project/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 项目编辑 */
export async function modifyProject(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/project/modify/${id}`, {
    method: 'POST',
    data,
  });
}

/** 修改项目分期 */
export async function modifyProjectStage(
  id: number,
  data: Record<string, any>,
): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/projectStage/modify/${id}`, {
    method: 'POST',
    data,
  });
}

/** 删除项目分期 */
export async function delProjectStage(id?: number): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/projectStage/delete/${id}`, {
    method: 'DELETE',
  });
}

/** 分页查询客户成员列表 */
export async function queryByPageCustomerMember(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberType>> {
  return request(`${geteway}/api/v1/customerMember/query2ByPage`, {
    method: 'POST',
    data,
  });
}

/** 分页查询个人客户列表 */
export async function queryByPageCustomer(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/queryByPage`, {
    method: 'POST',
    data,
  });
}

/** 查询个人客户详情 */
export async function customerDetail(
  data: Record<string, any>,
): Promise<ResultData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/detail`, {
    method: 'GET',
    params: data,
  });
}

/** 新增个人客户 */
export async function createCustomer(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/create`, {
    method: 'POST',
    data,
  });
}

/** 删除个人客户 */
export async function deleteCustomer(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/delete`, {
    method: 'POST',
    data,
  });
}

/** 全部删除个人客户 */
export async function deleteAllCustomer(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/deleteAll`, {
    method: 'POST',
    data,
  });
}

/** 更新个人客户 */
export async function modifyCustomer(
  data: Record<string, any>,
): Promise<ResultPageData<CusMemberPersonType>> {
  return request(`${geteway}/api/v1/basics/customer/modify`, {
    method: 'POST',
    data,
  });
}

/** 证件类型枚举 */
export async function getIdCardTypeEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/basics/customer/getIdCardTypeEnums`, {
    method: 'POST',
  });
}

/** 客户成员详情 */
export async function getcustomerMemberDetails(id: number): Promise<ResultData<string>> {
  return request(`${geteway}/api/v1/customerMember/detail2/${id}`, {
    method: 'GET',
  });
}

/** 获取学历枚举 */
export async function getCultureEnums(): Promise<ResultData<{ code: string; codeName: string }[]>> {
  return request(`${geteway}/api/v1/basics/customer/getCultureEnums`, {
    method: 'POST',
  });
}

/** 获取政治面貌枚举 */
export async function getPoliticsStatusEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/basics/customer/getPoliticsStatusEnums`, {
    method: 'POST',
  });
}

/** 获取婚姻状态枚举 */
export async function getMaritalStatusEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/basics/customer/getMaritalStatusEnums`, {
    method: 'POST',
  });
}

/** 获取产权类型枚举 */
export async function getPropertyTypeEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/basics/customer/getPropertyTypeEnums`, {
    method: 'POST',
  });
}

/** 获取客户身份枚举 */
export async function getCustomerRoleEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/basics/customer/getCustomerRoleEnums`, {
    method: 'POST',
  });
}

/** 分页查询企业客户列表 */
export async function queryByPageEnterprise(
  data: Record<string, any>,
): Promise<ResultPageData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/queryByPage`, {
    method: 'POST',
    data,
  });
}

/** 新增企业客户*/
export async function createEnterprise(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/create`, {
    method: 'POST',
    data,
  });
}

/** 企业客户详情*/
export async function enterpriseDetail(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/detail`, {
    method: 'GET',
    params: data,
  });
}

/** 更新企业客户*/
export async function modifyEnterprise(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/modify`, {
    method: 'POST',
    data,
  });
}

/** 删除企业客户*/
export async function deleteEnterprise(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/delete`, {
    method: 'GET',
    params: data,
  });
}

/** 全部删除企业客户*/
export async function deleteAllEnterprise(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/enterprise/deleteAll`, {
    method: 'POST',
    data,
  });
}

/** 企业证件类型枚举 */
export async function getEnterpriseCertificateEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/enterprise/getEnterpriseCertificateEnums`, {
    method: 'POST',
  });
}

/** 所属行业类型枚举 */
export async function getIndustryEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/enterprise/getIndustryEnums`, {
    method: 'POST',
  });
}

/** 企业规模类型枚举 */
export async function getCompanyScaleEnums(): Promise<
  ResultData<{ code: string; codeName: string }[]>
> {
  return request(`${geteway}/api/v1/enterprise/getCompanyScaleEnums`, {
    method: 'POST',
  });
}

/** 性别枚举 */
export async function getGenderEnum(): Promise<ResultData<{ code: string; codeName: string }[]>> {
  return request(`${geteway}/api/v1/basics/customer/getGenderEnum`, {
    method: 'POST',
  });
}

/** 枚举 */
// * 房产-房产类型:house_property_type
// * 房产-房产产权性质:house_property_right
// * 房产-房产入住状态:house_occupy_status
// * 房产-出租状态:house_rent_status
// * 房产-房产使用性质:house_use_nature
// * 车位-车位产权性质:place_property_right
// * 车位-车位类型:place_parking_type
// * 车位-交付状态:place_deliver_status
// * 车位-使用状态:place_use_status
// * 生效状态:state
export async function getResourceEnum(
  type: string,
): Promise<ResultData<{ code: string; message: string }[]>> {
  return request(`/wmda/api/v1/resource/enums/${type}`, {
    method: 'GET',
  });
}

export async function getAuthTypeEnum(): Promise<ResultData<{ code: string; codeName: string }[]>> {
  return request(`${geteway}/api/v1/customerPropertyRel/getAuthTypeEnum`, {
    method: 'POST',
  });
}

/** 批量导出账号*/
export async function batchAccountByCondition(
  data: Record<string, any>,
): Promise<ResultData<EnterpriseType>> {
  return request(`${geteway}/api/v1/exportExcel/batchAccountByCondition`, {
    method: 'POST',
    responseType: 'blob',
    data,
  });
}

// 分页查询第三方项目资源
export async function proectThirdPage(
  data: Record<string, any>,
): Promise<ResultPageData<ProectThirdType>> {
  return request(`/masdata/mng/proect/third/comm/page`, {
    method: 'POST',
    data,
  });
}

// 第三方项目绑定
export async function proectThirdBind(data: Record<string, any>): Promise<ResultData<any>> {
  return request(`/masdata/mng/proect/third/bind`, {
    method: 'POST',
    data,
  });
}

// 同步项目
export async function resourceBind(data?: Record<string, any>): Promise<ResultData<any>> {
  return request(`/masdata/mng/proect/third/resource/bind`, {
    method: 'POST',
    data,
  });
}
