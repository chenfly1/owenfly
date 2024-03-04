type butlerPageType = {
  id: number; // ID
  tenantId: string; // 租户ID
  gmtCreated: string; // 创建时间
  gmtUpdated: string; // 修改时间
  creator: string; // 创建人
  updater: string; // 修改人
  deleted: boolean; // 是否已删除
  type: number; // 类型
  mode: string; // 模式
  staffId: number; // 员工ID
  name: string; // 名称
  sex: number; // 性别
  phone: string; // 电话
  status: number; // 状态
  creatorAccount: string; // 创建人账号
  projectName: string; // 项目名称
  projectBid: string; // 项目组织机构代码
  spaceName: string; // 空间名称
  spaceId: number; // 空间ID
};

interface Housekeeper {
  id: number; // 数据库主键
  tenantId: string; // 租户id
  gmtCreated: string; // 创建时间
  gmtUpdated: string; // 更新时间
  creator: string; // 创建者
  updater: string; // 更新者
  deleted: boolean; // 是否已删除
  type: number; // 类型：1项目管家 2房产管家
  projectBid: string; // 项目ID
  spaceId: number; // 空间ID
  mode: string; // 添加方式：0手动添加 1选择员工
  staffId: number; // 员工ID
  name: string; // 管家名称
  sex: number; // 管家性别 0女 1男
  phone: string; // 管家联系方式
  status: number; // 管家状态 0停用 1启用
  creatorAccount: string; // 创建人账号
}
