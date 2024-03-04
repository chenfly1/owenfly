/** 区域 */
type ParkAreaType = {
  id: string;
  code: string;
  name: string;
  parkName: string;
  parkNumber: number;
  limitState: number;
  gmtCreated: string;
  projectName?: string;
  projectCode?: string;
  parkCode?: string;
  remark?: string;
};

/** 车场 */
type ParkYardType = {
  id: string;
  code: string;
  name: string;
  areaNumber: number; // 区域数量
  parkNumber: number; // 车位数量
  parkBrand: string; // 厂家品牌
  state: number; // 车场状态 0-未启用 1-已上线 2-已下线
  projectName: string;
  gmtCreated: string;
};

// 车场详情
type ParkDetailType = {
  id?: string; // 阿丽塔车场id
  code?: string; // alita车场编号
  name?: string; // alita车场名称
  projectName?: string; // 项目名称
  areaNumber?: number; // 区域数量
  parkNumber?: number; // 车位数量
  parkBrand?: string; // 厂家品牌
  state?: number; // 车场状态 0-未启用 1-已上线 2-已下线
  gmtCreated?: string; // 创建时间
  projectId?: string; // 项目编号
  projectType?: string; // 项目业态
  projectAddress?: string; // 项目地址
  contactName?: string; // 车场联系人
  contactMobile?: string; // 车场联系人电话
  businessType?: string; // 车场业务 临停缴费、车辆授权、优惠券
  parkName?: string; // 厂家车场名称
  parkCode?: string; // 厂家车场编号
  remark?: string; // 备注
};

// 车场准入区域树
type ParkAreaTreeType = {
  id: string; // 数据id
  name: string; // 名称
  type?: string; // 类型
  optional?: boolean; // 是否可选 true-是 false-否
  selected?: boolean; // 是否已选 true-是 false-否
  child: ParkAreaTreeType[]; // 子区域
};

// 车场二维码
type ParkQrcodeType = {
  code: string;
  name: string;
  url: string;
};

// 绑定车场参数
type ParkBindParams = {
  projectId: string;
  list: { parkType: string; parkId: string }[];
};

// 更新车场
type ParkModifyParams = {
  id?: string; // 车场id
  name?: string; // alita车场名称
  parkNumber?: string; // 车位数量
  contactName?: string; // 车场联系人
  contactMobile?: string; // 车场联系人电话
  businessType?: string; // 车场业务 临停缴费、车辆授权、优惠券
  state?: string; // 车场状态 0-未启用 1-已上线 2-已下线
  remark?: string; // 备注
};

/** 来访区域 */
type ParkAccessAreaType = {
  id: string;
  name: string;
  type: string;
  optional: boolean;
  selected: boolean;
  child: ParkAccessAreaType[];
};

/** 车辆套餐 */
type ParkServiceType = {
  id: string;
  projectName: string;
  parkName: string;
  name: string;
  type: number;
  price: number;
  cycle: number;
  state: number;
  gmtCreated: string;
  projectCode?: string;
  parkCode?: string;
  parkId?: string;
  remark?: string;
  passageIds?: string[];
};

// 通道列表
type PassageListType = {
  id?: string; // 通道id
  code: string; // 通道编码
  name?: string; // 通道名称
  type?: string; // 通道类型 1：进口 2：出口
  typeName?: string; // 通道类型 1：进口 2：出口
  parkId?: string; // 车场id
  parkName?: string; // 车场名称
  areaId?: string; // 区域id
  areaCode?: string; // 区域code
  areaName?: string; // 区域名称
  deviceId?: string; // 设备id
  deviceName?: string; // 设备名称
  useStatus?: number; // 使用状态：1启用，0禁用
  remark?: string; // 备注
};

// 通道明细
type PassageDetailType = PassageListType & {
  deviceList: {
    id?: string; // 设备id
    name?: string; // 设备名称
    status?: string; // 设备状态 0离线 1在线
    tenantId?: string; // 租户id
    typeId?: string; // 类型
    typeName?: string; // 类型名称
  }[];
};

// 通道编辑参数
type PassageEditParamsType = {
  id: string; // 通道id
  name?: string; // 名称
  type?: string; // 通道类型
  useStatus?: string; // 使用状态：1启用，0禁用
};

