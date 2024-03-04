type visitApplyItem = {
  uuid: string;
  visitorName: string;
  authStatus: number;
  visitorPhoneNo: string;
  visitorReason: string;
  visitorFacePic?: string;
  visitorCarNo?: string;
  visitorVehicleLicense?: string;
  visitorValidCount?: number;
  visitorSex?: number; // 访客性别(0:男;1女)

  state: number; // 状态: 0 失效; 1 有效
  visitorLogStatus: number; // 访客单状态 0：待审核 1：已审核(待来访) 2：已取消 3：已拒绝4:已过期5.已来访6.已结束
  visitorLogStatusMsg: string;

  limitStartTime: string;
  limitEndTime: string;
  during?: string;
  invitationTime: string;
  invitationTimeStr: string;
  approvalTime: string;
  areaName?: string;
  passingAreaName?: string;

  ownerName: string;
  ownerPhoneNo: string;
  ownerRoomAddress?: string;
  ownerRoomId?: string;
  ownerGarageCode?: string; // 授权车场编码
  ownerGarageName?: string;
  ownerBuildingName: string;

  source?: number; // 来源（10:科世达预约、20:小程序邀约 30:思科智慧城）
};

type visitPassItem = {
  id: number;
  visitorName: string;
  visitorPhoneNo: string;
  visitorReason: string;
  visitorValidCount?: number;
  visitorIdentityCard?: string;
  visitorSex?: number; // 访客性别(0:男;1女)
  visitorType?: number; // 预约邀约类型（0：邀约、1：预约）
  visitorFacePic?: string;
  faceSceneUrl?: string; // 现场抓拍
  deviceName: string;
  deviceUid: string;
  devicePositionName: string; // 设备安装位置名称

  accessTime: string;
  accessType: string; // 通行方式1：ic设备，2：蓝牙设备，3：二维码设备，4：人脸设备
  inOutType: number; // 出入类型：0进出，1进，2出
  passingAreaName?: string;

  ownerName: string;
  ownerPhoneNo: string;
  enterprise: string; // 企业单位
};
