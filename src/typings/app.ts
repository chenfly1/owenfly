interface LoginResult {
  access_token: string;
  client_id: string;
  expires_in: number;
  openid: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface LoginParams {
  username: string;
  client_id?: string;
  client_secret?: string;
  password?: string;
  grant_type?: string;
  phone: string;
  validateCode: string;
}

interface UserInfo {
  account: string;
  accountId: string;
  address: string;
  email: string;
  extension: string;
  mobile: string;
  orgNameList: string[];
  permissions: {
    authority: string;
    cnName: string;
    code: string;
    enName: string;
    tenantId: string;
  }[];
  roles: {
    code: string;
    name: string;
  }[];
  telephone: string;
  tenantId: string;
  userAvatarUrl: string;
  type: 'sadmin' | 'user' | 'tadmin';
  userBid: string;
  userId: number;
  userName: string;
  orgBidList: string[];
}

interface MenuInfo {
  type?: 'base' | 'verticals';
  sourceSystem?: 'SELF' | 'THIRD';
  systemBid?: string;
  name?: string;
  bid?: string;
  code?: string;
  url?: string;
}

interface Application {
  bid: string;
  code: string;
  customConfig: string;
  desc: string;
  dockingPerson: string;
  extension: string;
  gmtCreated: string;
  gmtUpdated: string;
  id: number;
  name: string;
  remark: string;
  state: string;
  type: 'verticals' | 'base';
  sourceSystem?: 'SELF' | 'THIRD';
  url: string;
  icon: string;
}

interface ForgetPassword {
  verifyCode?: string;
  account?: string;
  newPassword?: string;
}

type VerifyCode = {
  verifyCodeType:
    | 'BIND_PHONE'
    | 'FIND_PASS'
    | 'PHONE_CODE_LOGIN'
    | 'UNBIND_PHONE'
    | 'RESET_PASSWORD'
    | 'MERCHANT_BIND_PHONE';
  phone?: string;
  account?: string;
  verifyCode?: string;
};

type LoginAuthVerify = {
  loginAuthType?: 'PASSWORD' | 'PHONE';
  phone: string;
  verifyCode: string;
  loginChannel: 'PC' | 'WEB_MOBILE';
};

type LoginAuthVerifyRes = {
  accountResDTO?: {
    tenant: {
      name: string;
      tenantId: string;
    };
    name: string;
    accountType: string;
    userBid: string;
  }[];
  preLoginCode: string;
};

type AccountListRes = {
  tenant: {
    name: string;
    tenantId: string;
  };
  name: string;
  accountType: string;
  userBid: string;
};

type OperationType = {
  id: number;
  operator: string;
  operation: string;
  gmtCreated: string;
  creator: string;
};