// 通道二维码生成参数
type PassageQrcodeParamsType = {
  parkId: string; // 车场ID
  passageId: string; // 通道id
  areaId: string; // 区域id
  url: string;
};

// 设备列表
type DeviceItemType = {
  id?: number; // 设备id
  pid?: number; // 通道设备关联id
  deviceId: number; // 设备id
  name?: string; // 设备名称
  status?: string; // 设备状态 0离线 1在线
  tenantId?: string; // 租户id
  type?: string; // 厂家设备类型： 1：网关一体机，2：卡票机，3：转换板，4：摄像头，5：显示屏，6：语音版
  typeId?: number; // 设备中心类型id
  typeName?: string; // 类型名称
  useStatus?: number; // 使用状态：1启用，0禁用
  alias?: string; // 设备备注名
  projectId?: string; // 项目id
  projectName?: string; // 项目名称
  parkId?: string; // 车场id
  parkName?: string; // 车场名称
  passageId?: string; // 通道id
  passageName?: string; // 通道名称
  code?: string; // 厂家编码
  manufacturerId?: string; // 厂家id
  brand?: string; // 设备品牌
  model?: string; // 设备型号
  statusLastUpdated?: string; // 设备状态最后更新时间
};

type DeviceEditParamsType = {
  id: string; // 设备ID
  name: string; // 设备名称
  typeId: string; // 设备类型id
  passageId: string; // 通道id
};

/** 计费规则 */
type ParkChargeRuleType = {
  name: string; // 规则名称
  projectId: string; // 项目id
  projectName: string; // 项目名称
  parkId: number; // 车场id
  parkName: string;
  mode: string; // 计费方式 1：按时收费 2：计次收费 3：阶梯收费
  holidayMode: string; // 节假日模式 0：不区分 1：工作日 2：节假日
  description: string;
};

/** 业务规则 */
type ParkRuleConfigType = {
  parkId: string;
  orderTimeout: number;
  appId: string;
  merchantId: string;
  couponLimit?: boolean;
  couponMaxium?: number;
  couponBindContent?: number;
  temporaryPassMode: number; // 临停车入场通行方式：1自动放行、2人工确认
  unlicensedPassMode: number; // 无牌车入场通行方式：1自动放行、2人工确认
  noRecordExitMode: number; // 无车辆记录离场通行方式：1自动放行、2人工确认
  fullAdmission: boolean; // 满位是否允许入场：0否、1是

  tempAppId: string;
  tempMerchantId: string;
  monthlyAppId: string;
  monthlyMerchantId: string;
};

/** 分页查询车主车辆 */
type PlatformVehicleType = {
  id: string; // 车主id
  relId?: string; // 车主车辆关系id
  plate?: string; // 车牌号码
  userType?: string; // 车主类型
  name?: string; // 车主姓名
  mobile?: string; // 手机号
  energyType?: string; // 能源类型 1-燃油 2-新能源
  vehicleType?: string; // 车辆类型
  color?: string; // 车牌颜色
  model?: string; // 品牌
  imageUrl?: string; // 行驶证图片
  vehicleId?: string; // 车辆ID
};
/** 创建车主车辆 */
type PlatformVehicleCreateType = {
  projectId: string; //项目
  name: string; // 车主姓名
  mobile: string; // 手机号
  plates: PlatformVehicleType[]; // 新增车辆
};

