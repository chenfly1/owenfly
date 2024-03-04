// 仪表信息
type MeterItemType = {
  id: string;
  syncId: string;
  cnName: string;
  syncAddress: string;
  installationSpaceName: string;
  installationSpaceId: number;
  meterSpaceId: number;
  meterSpaceFullName: string;
  publicType: number;
  publicTypeName: string;
  insTagId: number;
  insTagName: string;
  insType: number;
  insTypeName: string;
  netState: number;
  netStateName: string;
  installationState: number;
  installationStateName: string;
  registrationTime: string;
  parentInsId: number;
  updateInsTagTime: string;
  tagUpdater: string;
};

// 计量位置信息
type MeasureItemType = {
  id: string;
  meterSpaceName: string;
  creator: string;
  gmtCreated: string;
};

// 分项信息
type CategoryItemType = {
  id: number;
  insType: string;
  insTypeName: string;
  insTagName: string;
  cnName: string;
  remark: string;
  gmtCreated: string;
  creator: string;
};

// 计量位置树
interface MeasureTreeType {
  key: string;
  title: string;
  data: MeasureItemType;
  children: MeasureTreeType[];
}

// 计量位置请求响应结构
interface MeasureResTreeType {
  item: MeasureItemType;
  children: MeasureResTreeType[];
}

// 预警事件类型
type EnergyWarningEventType = {
  id: number;
  insType: number;
  insTypeName: number;
  cnName: string;
  monitorState: number;
  monitorStateName: string;
  monitorTypeId: number;
  monitorTypeName: string;
};

// 预警监测点类型
type EnergyMonitorType = {
  id: number;
  monitorId: number;
  cnName: string;
  periodType: number;
  periodTypeName: string;
  pointType: number;
  pointTypeName: string;
  limitSize: number;
  relId: string;
};

// 预警监测点实例
type EnergyMonitorInstance = {
  id: number;
  monitorId: number;
  monitorName: string; // 预警任务名称
  monitorTypeId: number; //  预警类别
  monitorTypeName: string; // 预警类别名称
  monitorPointId: number; // 监测点id
  monitorPointName: string; // 监测点名称
  limitSize: number; // 预警值
  totalSize: number; // 实际用量
  overSize: number; // 超额用量
  gmtCreated: string; // 创建时间，预警时间
  periodTypeName: string; // 周期
  insType: number;
  insTypeName: string;
};

// 碳系数配置
type CarbonConfigType = {
  cnName: string; // 名称
  energyType: number; // 能源类型
  energyTypeName: string; // 能源类型名称
  carbon: string; // 碳排放，单位/kg
  carbonDioxide: string; // 二氧化碳排放，单位/kg
  co2: string; // 碳->二氧化碳折算系数
  state: number; // 状态码
  stateName: string; // 状态名称
  gmtCreated: string; // 创建时间
  gmtUpdated: string; // 更新时间
  updater: string; // 操作人
};

// 碳系数修改记录
type CarbonConfigHistory = {
  before: CarbonConfigType;
  after: CarbonConfigType;
  gmtUpdated: string;
  updater: string;
};

// 碳指标记录
type CarbonIndicatorType = {
  id: number;
  cnName: string; // 指标名称
  energyType: number; // 能源类型
  periodType: number; // 统计周期
  periodTypeName: string; // 统计周期名称
  state: number; // 状态
  stateName: string; // 状态名称
  carbonLimit: number; // 碳排放目标值
  gmtCreated: string;
  gmtUpdated: string;
  updater: string;
  remark: string;
};

// 指标绑定仪表
type CarbonIndicatorBindMeterType = {
  id: number;
  syncId: string;
  cnName: string;
  syncAddress: string;
  installationSpaceName: string;
  installationSpaceId: number;
  meterSpaceId: number;
  meterSpaceFullName: string;
  insType: number;
  insTypeName: string;
  bindingTime: string;
};

