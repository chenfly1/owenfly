// 操作可选项
export enum WidgetAction {
  submit = 'submit',
  pass = 'pass',
  reject = 'reject',
  transfer = 'transfer',
  back = 'back',
  jump = 'jump',
}

// 挂件实例配置
export interface WidgetOptions {
  id: string; // 唯一标志，用户自定义即可
  element: Element; // 挂在的元素
  flowId?: string; // 流程 ID, 启动流程的场景必传
  flowInstanceId?: string; // 流程实例 ID, 流程处理的场景必传
  actions?: WidgetAction[] | false; // 操作项控制配置
  userInfo?: Record<string, any>; // 用户信息
}

// 表单监听方法
export type WidgetListener = (body: { action: string; payload: any }) => void;

// 表单方法
export const formMethods = [
  'setValues',
  'setState',
  'setFieldState',
  'reset',
  'validate',
  'getValueIn',
] as const;

// 表单方法集合
export type WidgetForm = {
  getValues: () => void;
  subscribe: (listener: (data: { action: string; payload: any }) => void) => void;
} & {
  [key in (typeof formMethods)[number]]: (...args: any) => void;
};

// 触发动作
export enum WidgetActionEnum {
  formInteraction = 'action_form_interaction',
  formGetValues = 'action_form_get_values',
  supportSubmit = 'action_support_submit',
  supportPass = 'action_support_pass',
  supportReject = 'action_support_reject',
  supportTransfer = 'action_support_transfer',
}

// 监听事件
export enum WidgetEventEnum {
  formEvent = 'event_form_event',
  support = 'event_support',
  supportOpen = 'event_support_open',
  supportClose = 'event_support_close',
  // 保留事件类型
  supportSubmit = 'event_support_submit',
  supportPass = 'event_support_pass',
  supportReject = 'event_support_reject',
  supportTransfer = 'event_support_transfer',
}

// 消息类型
export interface WidgetMessageBody {
  id: string; // 唯一标志
  action: string; // 动作说明
  payload?: Record<string, any>; // 附加数据
}

export enum Events {
  onFormMount = 'onFormMount',
  onFormUnMount = 'onFormUnMount',
  onFormSubmitStart = 'onFormSubmitStart',
  onFormSubmitEnd = 'onFormSubmitEnd',
  onFormReset = 'onFormReset',
  onFormReady = 'onFormReady',
  //   onFieldMount = 'onFieldMount',
  //   onFieldUnmount = 'onFieldUnmount',
  //   onFieldReset = 'onFieldReset',
  onFieldValueChange = 'onFieldValueChange',
}