/** 授权记录列表 */
type VehicleAuthType = {
  id: string; // 单据ID
  plate: string[]; // 车牌
  owner: {
    carType: string;
    name: string;
    phone: string;
    plate: string;
  }[];
  parkName?: string; // 车场名称
  packageType?: string; // 套餐用途
  packageName?: string; // 套餐名称
  startDate?: string; // 授权开始时间
  endDate?: string; // 授权结束时间
  status: string; // 状态
  source: string; // 来源
};
/** 授权记录列表 */
type ResultElementsType<T> = {
  pageNo: number;
  pageSize: number;
  total: number;
  elements: T[];
};
/** 新增授权 */
type VehicleAuthCreateType = {
  projectId?: string; // 项目ID
  plates?: string[]; // 授权车牌列表
  carId?: string; // 授权车辆
  parkId?: string; // 授权车场
  carportIds?: string[]; // 授权使用车位列表
  packageId?: string; // 授权套餐
  startDate?: string; // 授权开始时间
  endDate?: string; // 授权结束时间
  fee?: string; // 月租支付金额
  payTypeId?: string; // 支付方式
};
/** 授权详情 */
type vehicleAuthDetailType = {
  plate?: string[]; // 车牌号码
  ownerName?: string; // 车主姓名
  ownerPhone?: string; // 车主号码
  parkName?: string; // 车场名称
  packageType?: string; // 套餐用途
  packageName?: string; // 套餐名称
  startDate?: string; // 授权开始时间
  endDate?: string; // 授权结束时间
  status?: string; // 授权状态
  statusName?: string; // 授权状态名称
  packageId?: string; // 车辆套餐ID
  parkId?: string; // 车场ID
};
/** 续费请求 */
type VehicleAutRenewParamsType = {
  id: string;
  startDate: string; // 授权开始时间
  endDate: string; // 授权结束时间
  payCount: string; // 支付金额
  payType: string; // 支付方式 1-线下支付 1-线上支付
  payChannelId?: string; // 线上支付方式ID/支付渠道ID，线上支付时间，必填
  packageCount: string; // 授权套餐数量
};

/** 月租交易记录查询 */
type TransRecordsltType = {
  id?: string; // 记录ID
  plate: string; // 车牌
  parkName?: string; // 车场名称\
  carInTime?: string; // 车辆入场时间
  billingSTime?: string; // 计费开始时间
  billingETime?: string; // 计费结束时间
  orderType?: string; // 订单状态
  payOrderId?: string; // 支付订单号
  totalAmount?: number; // 应收金额
  payAmount?: number; // 支付金额
  discountAmount?: number; // 优惠金额
  payType?: string; // 支付方式
  payChannel?: string; // 支付渠道
  payTime?: string; // 支付成功时间
};

/** 月租交易记录查询 */
type TransRecordsyzType = {
  id?: string; // 记录ID
  parkName?: string; // 车场名称
  orderId?: string; // 支付订单ID
  orderStatus?: string; // 订单状态
  packageName?: string; // 套餐名称
  packagePrice?: number; // 套餐单价 单位：分
  quantity?: number; // 数量
  totalAmount?: number; // 应收金额
  payAmount?: number; // 支付金额
  discountAmount?: number; // 优惠金额
  payType?: string; // 支付方式
  payChannel?: string; // 支付渠道
  payTime?: string; // 支付成功时间
};

/** 临停订单记录查询 */
type OrderRecordsltType = {
  id?: string; // 记录ID
  plate?: string; // 车牌
  parkName?: string; // 车场名称
  projectName?: string; // 项目名称
  orderStatus?: string; // 订单状态
  orderStatusName?: string; // 订单状态名称
  payOrderId?: string; // 支付订单号
  totalAmount?: number; // 应收金额
  paidAmount?: number; // 支付金额
  discountAmount?: number; // 优惠金额
  payType?: string; // 支付方式
  payTypeName?: string; // 支付方式名称
  payChannel?: string; // 支付渠道
  payChannelName?: string; // 支付渠道名称
  createTime?: string; // 订单创建时间
  paySuccessTime?: string; // 支付成功时间
  failureTime?: string; // 订单失效时间
  cancelTime?: string; // 订单取消时间
};

/** 月租订单记录查询 */
type OrderRecordsyzType = {
  id?: string; // 记录ID
  plate?: string; // 车牌
  parkName?: string; // 车场名称
  payOrderId?: string; // 支付订单号
  orderStatus?: string; // 订单状态
  orderStatusName?: string; // 订单状态名称
  packageName?: string; // 套餐名称
  packagePrice?: number; // 套餐单价 单位：分
  packageCount?: number; // 数量
  payType?: string; // 支付方式
  payTypeName?: string; // 支付方式名称
  payChannel?: string; // 支付渠道
  payChannelName?: string; // 支付渠道名称
  createTime?: string; // 订单创建时间
  paySuccessTime?: string; // 支付成功时间
  failureTime?: string; // 订单失效时间
  cancelTime?: string; // 订单取消时间
};

