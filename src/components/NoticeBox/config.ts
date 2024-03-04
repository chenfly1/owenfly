/** 消息类型 */
export enum NoticeType {
  alert = 'alert',
}

/** 消息类型映射表 */
export const NoticeTypeMap = Object.entries({
  [NoticeType.alert]: [
    'ALERT_BATTERY',
    'ALERT_CHARGE',
    'ALERT_HIGH',
    'ALERT_PERIMETER',
    'ALERT_FALL',
    'ALERT_BLACK',
    'ALERT_DEPLOYMENT',
    'ALERT_ENTRY',
  ],
}).reduce(
  (prev, [key, value]) => ({
    ...prev,
    ...value.reduce((p, c) => ({ ...p, [c]: key }), {}),
  }),
  {},
);

/** 消息盒子内容类型 */
export enum NoticeBoxType {
  notice = 'notice',
  todo = 'todo',
}

/** 消息状态 */
export enum NoticeStatus {
  Unread = 0,
  Read = 1,
}

/** 工单状态 */
export enum WorkorderStatus {
  Pending = 1,
  Processing = 2,
  Doing = 3,
  Done = 4,
  Cancel = 5,
}

/** 工单查询类型 */
export enum WorkorderQueryType {
  SelfSubmit = 1,
  GroupTodo = 2,
  SelfApprove = 3,
}

/** 工单查询排序字段 */
export enum WorkorderQueryField {
  gmtCreated = 'gmtCreated',
  gmtUpdated = 'gmtUpdated',
}

export type NoticeBoxItemType = Pick<NoticeItemType, 'id' | 'type' | 'title' | 'gmtCreated'>;
export type NoticeBoxListType = { list: NoticeBoxItemType[]; total: number } & {
  loading?: boolean;
};
export const generateListValue = () => ({ list: [], total: 0, loading: false });

/** 消息状态 */
export const NoticeStatusMap = {
  [NoticeStatus.Unread]: '未读',
  [NoticeStatus.Read]: '已读',
};
