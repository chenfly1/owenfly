type FlowItemType = {
  id: number; // 主键编号
  bid: string; // 业务ID编号
  tenantId: string; // 租户id
  projectId: string; // 项目id
  modelId: string; // 模型id
  modelName: string; // 模型名称
  name: string; // 模型名称
  modelKey: string; // 模型key
  fileName: string; // 文件名称
  modelXml: string; // 模型xml
  modelXmlJson: string; // 模型 JSON 内容
  modelType: number; // 模型key
  formType: number; // 模型类型: 0 自定义流程 1是业务流程
  appSn: string; // 系统标识
  categoryCode: string; // 分类id
  status: number;
  ownDeptId: string;
  ownDeptName: string;
  flowOwnerNo: string;
  flowOwnerName: string;
  processDockingNo: string;
  processDockingName: string;
  applyCompanies: object;
  superuser: object;
  showStatus: number;
  authPointList: object;
  appliedRange: number;
  businessUrl: string;
  functionRange: string;
  skipSet: number;
  extendStatus: number;
  orderNo: number;
  url: string;
  formName: string;
  director: string;
};

type FormItemType = {
  id: number; // 主键编号
  bid: string; // 业务ID编号
  tenantId: string; // 租户id
  projectId: string; // 项目id
  categoryCode: string; // 分类编码
  title: string; // 表单标题
  code: string; // 表单编码
  name: string; // 表单名称
  formJson: string; // 表单JSON
  content: string; // html内容
  formStatus: number; // 发布状态（1：草稿；2：待发布；3：已发布；4：停用）
  version: string; // 版本号
  thirdServerUrl: string; // 服务地址
  gmtCreated: string; // 创建时间
  gmtCreator: string; // 创建人
  // todo: 租户名称。创建人，更新时间
};

type BpmnModelType = {
  id: number;
  bid: string;
  tenantId: string;
  tenantName: string;
  projectId: string;
  modelId: string;
  modelName: string;
  name: string;
  modelKey: string;
  fileName: string;
  modelXml: string;
  modelType: number;
  formType: number;
  appSn: string;
  categoryCode: string;
  status: number;
  ownDeptId: string;
  ownDeptName: string;
  flowOwnerNo: string;
  flowOwnerName: string;
  processDockingNo: string;
  processDockingName: string;
  showStatus: number;
  appliedRange: number;
  businessUrl: string;
  functionRange: string;
  skipSet: number;
  extendStatus: number;
  orderNo: number;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
};

type FlowInstanceItemType = {
  processInstanceId: string; // 流程实例id
  processDefinitionId: string;
  processDefinitionName: string;
  processDefinitionKey: string;
  processDefinitionType: number;
  formType: number;
  processDefinitionVersion: number;
  businessKey: string;
  tenantId: string;
  createTime: string;
  processStatus: string; // 流程实例状态
  processStatusName: string;
  formName: string;
  startPersonName: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  currentAssignees: [
    {
      type: string;
      code: string;
      name: string;
      mobile: string;
    },
  ];
};

type DicTypeItemType = {
  code: string;
  name: string;
  parentCode: string;
  description: string;
};

type DicItemType = {
  code: string;
  name: string;
  typeCode: string;
  description: string;
};

// 租户配置
type TenantSettingItemType = {
  id: number;
  bid: string;
  tenantId: string;
  tenantName: string;
  type: string;
  typeMsg: string;
  serverAddress: string;
  tag: string;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
};

// 流程配置
type FlowSettingType = {
  id: number;
  bid: string;
  tenantId: string;
  projectId: string;
  modelId: string;
  modelKey: string;
  userNotify: number;
  resultNotify: number;
  gmtCreated: string;
  gmtCreator: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: number;
};

/** 流程超时设置 */
type FlowTimeoutSettingItemType = {
  id: number;
  bid: string;
  tenantId: string;
  projectId: string;
  modelId: string;
  modelKey: string;
  taskDefKey: string;
  taskName: string;
  timeOutNum: number;
  timeOutUnit: number;
  timeOutHour: number;
  warnNum: number;
  warnUnit: number;
  warnHour: number;
  notifyInitiator: number;
  notifyNodeOwner: number;
  warnNotify: number;
  gmtCreator: string;
  gmtCreated: string;
  gmtUpdated: string;
  gmtUpdater: string;
  deleted: 0;
};

type FlowTimeoutSettingType = {
  list: FlowTimeoutSettingItemType[];
  timeOutNotify: number;
  userNotify: number;
  resultNotify: number;
};

type FlowInstanceDetailType = {
  processInstanceId: string;
  modelKey: string;
  modelName: string;
  businessKey: string;
  formName: string;
  gmtCreated: string;
  formData: string;
  starterUserBid: string;
  starterUserName: string;
  taskId: string;
  taskDefKey: string;
};