/** 通行记录分页列表 */
type PassageRecordType = {
  parkRecordId?: string; // 车场记录id
  parkId?: string; // 车场id
  parkName?: string; // 车场名称
  projectId?: string; // 项目id
  projectName?: string; // 项目名称
  plateNumber?: string; // 车牌
  plateType?: string; // 车辆类型 0未知，1临时车，2本地VIP，3外部VIP 4黑名单，5访客，6预定车位车辆，7共享车位车辆，8红名单
  plateStatus?: string; // 车辆状态：1在场，2离场
  entryPassageId?: string; // 入场通道id
  entryPassageName?: string; // 入场通道名称
  entryPassageMode?: string; // 入场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
  entryPackageId?: string; // 入场套餐id
  entryPackageName?: string; // 入场套餐名称
  entryTime?: string; // 车场记录id
  entryImage?: string; // 入场图片
  exitPassageId?: string; // 离场通道id
  exitPassageName?: string; // 离场通道名称
  exitPassageMode?: string; // 离场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
  exitPackageId?: string; // 离场套餐id
  exitPackageName?: string; // 离场套餐名称
  exitTime?: string; // 离场时间
  exitImage?: string; // 离场图片
};

// 车主认证查询
type VehicleAttestateType = {
  relId: string; // 车主车辆认证关系id
  plate: string; // 车牌号码
  authName: string; // 车主姓名
  mobile: string; // 手机号
  energyType: string; // 能源类型 1-燃油 2-新能源
  vehicleType: string; // 车辆类型
  authStatus: string; // 认证状态 0-已绑定，1-认证成功，2-认证失败，3-认证中，4-申诉中，5-申诉失败
};

// 分页查询待审核列表
type VehicleApprovingType = {
  recordId?: string; // 记录recordId
  mobile?: string; // 手机号
  authName?: string; // 认证车主姓名
  plate?: string; // 车牌
  vehicleOwner?: string; // 行驶证所有人
  engineNumber?: string; // 发动机号码
  vinCode?: string; // 车辆识别代码
  vehicleLicenseUrl?: string; // 行驶证图片
  gmtCreated?: string; // 创建时间
  approveStatus?: string; // 审批状态 0-提交认证申请，1-认证(通过)，2-认证(失败)，3-提交申诉申请，4-申诉(失败)
};

type VehicleApprovingDetailType = VehicleApprovingType & {
  idName: string; // 身份证-姓名
  idNumber: string; // 身份证-姓名
  identityCardUrl: string; // 身份证-姓名
  authRecords: VehicleApprovingType[]; // 历史认证信息
};

type VehicleAuthReviewType = {
  id?: string; // id
  projectId?: string; // 项目ID
  parkId?: string; // 车场ID
  parkName?: string; // 车场名称
  plates?: string[]; // 车牌列表
  startDate?: string; // 授权开始时间
  enDate?: string; // 授权结束时间
  orderAmount?: string; // 订单金额 单位：分
  type?: string; // 待处理类型
  typeName?: string; // 待处理类型名称
  spaces?: string[]; // 车位列表
  ownerName?: string; // 产权人
  ownerPhone?: string; // 电话
  tenancyTerm?: string; // 租期
};

type AppConfigType = {
  projectId: string;
  propertyRightAuthEnable: number;
  monthlyRentAuthEnable: number;
  monthlyRentAuthNeedApply: number;
  monthlyRentHandleDay: number;
  monthlyRentPayLimitTime: number;
  monthlyRentPackageList: {
    parkInfo: {
      id: string;
      projectId: string;
      name: string;
      code: string;
      projectName: string;
      areaNumber: number;
      parkNumber: number;
      factoryName: string;
      state: string;
      stateDesc: string;
      gmtCreated: string;
    };
    packageInfo: {
      id: string;
      projectName: string;
      parkId: string;
      parkName: string;
      name: string;
      type: number;
      typeDesc: string;
      price: number;
      priceDesc: string;
      cycle: number;
      cycleDesc: string;
      state: number;
      stateDesc: string;
      gmtCreated: string;
    };
    packageCount: number;
  }[];
};

type SpaceParkType = {
  id: string; // 车场id(主数据车场bid)-对标阿丽塔车场masParkId
  name: string; // 车场名称(主数据车场名称)
};

type BlackListType = {
  id: number;
  parkName: string;
  plate: string;
  ownerName: string;
  remark: string;
  startTime: string;
  endTime: string;
};

