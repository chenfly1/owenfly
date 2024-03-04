export type BusinessType = {
  id: string;
  path: string;
  businessType?: string;
};

export const buildingHouse: BusinessType = {
  id: 'building_house',
  path: 'masdata/import/import_record/house',
};

export const buildingHouseBind: BusinessType = {
  id: 'building_house',
  path: 'masdata/import/import_record/house/bind',
};

export const parkingSpace: BusinessType = {
  id: 'parking_place',
  path: 'masdata/import/import_record/place',
};

export const individualCustomer: BusinessType = {
  id: 'individual_customer',
  path: 'masdata/import/import_record/individual_customer',
};

export const enterpriseCustomer: BusinessType = {
  id: 'enterprise_customer',
  path: 'masdata/import/import_record/enterprise_customer',
};

export const application: BusinessType = {
  id: 'application',
  path: 'masdata/import/import_record/application',
};

export const publicMaterialLib: BusinessType = {
  id: 'public_material_lib',
  path: 'public/material',
};

//工单
export const workordeLib: BusinessType = {
  id: 'alita_workorder',
  path: 'workorder/attachment',
};

export const face: BusinessType = {
  id: 'face',
  path: 'door/face/',
};

// 人脸批量上传
export const faceBatch: BusinessType = {
  id: 'face',
  path: 'door/face/facepck',
};

// 车行模块行驶证
export const alitaParkingLicense: BusinessType = {
  id: 'alita_parking',
  path: 'parking/import/ocr/license',
};

// 车行模块车辆批量授权导入
export const alitaParkingAuth: BusinessType = {
  id: 'alita_parking',
  path: 'parking/import/auth',
};

// 身份证ocr校验上传
export const alitaParkingIdentityCard: BusinessType = {
  id: 'alita_parking',
  path: 'parking/import/ocr/identityCard',
};

// 统一授权批量导入
export const passUserAuth: BusinessType = {
  id: 'unified_authorization',
  path: 'door/import/import_record/unified_authorization',
  businessType: '1001',
};

// 内容服务
export const contentBusiness: BusinessType = {
  id: 'alita_content',
  path: 'content/image',
};

// 设备中心
export const deviceBusiness: BusinessType = {
  id: 'alita_device',
  path: 'base/device',
};

// 意见反馈
export const feedbackBusiness: BusinessType = {
  id: 'alita_feedback',
  path: 'base/feedback',
};

// 鉴权
export const securityBusiness: BusinessType = {
  id: 'alita_security',
  path: 'security/users/avatar',
};

// 员工
export const staffBusiness: BusinessType = {
  id: 'alita_staff',
  path: 'base/staff',
};

// 安防
export const monitorBusiness: BusinessType = {
  id: 'alita_monitor_face',
  path: 'monitor/face',
};

// 生活缴费
export const propertyBill: BusinessType = {
  id: 'alita_property_bill',
  path: 'property/bill',
};
