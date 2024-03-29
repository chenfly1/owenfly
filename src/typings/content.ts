type ArticleContentPageType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  code: string;
  type: number;
  end: string;
  title: string;
  hasText: number;
  activityId: string;
  text: string;
  cover: string;
  readCount: number;
  likeCount: number;
  status: number;
  modifyTime: string;
  projectBids: string[];
  creatorAccount: string;
};

type TopicContentPageType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  projectNames: string;
  projectBids: string[];
  disabled: boolean;
  code: string;
  title: string;
  desc: string;
  count: number;
  status: number;
  modifyTime: string;
  creatorAccount: string;
};

type authorContentPageType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  code: string;
  projectBids: string[];
  name: string;
  avatar: string;
  status: number;
  modifyTime: string;
  creatorAccount: string;
};

type planContentPageType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  code: string;
  name: string;
  end: string;
  type: string;
  sort: number;
  cover: string;
  text: string;
  projectNames: string;
  jumpWay: number;
  contentId: number;
  contentCode: string;
  contentType: number;
  status: number;
  modifyTime: string;
  creatorAccount: string;
  projectBids: string[];
};

type planCheckType = {
  code: string;
  name: string;
  projectBid: string;
  projectName: string;
};

type ActivityType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  projectBid: string;
  projectName: string;
  phone: string;
  singInRate: string;
  code: string;
  title: string;
  text: string;
  cover: string;
  signInStatus: number;
  signUpUserCount: number;
  signUpCount: number;
  signInUserCount: number;
  signInCount: number;
  runStatus: string;
  status: number;
  creatorAccount: string;
  signUpStartTime: string;
  signUpEndTime: string;
  startTime: string;
  endTime: string;
  signUpLimit: number;
  signUpCond: string;
  needSignIn: true;
  address: string;
  articleId: number;
  qrcode: string;
};