type MerchantType = {
  projectId: string;
  id: string;
  merchantName: string;
  merchantType: string;
  status: number;
  adminsRel: {
    projectId: string;
    merchantId: string;
    accountBid: string;
    accountName: string;
    accountType: number;
    status: number;
    mobile: string;
    parkName: string;
    projectName: string;
    verifyCode: string;
  }[];
  legalPerson: string;
  img: string;
  projectName: string;
  creator: string;
  gmtCreated: string;
  mark: string;
};

type CouponType = {
  id: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  total: number;
  status: string;
  statusName: string;
  saleTotal: number;
  createTime: string;
};

type CouponSaleType = {
  id: string;
  orderCode: string;
  type: string;
  typeName: string;
  name: string;
  merchantName: string;
  salesTotal: number;
  creator: string;
  gmtCreated: string;
};

type CouponReceiveType = {
  id: string;
  projectId: string;
  cardId: string;
  userId: string;
  cardName: string;
  cardType: string;
  cardAmount: number;
  receiveCode: string;
  exchangePhone: string;
  exchangeTime: string;
  startTime: string;
  endTime: string;
  state: string;
  merchantName: string;
  merchantId: string;
};

type RecordUsedType = {
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: boolean;
  creator: string;
  updater: string;
  id: string;
  projectId: string;
  localTradeNo: string;
  parkName: string;
  parkId: string;
  merchantId: string;
  merchantName: string;
  couponId: string;
  couponName: string;
  couponType: string;
  couponValue: number;
  couponSource: string;
  upLimitDiscountType: string;
  upLimitDiscountValue: number;
  currDiscountPrice: number;
  currDiscountTime: number;
  plate: string;
  useTime: string;
  useStatus: string;
  orderId: string;
  tradeNo: string;
  userId: string;
  userType: string;
  usableStartTime: string;
  usableEndTime: string;
  effectiveDate: string;
  imgPath: string;
  receiveCode: string;
  eventName: string;
  eventType: string;
  usePhone: string;
  couponRecordId: string;
  version: number;
};

type VisitConfigType = {
  projectId: string;
  passFlag: number;
  otherPayFlag: number;
  passScope: [
    {
      parkId: string;
      channelId: string[];
    },
  ];
};

type BuildItemType = {
  bid: string;
  projectBid: string;
  buildingSpaceId: string;
  name: string;
};

type LtRefundType = {
  id: string;
  plate: string;
  inTime: string;
  outTime: string;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  bizType: string;
  payTime: string;
  payChannel: string;
  payType: string;
  invoiceStatus: string;
  refundAmount: number;
  maxRefundAmount: number;
};

type YzRefundType = {
  id: string;
  plate: string;
  packageName: string;
  packagePrice: number;
  packageTotal: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  bizType: string;
  payTime: string;
  payChannel: string;
  payType: string;
  invoiceStatus: string;
  refundAmount: number;
  maxRefundAmount: number;
};

type TradebillListType = {
  parkName: string;
  chkDate: string;
  result: string;
  thirdPlatform: string;
  checkType: string;
  thirdOrderNum: string;
  thirdTotalAmount: number;
  fee: number;
  realAmount: number;
  status: string;
};

type TradebillDetailType = {
  parkName: string;
  date: string;
  plate: string;
  thirdPlatform: string;
  thirdAccount: string;
  result: string;
  plateformTradeNo: string;
  thirdTradeNo: string;
  tradeTime: string;
  checkType: string;
  thirdTotalAmount: number;
  fee: number;
  realAmount: number;
};

type RefundRecordType = {
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: true;
  creator: string;
  updater: string;
  id: string;
  payOrderId: number;
  tradeId: number;
  orderId: number;
  parkId: number;
  plate: string;
  mobile: string;
  refundStatus: string;
  refundAmount: number;
  refundMethod: string;
  thirdTradeNo: string;
  refundStartTime: string;
  refundEndTime: string;
  remark: string;
  refundFailReason: string;
  refundUser: string;
  complaintOrder: string;
  payeeName: string;
  payeeAccount: string;
  refundType: string;
};

