type BuildingHouseListType = {
  id: number;
  bid: string;
  name: string;
  shortName: string;
  propertyOwner: string;
  mobile: string;
  propertyType: number;
  propertyRight: number;
  useNature: number;
  occupyStatus: number;
  rentStatus: number;
  state: number;
};

type BuildingHouseType = {
  id?: number;
  bid: string;
  houseSpaceId: string;
  projectBid: string;
  stageBid?: string;
  buildingBid: string;
  unitBid?: string;
  floorBid: string;
  name?: string;
  code: string;
  floorArea?: number;
  insideArea?: number;
  billingArea?: number;
  propertyType?: number;
  propertyRight?: number;
  useNature?: number;
  occupyStatus?: number;
  rentStatus?: number;
  state?: number;
};

type ParkingPlaceListType = {
  id: number;
  bid: string;
  shortName: string;
  projectBid: string;
  name: string;
  code: string;
  propertyOwner: string;
  mobile: string;
  parkingType: number;
  propertyRight: number;
  useStatus: number;
  deliverStatus: number;
  state: number;
};

type ProjectListType = {
  current: string;
  id: number;
  bid: string;
  name: string;
  orgBid: string;
  businessCode: string;
  businessType: number;
  businessTypeShow: string;
  projectStatus: number;
  projectStatusShow: string;
  province: string;
  city: string;
  region: string;
  address: string;
  totalArea: number;
  projectDrawingUrl: string | any[];
  state: number;
  stateShow: string;
  buildingCount: number;
  roomCount: number;
  parkingCount: number;
  resId: string;
  projectStageVOList: {
    open?: boolean;
    id: number;
    bid: string;
    projectBid: string;
    name: string;
  }[];
};

type CusMemberType = {
  id: number;
  bid: string;
  projectBid: string;
  groupBid: string;
  name: string;
  phone: string;
  idNumberType: string;
  idNumber: string;
  education: number;
  nativePlace: string;
  birthday: string;
  politicCountenance: number;
  maritalStatus: number;
  occupation: string;
  customerAndBuildingHouseSimpleList: {
    customerBid: string;
    customerName: string;
    buildingName: string;
    houseBid: string;
    houseName: string;
    phone: string;
    type: number;
    typeName: string;
  }[];
};

type CusMemberPersonType = {
  pageNo: number;
  pageSize: number;
  id: number;
  bid: string;
  name: string;
  identityType: string;
  identityCard: string;
  address: string;
  mobile: string;
  email: string;
  gender: string;
  isMobileLogin: boolean;
  customerExpand: customerExpandType;
  housePropertyList: housePropertyListType;
};

type customerExpandType = {
  id: number;
  bid: string;
  customerBid: string;
  tenantId: string;
  projectBid: string;
  culture: string;
  nativePlace: string;
  occupation: string;
  birthday: string;
  politicsStatus: string;
  maritalStatus: string;
  gmtCreator: string;
  gmtCreated: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: number;
  dogid: string;
};

type housePropertyListType = {
  id?: number;
  bid?: string;
  customerBid?: string;
  enterpriseBid?: string;
  tenantId?: string;
  projectBid: string;
  buildingBid?: string;
  houseBid?: string;
  role?: string;
  gmtCreator?: string;
  gmtCreated?: string;
  gmtUpdated?: string;
  gmtUpdater?: string;
  deleted?: number;
  dogid?: string;
  propertyName?: string;
  propertyType?: string;
};

type EnterpriseType = {
  id: number;
  bid: string;
  name: string;
  projectBid: string;
  identityType: string;
  identityCard: string;
  mobile: string;
  managerName: string;
  ownerIdentityCard: string;
  managerPhone: string;
  industry: string;
  enterpriseExpand: enterpriseExpandType;
  housePropertyList: housePropertyListType;
};

type enterpriseExpandType = {
  id: number;
  bid: string;
  enterpriseBid: string;
  legalPerson: string;
  legalIdCard: string;
  companyScale: string;
  establishDate: string;
  registeredCapital: string;
};

type CusMemberPersonDetailListType = {
  customerBid: string;
  customerName: string;
  houseBid: string;
  houseName: string;
  type: number;
  typeName: string;
};

type CusMemberPersonDetailType = {
  id: number;
  bid: string;
  projectBid: string;
  groupBid: string;
  name: string;
  phone: string;
  idNumberType: number;
  idNumber: string;
  education: number;
  nativePlace: string;
  birthday: string;
  politicCountenance: number;
  maritalStatus: 199;
  occupation: string;
  customerAndBuildingHouseSimpleList: CusMemberPersonDetailListType[];
};

type ProectThirdType = {
  commId: number;
  commNum: string;
  commName: string;
  commOrgId: string;
  commOrgName: string;
  commType: string;
  commStatus: string;
  commAddr: string;
};
