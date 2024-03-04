type IndicatorBasicType = {
  project: number;
  park: number;
  passage: number;
  onlinePark: number;
};
type ParkingFeeType = {
  lt: {
    id: string;
    tenantId: string;
    gmtCreated: string;
    gmtUpdated: string;
    creator: string;
    updater: string;
    type: number; // 0-临停 1-月租
    projectId: string;
    projectCode: string;
    projectName: string;
    parkId: string;
    parkCode: string;
    parkName: string;
    paidAmount: number;
    paidAmountWx: number;
    paidAmountTl: number;
    paidAmountAli: number;
    paidAmountCash: number;
    totalAmount: number;
    discountAmount: number;
    unpaidAmount: number;
    orderCount: number;
    reportDate: string;
  };
  yz: {
    id: string;
    tenantId: string;
    gmtCreated: string;
    gmtUpdated: string;
    creator: string;
    updater: string;
    type: number; // 0-临停 1-月租
    projectId: string;
    projectCode: string;
    projectName: string;
    parkId: string;
    parkCode: string;
    parkName: string;
    paidAmount: number;
    paidAmountWx: number;
    paidAmountTl: number;
    paidAmountAli: number;
    paidAmountCash: number;
    totalAmount: number;
    discountAmount: number;
    unpaidAmount: number;
    orderCount: number;
    reportDate: string;
  };
  totalPaidAmount: number;
  totalTotalAmount: number;
  totalCompare: number;
  totalRate: string;
};

type DeviceOnlineInfoType = {
  online: number;
  offline: number;
  rate: string;
};

type DeviceOnlineRankType = {
  projectCode: string;
  projectName: string;
  parkCode: string;
  parkName: string;
  index: number;
  online: number;
  offline: number;
};

type ParkingFeeRankType = {
  index: number;
  type: number;
  typeName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  parkName: string;
  parkCode: string;
  totalPaidAmount: number;
  totalTotalAmount: number;
  paidAmount: number;
  paidAmountWx: number;
  paidAmountTl: number;
  paidAmountAli: number;
  paidAmountCash: number;
  totalAmount: number;
  discountAmount: number;
  unpaidAmount: number;
  orderCount: number;
  reportDate: string;
};
type AuthVehicStaticType = {
  property: number;
  moth: number;
  propertyRate: string;
  mothRate: string;
  collect: {
    id: string;
    name: string;
    type: string;
    count: number;
    rate: string;
  }[];
};
type AuthVehicStaticRankType = {
  projectCode: string;
  projectName: string;
  parkCount: number;
  parkCode: string;
  parkName: string;
  index: number;
  property: number;
  moth: number;
  fre: number;
  other: number;
  visitor: number;
};
type ParkPassDetailType = {
  entryCount: number;
  exitCount: number;
  entryGraph: Record<string, any>; // 入场次数曲线图key-时间轴 value-数据
  exitGraph: Record<string, any>; // 出场次数曲线图key-时间轴 value-数据
};
type ParkPassDetailRankType = {
  index: number;
  tenantId: string;
  projectId: string;
  projectName: string;
  amount: number;
  type: number; // type = 0 进场 type = 1 出场
  parkAmount: string; // 车场数量
};
