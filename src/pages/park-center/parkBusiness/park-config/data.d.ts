type pProps = {
  data?: ParkRuleConfigType;
  parkId: string;
  projectId: string;
  loading: boolean;
};

type configWxType = {
  merchantNo: string;
  appId: string;
  appSecret: string;
  authUrl?: string;
  version: string;
  v2key?: string;
  v3key?: string;

  serialNo: string;
  p12: string;
  cert12: string;
  privatekey: string;
};