// 仪表原始数据
type MeterReadingType = {
  insId: number; // 仪表id
  syncId: string; // 厂商表号
  meterSpaceId: number; // 计量位置spaceId
  meterSpaceFullName: string; // 计量位置名称
  insTagId: number; // 分项id
  insTagName: string; // 分项名称
  publicType: number; // 公区类型
  publicTypeName: string; // 公区类型名称
  readTimestamp: string; // 抄表时间
  readOfTotal: number; // 仪表总读数
  readOfA: number; // 仪表分读数a
  readOfB: number; // 仪表分读数b
  readOfC: number; // 仪表分读数c
  readOfD: number; // 仪表分读数d
};

// 用量读数
type MeterReadingItem = {
  time: string;
  readOfTotal: number;
  readOfA: number;
  readOfB: number;
  readOfC: number;
  readOfD: number;
};

// 报表数据
type EnergyReportType = {
  recordDt: string; // 日期
  insType: number; // 仪表类型
  insTypeName: string; // 仪表类型名称
  insId: number; // 仪表id
  syncId: string; // 厂商表号
  insName: string; // 仪表名称
  meterSpaceId: number; // 计量位置spaceId
  meterSpaceFullName: string; // 计量位置名称
  installationSpaceName: string; // 安装位置名称
  installationSpaceId: number; // 安装位置 id
  insTagId: number;
  insTagName: string;
  publicType: number;
  publicTypeName: string;
  parentInsId: number; // 主表仪表id
  parentSyncId: string; // 主表编号
  inCloudChild: number; // 是否含从表，0是，1否
  inCloudChildStr: string; // 是否含从表
  increment: number; // 用量
  realCarbonSize: string; // 碳排放，kg
  carbonDioxide: string; // 二氧化碳排放，单位/kg
  readDetail: MeterReadingItem; // 用量
  carbonSizeDetail: MeterReadingItem; // 碳排放
  carbonDioxideDetail: MeterReadingItem; // 二氧化碳排放
};

// 用量统计信息
type EnergyStatementType = {
  topSum: number; // 主仪表总用量
  topCarbonSum: string; // 主仪表碳排放，kg
  leafSum: number; // 最小节点仪表累计
  leafCarbonSum: string; // 最小节点仪表碳排放，kg
  raceOfLoss: string; // 损耗
};

// 统计量响应信息
type ConsumptionStatisticRes = {
  currentMonth: MeterReadingItem; // 当月用量
  lastMonth: MeterReadingItem; // 上月用量
  precedingMonth: MeterReadingItem; // 前月用量
  compare: number;
};

// 能耗超限统计量响应信息
type WarningStatisticRes = {
  today: number;
  yesterday: number;
  precedingDay: number;
  currentMonth: number;
  lastMonth: number;
  compareYesterday: number;
  compareLastMonth: number;
};

// 碳指标统计量响应信息
type CarbonStatisticRef = {
  today: {
    carbon: number;
    carbonDioxide: number;
  };
  month: {
    carbon: number;
    carbonDioxide: number;
  };
  year: {
    carbon: number;
    carbonDioxide: number;
  };
  compare: number;
};

// 折碳分析
type CarbonAnalysis = {
  id: number;
  indexId: number; // 指标id
  cnName: string; // 指标名称
  periodType: number; // 统计周期
  periodTypeName: string; // 统计周期名称
  co2: string; // 折碳系数
  carbonLimit: string; // 碳排放目标值
  realCarbonSize: string; // 实际折碳值
  overSize: string; // 超额用量
  gmtCreated: string; // 开始时间
  ds: string; // 对应周期
};

// 折碳分析, 仪表用量明细
type MeterCarbonAnalysis = {
  indexRecordId: number;
  id: number;
  syncId: string;
  cnName: string;
  insType: number;
  insTypeName: string;
  installationSpaceName: string;
  installationSpaceId: number;
  meterSpaceId: number;
  meterSpaceFullName: string;
  realCarbonSize: string;
};

