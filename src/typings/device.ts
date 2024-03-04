type ProductUpgradeTaskItemType = {
  id: number;
  updater: string;
  deleted: true;
  gmtCreated: string;
  gmtUpdated: string;
  productId: string;
  targetVersion: string;
  state: string;
  upgradeResult: string;
  remark: string;
  successRate: string;
  upgradeTime: string;
  description: string;
  fileObjectId: string;
  businessId: string;
  resourceSource: number;
  dependencyVersionUpgrade: number;
  isRetry: number;
  failCount: number;
  nextExecTime: string;
  productName: string;
};

type ProductItemType = {
  productId: string;
  productName: string;
};

type DeviceUpgradeTaskItemType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  creator: string;
  updater: string;
  deleted: true;
  deviceId: number;
  taskId: number;
  did: string;
  state: string;
  upgradeResult: string;
  remark: string;
  projectBid: string;
  tenantName: string;
  deviceName: string;
  firmwareVersion: string;
  productName: string;
  projectName: string;
};

type UpgradeSourceItemType = {
  lifecycle: string;
  definition: {
    versionName: string;
    versionCode: number;
    productVersion: number;
    memo: string;
    url: string;
    size: number;
    md5: string;
    createBy: string;
    createAt: string;
  };
};

type TenantProjectItemType = {
  id: number;
  tenantId: string;
  tenantName: string;
  bid: string;
  resId: string;
  resType: string;
  name: string;
  orgBid: string;
  businessCode: string;
  businessType: number;
  projectStatus: number;
  province: string;
  city: string;
  region: string;
  address: string;
  totalArea: number;
  projectDrawingUrl: string;
  state: number;
  projectStageNames: [number, number];
  gmtCreated: string;
  gmtUpdated: string;
};
