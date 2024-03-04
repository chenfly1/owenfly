/** 消息记录 */
type NoticeItemType = {
  id: string;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  creator: string;
  updater: string;
  type: string;
  typeDesc: string;
  title: string;
  status: number;
  text: string;
  projectBid: string;
  link: string;
  channelTenants: Record<string, any>[];
};

/** 消息类型记录 */
type NoticeType = {
  id: string;
  gmtCreated: string;
  gmtUpdated: string;
  code: string;
  name: string;
};

/** 消息模板列表 */
type NoticeTempType = {
  bid: string;
  templateName: string;
  channelType: string;
  channelTypeDesc: string;
  channelBid: string;
  channelName: string;
  status: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
};

/** 消息模板详情 */
type NoticeTempDetail = {
  bid: string;
  templateName: string;
  channelType: string;
  channelTypeDesc: string;
  channelBid: string;
  channelName: string;
  status: string; // 模板状态 0-停用 1-启用 2-审核中
  wechatTemplateId: string;
  title: string;
  wechatDeputyIndustry: string;
  wechatPrimaryIndustry: string;
  content: string;
  categoryBid: string;
  simpleDesc: string;
  redirectStatus: number; // 1:开启跳转，0:不跳转
  variables: {
    variableBid: string;
    variableDesc: string;
    variable: string;
  }[];
  redirectUrl: {
    type: string;
    redirectUrl: string;
    inUse: string;
  };
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
  used: boolean;
};

/** 微信消息模板数据 */
type WebChartTempType = {
  templateId: string;
  title: string;
  primaryIndustry: string;
  deputyIndustry: string;
  content: string;
  example: string;
};

type NoticeLogType = {
  bid: string; // 发送记录id
  msgBid: string; // 消息id
  templateBid: string; // 模板id
  templateName: string; // 模板名称
  channelBid: string;
  channelName: string;
  channelType: string; // 渠道类型 JPUSH-极光推送   INMAIL-站内信   WECHAT-微信   WECHAT_OFFICIAL_ACCOUNT-微信公众号   WECHATMINI-微信小程序    WEWORK-企微   SMS-短信
  receiveUserBid: string;
  receivePhone: string;
  msgSource: string;
  sendStatus: string; // 发送状态 0-未发送 1-发送成功 2-发送失败
  sendTime: string;
  readStatus: string; // 读取状态 0-未读取 1-已读取
  readTime: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
};

type SendStatisticList = {
  bid: string; // 发送记录id
  tenantId: string; // 发送记录id
  tenantName: string;
  channelBid: string;
  channelName: string;
  channelType: string; // 渠道类型 JPUSH-极光推送   INMAIL-站内信   WECHAT-微信   WECHAT_OFFICIAL_ACCOUNT-微信公众号   WECHATMINI-微信小程序    WEWORK-企微   SMS-短信
  statisticDate: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
};

type NoticeTaskType = {
  bid: string; // 发送任务ID
  msgBid: string; // 消息ID
  templateName: string;
  channelType: string;
  channelTypeDesc: string;
  channelBid: string;
  channelName: string;
  msgSource: string;
  status: string; // 0-停发 1-开启
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
};

type DetailNoticeTaskType = {
  bid: string; // 发送任务ID
  templateBid: string;
  templateName: string;
  sendType: string;
  channelType: string;
  channelBid: string;
  msgSource: string;
  status: string; // 0-停发 1-开启
  tenantId: string;
  // receiveUserBids: {variableBid: string; variableValue: string;}[]
  receiveUserBids: { userBid: string; phone: string }[];
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdate: string;
  gmtUpdater: string;
  acceptUserType: number;
};
