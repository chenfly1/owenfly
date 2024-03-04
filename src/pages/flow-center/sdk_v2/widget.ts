import React from 'react';
import {
  WidgetActionEnum,
  WidgetEventEnum,
  WidgetForm,
  WidgetListener,
  WidgetMessageBody,
  WidgetOptions,
  formMethods,
} from './interface';
import Form from './form';
import ReactDOM from 'react-dom';

export class Widget {
  private options: WidgetOptions;
  private form?: WidgetForm;
  private listener?: WidgetListener;

  constructor(options: WidgetOptions) {
    const validRes = this.checkValid(options);
    if (!validRes.valid) {
      throw new Error(validRes.msg);
    }
    this.options = options;
    this.render();
    this.form = this.createForm();
  }

  private checkValid(options: WidgetOptions) {
    const res = { valid: false, msg: '[FormWidget]:' };
    if (!options.id) {
      res.msg += `id 是必须参数`;
    } else if (!options.flowId && !options.flowInstanceId) {
      res.msg += `flowId 和 flowInstanceId 必须传一个值`;
    } else {
      res.valid = true;
    }
    return res;
  }

  // 获取表单方法
  get() {
    return this.form;
  }

  // 渲染页面
  private render() {
    ReactDOM.render(React.createElement(Form, this.options), this.options.element);
    window.addEventListener('message', (event: { data: WidgetMessageBody }) => {
      const body = event.data || {};
      if (body.id === this.options.id) {
        if (body.action === WidgetEventEnum.formEvent) {
          const { action: formAction, payload } = body.payload || {};
          this.listener?.({
            action: formAction,
            payload,
          });
        }
      }
    });
  }

  /** 发送消息 */
  private sendMessage(body: Omit<WidgetMessageBody, 'id'>) {
    window?.postMessage(
      {
        id: this.options.id,
        ...body,
      },
      '*',
    );
  }

  /** 创建表单 */
  private createForm() {
    return formMethods.reduce(
      (prev, method) => {
        return {
          ...prev,
          [method]: (...args: any) => {
            const expression = `${method}(${args
              .map((item: any) => (typeof item === 'object' ? JSON.stringify(item) : item))
              .join(',')})`;
            this.sendMessage({
              action: WidgetActionEnum.formInteraction,
              payload: {
                method,
                expression,
              },
            });
          },
        };
      },
      {
        getValues: () => {
          this.sendMessage({
            action: WidgetActionEnum.formGetValues,
          });
        },
        subscribe: (listener: (data: { action: string; payload: any }) => void) => {
          this.listener = listener;
        },
      } as WidgetForm,
    );
  }
}

export default class Service {
  // 用户信息
  static userInfo: Record<string, any>;
  // 挂件实例
  static widgetMap = new Map<string, Widget>();

  // 渲染
  static render(options: WidgetOptions) {
    if (Service.widgetMap.has(options.id)) return Service.widgetMap.get(options.id);
    const instance = new Widget({
      userInfo: Service.userInfo,
      ...options,
    });
    Service.widgetMap.set(options.id, instance);
    return instance.get();
  }

  // 获取表单
  static get(id: string) {
    return Service.widgetMap.get(id)?.get();
  }
}
