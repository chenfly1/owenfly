/*
 * @Author: mhf
 * @Date: 2023-02-13 15:19:05
 * @description:
 */

//  设备列表
type devicesListType = {
  id: string;
  name: string;
  authenticationStatus: number;
  status?: string;
  tenantId: string;
  alias: string;
  extension: string;
  typeId: string;
  typeCode: string;
  locationNumber: string;
  typeName: string;
  intelligence: boolean;
  projectId: string;
  projectName: string;
  spaceId: string;
  spaceName: string;
  did: string;
  productId: string;
  protocolType: string;
  brand: string;
  model: string;
  registerDate: string;
  systemId: string;
  systemName: string;
  abscissa: number;
  ordinate: number;
  deviceAbility: DeviceAbility;
  hasFace: string;
  setDeviceConfig: any;
  doorDevice: any;
  hasIC: string;
  qrCode: string;
  bluetooth: string;
  remote: string;
  ladder: string;
  exim?: string;
  location?: string;
  isAssociated?: boolean;
  positionDescription?: string;
  ip?: string;
};

//  设备类型
type devicesType = {
  id: number;
  tenantId: string;
  inlay: boolean;
  name: string;
  code: string;
};

// 设备能力
interface DeviceAbility {
  face: boolean;
  icCard: boolean;
  qrcode: boolean;
  bluetooth: boolean;
  remote: boolean;
  elevator: boolean;
}

// 设备列表分页
type DevicesPageType = {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  list: devicesListType[];
};

type transferType = {
  key: string;
  id: string;
  name: string;
  status: number;
};

type areaListType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  projectUid: string;
  name: string;
  type: number;
  deviceCount: number;
};
