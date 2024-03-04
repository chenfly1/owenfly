type UserListType = {
  id?: number; // 主键
  bid?: string; // 业务主键
  name?: string; // 用户姓名
  account?: string; // 帐号
  mobile?: string; // 手机号
  type?: string; // 类型
  rolesTexts?: string[]; // 角色名称
  state?: string; // 状态
  systemText?: string; // 系统名称
  gmtCreated?: string; // 创建时间
  gmtCreator?: string; // 创建人
  remark?: string; // 备注
  orgBidList?: string[];
  orgs?: OrgListPageType[];
};

type UserCreateParamsType = {
  id?: number;
  name: string; // 用户姓名
  account: string; // 帐号
  mobile?: string; // 手机号
  systemBid?: string; // 系统bid
  gender?: string; // 性别
  email?: string; // 邮箱
  telephone: string; // 固定电话号
  address?: string; // 地址
  remark?: string; // 备注
  password?: string; //  密码
  type?: string; // 类型
  roleBids?: string[]; // 角色的bid
  userBid?: string; // 已有用户的bid
  state?: string;
};

type UserDetailType = UserListType & {
  orgBidList: string[];
  roles: RoleDetailType[];
};

type RoleListType = {
  id: number; // 主键
  bid: string; // 业务主键
  tenantId: string; // 租户ID
  code: string; // 角色编码
  name: string; // 角色名称
  type: string; // 角色类型: sadmin-超级管理员角色, tadmin-租户管理员角色,  user-普通角色,  functional_group-功能组角色
  state: string; // 状态: NORMAL-可用，BAND-停用
  groups: string; // 角色分组
  remark: string; // 备注
  tenantText?: string; // 租户名称
  orgBid: string; // 组织机构业务ID
  orgFullName: string; // 组织机构名称（部门）- 拼接全名：包括所有父级，如 碧桂园集团-安心加云联-技术部
  userCount: number; // 用户数

  dateLevel?: number; // 数据级别
  createdAt?: string; // 创建时间
};

type RoleCreateParamsType = {
  id?: number;
  name: string;
  type?: string;
  state?: string;
  groups?: string;
  remark?: string;
  resourceBids?: string[];
  orgBid: string;
};

type RoleDetailType = {
  id: number; // 主键
  bid?: string; // 业务主键
  tenantId?: string; // 租户ID
  code?: string; // 角色编码
  name: string; // 角色名称
  type?: string; // 角色类型: sadmin-超级管理员角色, tadmin-租户管理员角色,  user-普通角色,  functional_group-功能组角色
  state?: string; // 状态: NORMAL-可用，BAND-停用
  groups?: string; // 角色分组
  remark?: string; // 备注
  tenantText?: string; // 租户名称
  resourceBids?: string[];
  functions?: string[];
  accountBids?: string[];
  orgBid?: string; // 组织机构业务ID
  orgFullName?: string; // 组织机构名称（部门）- 拼接全名：包括所有父级，如 碧桂园集团-安心加云联-技术部
  gmtCreated?: string;
};

type ResourceTreeItemType = {
  cnName: string;
  id: number;
  bid: string;
  text: string;
  parentBid: string;
  icon: string;
  code: string;
  authority: string;
  module: string;
  url: string;
  sort: number;
  systemBid: string;
  systemCode: string;
  systemText: string;
  expanded: boolean;
  checked: boolean;
  type: string;
  systemApp: boolean;
  children?: ResourceTreeItemType[];

  key: string;
};

type OrgListType = {
  key: string;
  tenantId: string;
  id: number;
  bid: string;
  code: string;
  name: string;
  parentBid: string;
  state: string;
  parentName: string;
  expanded: boolean;
  sort: number;
  children?: OrgListType[];
  orgType?: string;
};

type OrgQueryParamsType = {
  orgId: number; // 组织机构业务ID
  parentBid: string; // 组织机构业务ID
  name: string; // No comments found.
  state: string; // 组织状态
  dataSource: string; // No comments found.
  useArea: string; // No comments found.
  createBeginDt: string; // 开始日期
  createEndDt: string; // 结束日期
  pageNo: number; // No comments found.
  pageSize: number; // No comments found.
  orgType: string; // 组织类型 tenant-租户，customer-自定义，project-项目
};
type OrgListPageType = {
  bid?: string;
  bidId?: string;
  code?: string;
  gmtCreated?: string;
  id?: number;
  name: string; // No comments found.
  orgInfoVO?: {
    bid: string;
    id: number;
    orgType: string;
    userCount: number;
  };
  parentBid?: string; // 组织机构业务ID
  sort?: number;
  source?: string;
  state?: string; // 组织状态
  systemBid?: string;
  tenantId?: string;
  useArea?: string; // No comments found.
  orgType?: string;
  userCount?: number;
};

type OrgCreateParamsType = {
  id?: number;
  name?: string; // 组织架构名称
  state?: string; // 状态: NORMAL:可用，BAND:停用
  parentBid?: string; // 上级节点业务ID
  source?: string; // 数据来源，interface接口同步，user用户自建
  sort?: number; // 排序序号
  useArea?: string; // No comments found.
  systemBid?: string; // No comments found.
  orgType?: string; // 组织类型 tenant-租户，customer-自定义，project-项目
};

type AccessRecordType = {
  id?: string; // 数据库主键
  tenantId?: string; // 租户id
  gmtCreated?: string; // 创建时间
  gmtUpdated?: string; // 更新时间
  deleted?: boolean; // 逻辑删除
  creator?: string; //  No comments found.
  updater?: string; // 更新者
  projectUid?: string; // 项目编号
  userId?: string; // 用户编号
  userType?: string; // 用户类型
  userName?: string; // 用户名称
  userPhone?: string; // 用户电话
  userIdNum?: string; // 用户身份证
  deviceId?: string; // 设备编号
  deviceName?: string; // 设备名称
  deviceSpace?: string; // 设备空间位置
  accessType?: string; // 通行方式 1、IC卡  2、人脸
  deviceClass?: string; // 分类编号：1：ic设备，2：蓝牙设备，3：二维码设备，4：人脸设备
  deviceClassName?: string; // 设备类型名称
  faceUri?: string; // 人脸头像uri
  faceSceneUri?: string; // 人脸现场uri
  icCardNum?: string; // 6位数字卡片编号
  idCardNum?: string; // 6位数字卡片编号
  accessTime?: string; // 通行时间
  accessTimeFormat?: string; // 通行时间
  inOutType?: string; // 出入类型：0进出，1进，2出
};

type AnnouncementType = {
  id: number;
  name: string;
  coverImage: string;
  authEnd: string;
  authStart: string;
  pushRange: string;
  status: string;
  pushTime: string;
  content: string;
  gmtCreated: string;
  creator: string;
};

type WornLogType = {
  id: number;
  type: string;
  address: string;
  status: string;
  treatmentTime: string;
  transactor: string;
};

type TlakbackLogType = {
  id: number;
  callFrom: string;
  callTo: string;
  status: string;
  time: string;
  duration: string;
  pic: string;
};
