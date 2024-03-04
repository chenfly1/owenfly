import { createIframe, getFormUrl, getSupportUrl } from './help';
import {
  WidgetOptions,
  WidgetActionEnum,
  WidgetEventEnum,
  WidgetMessageBody,
  WidgetListener,
  formMethods,
  WidgetForm,
} from './interface';
import * as Modal from './modal';

export class Widget {
  private options: WidgetOptions & { supportId: string; listener?: WidgetListener };
  private iframe?: HTMLIFrameElement;
  private supportIframe?: HTMLIFrameElement;
  private form?: WidgetForm;
  constructor(options: WidgetOptions) {
    this.options = {
      ...options,
      supportId: `${options.id}_support`,
    };
    this.render();
    this.form = this.createForm();
  }

  private render() {
    const { id, supportId, element, flowId, taskId, action, nodeName } = this.options;
    const url = getFormUrl({ id, flowId, taskId, action, nodeName });
    this.iframe = createIframe({
      id,
      url,
      element,
      loadedCallback: () => {
        const { content } = Modal.createModal(getSupportUrl({ id: `${id}_support` }));
        this.supportIframe = content;
      },
    });
    window.addEventListener('message', (event: { data: WidgetMessageBody }) => {
      const body = event.data || {};
      if (body.id === id) {
        // 监听挂件页面消息
        if (body.action === WidgetEventEnum.support) {
          Modal.setContentStyle(body.payload?.config);
          this.supportIframe?.contentWindow?.postMessage({
            id: supportId,
            ...(body.payload || {}),
          });
        } else if (body.action === WidgetEventEnum.formEvent) {
          const { action: formAction, payload } = body.payload || {};
          this.options.listener?.({
            action: formAction,
            payload,
          });
        }
      } else if (body.id === supportId) {
        // 监听挂件附属支持页面消息
        if (body.action === WidgetEventEnum.supportOpen) {
          Modal.open();
        }
        if (body.action === WidgetEventEnum.supportClose) {
          Modal.close();
        }
        if (body.action === WidgetEventEnum.formEvent) {
          const { action: formAction, payload } = body.payload || {};
          this.options.listener?.({
            action: formAction,
            payload,
          });
        }
      }
    });
  }

  getForm() {
    return this.form;
  }

  /** 发送消息 */
  private sendMessage(body: Omit<WidgetMessageBody, 'id'>) {
    this.iframe?.contentWindow?.postMessage(
      {
        id: this.options.id,
        ...body,
      },
      '*',
    );
  }

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
          this.options.listener = listener;
        },
      } as WidgetForm,
    );
  }
}

export class FormWidget {
  static widgetMap = new Map<string, Widget>();

  static render(
    {
      id,
      options,
    }: {
      id: string; // 唯一标志，用户自定义即可
      options: {
        flowId?: string; // 流程 ID, 启动流程的场景必传
        flowInstanceId?: string; // 流程实例 ID, 流程处理的场景必传
        actions?: string[]; // 操作项控制配置，可选值包括："submit" | "pass" | "reject" | "transfer"
      };
    },
    element: HTMLElement,
  ) {
    FormWidget.widgetMap.set(
      id,
      new Widget({
        id,
        ...options,
        element,
      }),
    );
  }

  static get(id: string) {
    return FormWidget.widgetMap.get(id);
  }
}
