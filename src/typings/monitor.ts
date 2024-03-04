type AlarmEventPageType = {
  id: number;
  eventCode: string;
  eventTypeCode: string;
  deviceId: string;
  deviceName: string;
  handleTime: string;
  photoUrls: string;
  handleStatus: string;
  notes: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  faceGroupName?: string;
};

type VideoRequestType = {
  deviceId: string; // 设备id
  expireTime?: 210; // url有效时长
  protocol: string; // 流播放协议 rtsp、rtmp、hls、wss、flv
  streamType: string; // 视频清晰度 高清(主码流):main_code_stream 流畅(子码流):sub_code_stream
  watchType: string; // 播放类型 实时监控:now 录像回放:pass
  startTime?: string; // 回放开始点
  stopTime?: string; // 回放结束点
  userType?: string; // 微信小程序:wx-app 钉钉小程序:dt-app pc端:pc
  videoPlayExpand?: Record<string, any>; // 视频播放拓展信息
  mock?: boolean; // 测试视频流 true 假数据 false帧数据
};

type VideoResultType = {
  url: string; // 视频流url
  deviceId: string; // 设备id
  deviceIndexCode: string; // 第三方设备唯一标识
  expireTime: string; // 视频流url过期时间点
  startTime: string; // 播放时间段开始点
  stopTime: string; // 播放时间段结束点
};

type DeviceVOListType = {
  id: number; // id
  key: string;
  thirdDeviceUid: string; // 第三方平台唯一编号
  tenantId: number; // 租户id
  name: string; // 设备名称
  typeCode: string; // 设备类型
  intelligenceType: number; // 设备智能类型0普通 1智能 2云控
  intelligenceTypeName: string; //普 智 控
  projectId: string; // 项目id
  projectName: string; // 项目名称
  spaceId: number; // 空间位置id
  spaceName: string; // 空间位置名称
  ip: string; // IP地址
  sn: string; // 序列号
  mac: string; // mac
  parentId: number; // 上级id
  thirdDevicePath: string; // 厂商平台路径
  model: string; // 设备型号
  showToApp: number; // C端客户是否可看 0否 1是
  brand: string; // 设备品牌
  status: number; // 设备状态 0离线 1在线
  gmtCreated: string; // 创建时间
  gmtCreator: string; // 数据创建人
  gmtUpdated: string; // 数据最新更新时间
  gmtUpdater: string; // 数据最新更新人
  deleted: number; // 设备逻辑删除字段数
};

type SpaceDeviceType = {
  devicesTotal: number; // 设备总数
  offlineDevicesCount: number; // 离线设备数量
  appDevicesCount: number; // APP可查看设备数量
  capableDevicesCount: 695; // 带能力设备数量
  spaceVO: {
    id: number; // Id
    name: string; // 物理节点名称
    devicesTotal: number; // 设备总数
    offlineDevicesCount: number; // 离线设备数量
    onlineDevicesCount: number; // 在线设备数量
    deviceVOList: DeviceVOListType[];
  };
  subSpaceVOList: [
    {
      id: number; // Id
      name: string; // 物理节点名称
      devicesTotal: 164; // 设备总数
      offlineDevicesCount: 138; // 离线设备数量
      onlineDevicesCount: 108; // 在线设备数量
      deviceVOList: DeviceVOListType[];
    },
  ];
};

type AlarmPlanPageType = {
  id?: string; // 主键ID
  tenantId: string; // 租户id
  eventTypeCode: string; // 事件类型
  description: string; // 告警描述
  eventLevel: number; // 事件等级 <enum>1-低、2-中、3-高</enum>
  handleType: number; // 处理预案 <enum>0-不处理、1-转工单、2-发通知</enum>
  notifyStaffId: number; // 通知人员
  gmtCreated: string; // 创建时间
  gmtCreator: string; // 数据创建人
  gmtUpdated: string; // 数据最新更新时间
  gmtUpdater: string; // 数据最新更新人
  deleted: number;
  status: number; // 告警类型
};

type AddAlarmPlanType = AlarmPlanPageType & {
  alarmPlanId?: 208; // 主键ID
};

type FaceGroupType = {
  id: number;
  projectBid: string;
  thirdId: number;
  code: string;
  name: string;
  brandCode: string;
  downRes: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: number;
};

type FaceInfoType = {
  id: number;
  projectBid: string;
  thirdId: number;
  faceGroupId: number;
  faceUrl: string;
  faceUri: string;
  name: string;
  idCard: string;
  phone: string;
  jobNum: string;
  departmentBid: string;
  departmentName: string;
  associateType: string;
  associatedBid: string;
  faceScore: number;
  faceCheckRes: string;
  downRes: string;
  brandCode: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: number;
};
type MonitoringTaskType = {
  id: number;
  projectBid: string;
  name: string;
  faceGroupId: number;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: number;
  status: number;
  deviceList: {
    id: number;
    monitoringTaskId: number;
    deviceName: string;
    deviceId: string;
    gmtCreated: string;
    gmtCreator: string;
    gmtUpdated: string;
    gmtUpdater: string;
    deleted: number;
  }[];
};

type FaceIntelligentGroupType = {
  id: number;
  projectBid: string;
  thirdId: string;
  faceGroupId: number;
  faceGroupName: string;
  faceUrl: string;
  name: string;
  sex: number;
  idCard: string;
  phone: string;
  jobNum: string;
  departmentBid: string;
  departmentName: string;
  associateType: string;
  associatedBid: string;
  faceScore: 925;
  faceCheckRes: string;
  downRes: string;
  brandCode: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  similarity: number;
};
type FaceIntelligentType = {
  deviceId: number;
  deviceName: string;
  devicePosition: string;
  beginCaptureTime: string;
  endCaptureTime: string;
  picCaptureInfoList: [
    {
      similarity: number;
      capturePicUrl: string;
      captureTime: string;
    },
  ];
};
type CommandType = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

type ProjectBrandConfigDetailType = {
  brandConfigId: number; // 主键ID
  brandCode: string; // 平台编号
  tenantId: number;
  projectId: number; // 项目id
  key: string; // Key
  secret: string; // Secret
  deployType: number; // 平台部署类型。1-SaaS部署，2-本地私有化部署
  address: string; // 地址
  gmtCreated: string; // 创建时间
  gmtCreator: string; // 数据创建人
  gmtUpdated: string; // 数据最新更新时间
  gmtUpdater: string; // 数据最新更新人
  subBrandConfig: Record<string, any>;
  controlEnable: number;
};
