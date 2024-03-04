// 工单分页查询
interface WorkOrderType {
  [x: string]: any;
  customUser: any;

  id: number; // 主键
  workorderNo: string; // 工单编号
  presenterBid: string; // 提单人bid
  presenterName: string; // 提单人名称
  presenterPhone: string; // 提单人手机号
  handlerBid: string; // 处理人bid
  handlerName: string; // 处理人名称
  categoryId: number; // 工单类型ID
  categoryName: string; // 类型名称
  location: string; // 位置
  attachments?: string; // 附件
  status: number; // 工单状态：1待受理，2处理中，3已转办，4已完成，5已取消
  description: string; // 描述
  source: number; // 工单来源
  tenantId: number; // 租户id
  projectId: number; // 项目ID
  creator: string; // 创建人
  gmtCreated: string; // 创建时间
  gmtUpdated: string; // 更新时间
  list: WorkOrderProcessType[]; // 工单流程列表
}

interface WorkOrderProcessType {
  id: number; // 主键
  workorderId: number; // 工单ID
  processCreatorId: string; // 流程创建人bid
  processCreatorName: string; // 流程创建人名称
  nextHandlerBid: string; // 下一个流程处理人bid
  nextHandlerName: string; // 下一个流程处理人名称
  attachments?: string; // 附件
  status: number; // 工单状态：1待受理，2处理中，3已转办，4已完成，5已取消
  statusName: number; // 工单状态名称
  description: string; // 描述
  tenantId: number; // 租户id
  projectId: number; // 项目ID
  gmtCreated: string; // 创建时间
  gmtUpdated: string; // 更新时间
  detail: string; // 详情
  title: string;
}

//字典列表
interface Group {
  groupCode: string;
  groupName: string;
}

interface WorkOrderSource {
  find: any;
  groupCode: string;
  groupName: string;
  code: string;
  name: string;
  value?: string;
}

// 工单类型树结构查询
interface Category {
  id: number;
  key?: number;
  title?: string;
  name: string;
  code: string;
  customUser: number;
  parentId: number;
  description: string;
  creator: string;
  updater: string;
  children?: Category[];
  childList: Category[];
}

//工单类型
interface CascaderOption {
  value: number;
  label: string;
  children?: CascaderOption[];
  options?: CascaderOption[];
}

// 工单类型-用户关系表分页查询
interface DataType {
  [x: string]: any;
  map: any;
  forEach: any;
  items: any;
  key?: any;
  id: number;
  name: string;
  categoryId: number;
  userBid: string;
  userName: string;
  account: string;
  mobile: string;
  roles: string;
  tenantId: number;
  projectId: number;
  creator: string;
  gmtCreated: string;
  updater: string;
  gmtUpdated: string;
  deleted: number;
  rolesTexts: string[];
}
