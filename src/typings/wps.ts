type TenantListType = {
  account: string;
  address?: string;
  bankAccount?: string;
  bid: string;
  code: string;
  contact: string;
  id: string;
  loginPrefix?: string;
  logoIcon?: string;
  name: string;
  openingBank?: string;
  remark?: string;
  setMealBids: string[];
  setMealTexts: string[];
  socialCreditCode?: string;
  state: string;
  info: {
    salesman: string;
    province: string;
    city: string;
    district: string;
    securePhone: string;
  };
};

type ApplicationListType = {
  bid: string;
  code: string;
  id: number;
  name: string;
  remark: string;
  resourceBids: string;
  state: string;
  extension: string;
  type: string;
  sourceSystem: string;
};

type ApplicationItemType = {
  authority: string;
  bid: string;
  checked: boolean;
  children: ApplicationItemType[];
  code: string;
  expanded: boolean;
  extension: string;
  functions?: any;
  icon: string;
  id: number;
  checkable: boolean;
  disabled: boolean;
  module: string;
  parentBid: string;
  sort: number;
  state: string;
  systemBid: string;
  systemCode: string;
  systemText: string;
  text: string;
  type: string;
  url: string;
  all: boolean;
  cnName?: string;
  enName?: string;
};

type MealListData = {
  id: number;
  bid: string;
  name: string;
  code: string;
  state: string;
  remark: string;
  extension: string;
  resourceBids: string;
  mobileApp: boolean;
};

type DistrictType = {
  regionCode: string;
  regionLevel: number;
  regionName: string;
  regionParentId: number;
  regionShortName: string;
  isLeaf: boolean;
  loading?: boolean;
  children?: DistrictType[];
};

type AuthorityType = {
  id: number;
  bid: string;
  systemBid: string;
  parentCode: string;
  authorityCode: string;
  authorityName: string;
  version: string;
  children: AuthorityType[];
};
