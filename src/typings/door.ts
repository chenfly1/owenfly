// 统一授权列表
type DoorUserListType = {
  id?: string; // 主键
  tenantId: string; // 租户id
  gmtCreated?: string; // 创建时间
  gmtUpdated?: string; // 更新时间
  deleted?: boolean; // 删除逻辑
  creator?: string; // 创建人
  updater?: string; // 更新人
  authStatus?: number;
  projectUid?: string; //项目ID
  name?: string; // 用户名称
  phone?: string; // 用户手机号码
  type?: number; // 用户类型：1、个人客户 2、同住人 2、企业客户 4、企业员工 5、租户员工 6、清洁工 7、安保 8、施工人员
  idNum?: string; // 用户身份证
  switchFace?: number; // 人脸开关
  switchIc?: number; // ic卡开关
  idCardNum?: string; //ID卡号
  idCardClass: number; //ID卡号是否管理卡
  icCardClass: number; //IC卡号是否管理卡
  elevator: number; //梯控是否管理卡
  buildingNums: any[]; //楼栋编号
  icCard: any; //IC卡信息
  idCard: any; //ID卡信息
  face: any; //人脸信息
  switchRemote?: number; // 远程开关
  switchBluetooth?: number; // 蓝牙开关
  switchQrCode?: number; // 二维码开关
  authStart?: string; // 授权期限起
  authEnd?: string; // 授权期限止
  passingArea?: string; // 通行区域名称
  passingAreaIds: string[]; // 通行区域ID列表
  userPassingAreaLinks: any[]; // 通行区域
  icCardNum: string; // ic卡号
  faceUri: string; // 人脸照片uri
  autoSynced: boolean;
};

type DoorFaceListType = {
  id?: string; // 主键
  tenantId: string; // 租户id
  gmtCreated?: string; // 创建时间
  gmtUpdated?: string; // 更新时间
  deleted?: boolean; // 删除逻辑
  creator?: string; // 创建人
  updater?: string; // 更新人
  userId?: string; // 用户编号
  visitorId?: string; // 房客编号
  projectUid?: string; //项目ID
  uri?: string; // 文件服务里的uri
  type?: number; // 1人员、2访客
  status?: string; // 下发状态：0下发中 1下发成功 2下发失败 3删除成功 4删除失败
  authStart?: string; // 授权期限起
  authEnd?: string; // 授权期限止
  userName?: string; // 人员姓名
  userPhone?: string; // 手机号
  userType?: string; // 人员类型 1、个人客户 2、同住人 2、企业客户 4、企业员工 5、租户员工 6、清洁工 7、安保 8、施工人员
  passingArea?: string; // 通行区域
  autoSynced?: boolean; // 是否自动同步人员，0-否，1是
};

type FaceDownLogType = {
  id?: string; // 数据库主键
  tenantId?: string; // 租户id
  gmtCreated?: string; // 创建时间
  gmtUpdated?: string; // 更新时间
  deleted?: string; // 逻辑删除
  creator?: string; // No comments found.
  updater?: string; // 更新者
  projectUid?: string; // 项目编号
  userId?: string; // 用户编号
  deviceId?: string; // 设备编号
  type?: string; // 下发日志类型face_register,face_del
  authObjId?: string; // 人脸、ic卡编号
  authObjType?: string; // 授权物类型(2.人脸，1.ic卡，6.二维码)
  status?: string; // 下发状态
  authStart?: string; // 有效开始时间
  authEnd?: string; // 有效结束时间
  faceUri?: string; // 人脸uri
  faceType?: string; // 1人员，2访客
  taskUid?: string; // 下发日志任务uid
  isDown?: string; // 数据库主键
  code?: string; // 数据库主键
  msg?: string; // 数据库主键
  authorityType?: string; // 数据库主键
  timeInterval?: string; // 数据库主键
  extend1?: string; // 数据库主键
  extend5?: string; // 数据库主键
  extend3?: string; // 数据库主键
  extend4?: string; // 数据库主键
};

type passingAreaOrgType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  creator: string;
  updater: string;
  deleted: boolean;
  organizationId: number;
  passingAreaId: number;
  spaceId: number;
  passingAreaName: string;
};

type DoorICcardListType = {
  id?: string; // 主键
  tenantId: string; // 租户id
  gmtCreated?: string; // 创建时间
  gmtUpdated?: string; // 更新时间
  deleted?: boolean; // 删除逻辑
  creator?: string; // 创建人
  updater?: string; // 更新人
  userId?: string; // 用户编号
  visitorId?: string; // 房客编号
  projectUid?: string; //项目ID
  uri?: string; // 文件服务里的uri
  type?: number; // 1人员、2访客
  status?: string; // 下发状态：0下发中 1下发成功 2下发失败 3删除成功 4删除失败
  authStart?: string; // 授权期限起
  authEnd?: string; // 授权期限止
  userName?: string; // 人员姓名
  userPhone?: string; // 手机号
  phone?: string; // 手机号
  userType?: string; // 人员类型 1、个人客户 2、同住人 2、企业客户 4、企业员工 5、租户员工 6、清洁工 7、安保 8、施工人员
  passingArea?: string; // 通行区域
  autoSynced?: boolean; // 是否自动同步人员，0-否，1是
};

type PeriodType = {
  id: number;
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  creator: string;
  updater: string;
  deleted: boolean;
  name: string;
  validTimeStart: string;
  validTimeEnd: string;
  validDateStart: string;
  validDateEnd: string;
  weekend: string;
  projectUid: string;
};