// 折碳分析详情
type CarbonAnalysisDetail = {
  info: CarbonAnalysis;
  insDetails: MeterCarbonAnalysis[];
};

// 预警详情信息
type WarningStatisticDetailRes = {
  count: number;
  electricity: number;
  water: number;
  race: number;
};
// 分页查询用能分析
type MeterRecordType = {
  recordDt: string; // 日期
  gmtCreated: string; // 生成时间
  insId: number; // 仪表id
  syncId: string; // 厂商表号
  insType: number; // 仪表类型
  insTypeName: string; // 仪表类型名称
  insName: string; // 仪表名称
  meterSpaceId: number; // 计量位置spaceId
  meterSpaceFullName: string; // 计量位置名称
  insTagId: number; // 分项id
  insTagName: string; // 分项名称
  publicType: number; // 公区类型
  publicTypeName: string; // 公区类型名称
  currPeriod: {
    // 本期读数
    readOfTotal: number; // 仪表总读数
    readOfA: number; // 仪表分读数a
    readOfB: number; // 仪表分读数b
    readOfC: number; // 仪表分读数c
    readOfD: number; // 仪表分读数d
  };
  priorPeriod: {
    // 上期读数
    readOfTotal: number; // 仪表总读数
    readOfA: number; // 仪表分读数a
    readOfB: number; // 仪表分读数b
    readOfC: number; // 仪表分读数c
    readOfD: number; // 仪表分读数d
  };
  increment: {
    // 增量读数
    readOfTotal: number; // 仪表总读数
    readOfA: number; // 仪表分读数a
    readOfB: number; // 仪表分读数b
    readOfC: number; // 仪表分读数c
    readOfD: number; // 仪表分读数d
  };
  recordType: number; // 录入方式
  recordTypeName: string; // 录入方式名称
  currPeriodStr: string;
  priorPeriodStr: string;
  incrementStr: string;
};

type InsTagCollectType = {
  averageDosage: string;
  maximumProportion: string;
  minimumProportion: string;
  minimumName: string;
  maximumName: string;
  dosageDetail: {
    insTagId: string;
    insTagName: string;
    dosage: string;
  }[];
};
type InsTagColumnarType = {
  insTagId: string;
  insTagName: string;
  columnars: {
    meterSpaceName: string;
    dosage: string;
  }[];
}[];
type InsTreePageType = {
  insId: number;
  syncId: string;
  insName: string;
  insType: number;
  insTypeName: string;
  meterSpaceId: number;
  meterSpaceFullName: string;
  currPeriod: {
    readOfTotal: number;
    readOfA: number;
    readOfB: number;
    readOfC: number;
    readOfD: number;
  };
  priorPeriod: {
    readOfTotal: number;
    readOfA: number;
    readOfB: number;
    readOfC: number;
    readOfD: number;
  };
  rateOfLoss: number;
};

type MeterRecordDetailType = {
  currTotalSize: number;
  totalSize: number;
  records: {
    time: string;
    readOfTotal: number;
    readOfA: number;
    readOfB: number;
    readOfC: number;
    readOfD: number;
  }[];
};

type InsStatePageType = {
  id: number;
  insId: number;
  stateTypeId: number;
  stateTypeName: string;
  value: string;
  gmtCreated: string;
};

type InsTreeDetailType = {
  insId: string;
  syncId: string;
  insName: string;
  parentInsId: number;
  meterSpaceFullName: string;
  currPeriod: {
    time: string;
    readOfTotal: number;
    readOfA: number;
    readOfB: number;
    readOfC: number;
    readOfD: number;
  };
  priorPeriod: {
    time: string;
    readOfTotal: number;
    readOfA: number;
    readOfB: number;
    readOfC: number;
    readOfD: number;
  };
  rateOfParent: number;
  children: InsTreeDetailType[];
  level: number;
};