type RefundRecordDetailType = {
  tenantId: string;
  gmtCreated: string;
  gmtUpdated: string;
  deleted: true;
  creator: string;
  updater: string;
  id: number;
  payOrderId: number;
  tradeId: number;
  orderId: number;
  parkId: number;
  plate: string;
  mobile: string;
  refundStatus: string;
  refundAmount: number;
  refundMethod: string;
  thirdTradeNo: string;
  refundStartTime: string;
  refundEndTime: string;
  remark: string;
  refundFailReason: string;
  refundUser: string;
  complaintOrder: string;
  payeeName: string;
  payeeAccount: string;
  version: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  ltRecord: Record<string, any>;
  yzRecord: Record<string, any>;
};

type TransRecordsDetailYzType = {
  id: number;
  plate: string;
  parkName: string;
  orderId: number;
  ownerName: string;
  phone: string;
  carType: string;
  packageName: string;
  packageTotal: number;
  paidAmount: number;
  bizType: string;
  payType: string;
  payTypeName: string;
  payChannel: string;
  payChannelName: string;
  gmtCreated: string;
  totalAmount: number;
  discountAmount: number;
  inPicUrl: string;
  outPicUrl: string;
  refundAmount: number;
  packagePrice: number;
};

type TransRecordsDetailLtType = {
  id: number;
  plate: string;
  parkName: string;
  inTime: string;
  outTime: string;
  inChannel: string;
  outChannel: string;
  billingStart: string;
  billingEnd: string;
  authDate: string;
  ownerName: string;
  phone: string;
  orderStatus: string;
  orderStatusName: string;
  carType: string;
  orderId: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  payType: string;
  payTypeName: string;
  payChannel: string;
  bizType: string;
  payChannelName: string;
  paySuccessTime: string;
  refundStatus: string;
  refundAmount: number;
  gmtCreated: string;
  inPicUrl: string;
  outPicUrl: string;
  parkDuration: string;
  packagePrice: number;
};

type OpenGateRecordQueryType = {
  parkName: string;
  plate: string;
  passageModel: string;
  passageName: string;
  openTime: string;
  reason: string;
  imageUrl: string;
  operator: string;
  originId: string;
};

type UnusualReleaseRecordQueryType = {
  parkName: string;
  plate: string;
  passageName: string;
  passageModel: string;
  reason: string;
  exitTime: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  orderCode: string;
  orderStatus: string;
  originId: string;
};

type OpenGateDetailType = {
  originId: string;
  parkName: string;
  plate: string;
  enterPassage: string;
  exitPassage: string;
  entryTime: string;
  exitTime: string;
  releaseType: string;
  reason: string;
  enterImageUrl: string;
  exitImageUrl: string;
};

type ReleaseRecordDetailType = {
  originId: string;
  parkName: string;
  plate: string;
  enterPassage: string;
  exitPassage: string;
  entryTime: string;
  exitTime: string;
  releaseType: string;
  reason: string;
  enterImageUrl: string;
  exitImageUrl: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  orderCode: string;
  orderStatus: string;
};

type PlateChangeType = {
  parkName: string;
  packageType: number;
  packageTypeDesc: string;
  packageName: string;
  spaceId: string;
  spaceCode: string;
  originPlate: string;
  plate: string;
  operateSource: string;
  distribute: number;
  distributeDesc: string;
  gmtOperated: string;
  operator: string;
};

type OperateLogType = {
  parkName: string;
  plate: string;
  operateType: string;
  operateBusiness: string;
  packageType: number;
  packageName: string;
  operateSource: string;
  distribute: number;
  distributeDesc: string;
  gmtOperated: string;
  operator: string;
};

type BillErrListItem = {
  id: number;
  parkId: number;
  parkName: string;
  orderId: number;
  thirdOrderId: string;
  paySuccessTime: string;
  oldPayAmount: number;
  oldThirdTotalAmount: number;
  payAmount: number;
  thirdTotalAmount: number;
  checkType: number;
  chkDate: string;
  errType: number;
  chkResult: number;
  transState: number;
};

interface BillErrInfo {
  id: number;
  parkId: number;
  orderId: number;
  thirdOrderId: string;
  paySuccessTime: string;
  oldPayAmount: number;
  oldThirdTotalAmount: number;
  payAmount: number;
  thirdTotalAmount: number;
  checkType: number;
  chkDate: string;
  errType: number;
  chkResult: number;
  transState: number;
  remark: string;
  voucherUrl: string;
  updater: string;
}

interface ThirdOrder {
  payOrderId: string;
  amount: number;
  payChannel: string;
  payChannelName: string;
  payType: string;
  payTypeName: string;
}
