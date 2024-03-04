import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { PreviewWidget } from '../designer/widgets';
import { getFlowDetail, getFlowFormData, getFormDetail, startFlow } from '@/services/flow';
import { Button, Space } from 'antd';
import { Form } from '@formily/core';
import { Events, WidgetActionEnum, WidgetEventEnum, WidgetMessageBody } from '../sdk/interface';
import { getMatchNode, safeParse } from './help';

export default () => {
  const formRef = useRef<Form | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const containerRef = useRef<any>();
  const [schema, setSchema] = useState({});
  const [extension, setExtension] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<{ [key in 'submit' | 'pass' | 'reject']?: boolean }>();
  const query = (useLocation() as any)?.query || {};

  // 消息处理
  const messageHandler = (event: { data: WidgetMessageBody }) => {
    try {
      const { id, action, payload } = event.data;
      if (id !== query.id) return;
      if (action === WidgetActionEnum.formInteraction && payload?.expression) {
        eval(`formRef.current?.${payload.expression}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 发送消息
  const sendMessage = (body: Omit<WidgetMessageBody, 'id'>) => {
    window.top?.postMessage(
      {
        id: query.id,
        ...body,
      },
      '*',
    );
  };

  // 发送操作钩子消息
  const sendOperateMessage = (
    action: Events.onFormSubmitStart | Events.onFormSubmitEnd,
    payload: {
      action: 'submit' | 'pass' | 'reject' | 'transfer';
      values: Record<string, any>;
      error?: any;
    },
  ) => {
    sendMessage({
      action: WidgetEventEnum.formEvent,
      payload: {
        action,
        payload,
      },
    });
  };

  // 获取表单实例, todo: 补充payload
  const getForm = (form: Form) => {
    formRef.current = form;
    form.subscribe(({ type }) => {
      switch (type) {
        case Events.onFormMount:
        case Events.onFormUnMount:
        case Events.onFormReset: {
          return sendMessage({
            action: WidgetEventEnum.formEvent,
            payload: {
              action: type,
            },
          });
        }
        case Events.onFieldValueChange: {
          return sendMessage({
            action: WidgetEventEnum.formEvent,
            payload: {
              action: type,
              payload: {
                value: undefined,
                newValue: undefined,
              },
            },
          });
        }
      }
    });
  };

  useEffect(() => {
    const { id, flowId, nodeName } = query;
    if (id) {
      Promise.all([
        getFormDetail({ modelKey: id }),
        flowId ? getFlowFormData(flowId) : Promise.resolve({}),
        getFlowDetail({ modelKey: id }),
      ])
        .then(([info, { formData }, { modelXmlJson }]) => {
          // 设置表单 schema
          setSchema(info?.formJson ? JSON.parse(info?.formJson) : {});
          // 暂时隐藏表单
          formRef.current?.setDisplay('hidden');
          // 设置表单值
          formRef.current?.setValues(formData ? JSON.parse(formData) : {});
          // 设置表单值显示状态
          const matchNode = getMatchNode(safeParse(modelXmlJson), nodeName);
          matchNode?.extension?.formAccess?.forEach((item: any) => {
            formRef.current?.setFieldState(item.field, (state) => {
              if (item.access === 'hidden') state.display = 'none';
              if (item.access === 'readonly') state.pattern = 'readPretty';
            });
          });
          // 显示表单
          formRef.current?.setDisplay('visible');
          setVisible(true);
          sendMessage({
            action: WidgetEventEnum.formEvent,
            payload: {
              action: Events.onFormReady,
              payload: {
                width: containerRef.current?.offsetWidth,
                height: containerRef.current?.offsetHeight,
              },
            },
          });
          // 设置扩展信息
          setExtension(matchNode?.extension);
        })
        .catch(() => {
          setSchema({});
        });
    }
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  // 提交表单
  const submit = async () => {
    await formRef.current?.validate();
    setLoading((prev) => ({ ...prev, submit: true }));
    formRef.current?.submit((values) => {
      const payload = {
        processDefinitionKey: query.id,
        formData: JSON.stringify(values),
      };
      sendOperateMessage(Events.onFormSubmitStart, {
        action: 'submit',
        values: payload,
      });
      setLoading((prev) => ({ ...prev, submit: true }));
      startFlow(payload)
        .then(() => {
          sendOperateMessage(Events.onFormSubmitEnd, {
            action: 'submit',
            values: payload,
          });
        })
        .catch((error) => {
          sendOperateMessage(Events.onFormSubmitEnd, {
            action: 'submit',
            values: payload,
            error,
          });
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, submit: false }));
        });
    });
  };

  // 通过操作
  const pass = async () => {
    await formRef.current?.validate();
    formRef.current?.submit((values) => {
      sendMessage({
        action: WidgetEventEnum.support,
        payload: {
          action: WidgetActionEnum.supportPass,
          config: { height: 300 },
          payload: {
            processInstanceId: query.flowId,
            taskId: query.taskId,
            formData: JSON.stringify(values),
          },
        },
      });
    });
  };

  // 拒绝操作
  const reject = async () => {
    await formRef.current?.validate();
    formRef.current?.submit((values) => {
      sendMessage({
        action: WidgetEventEnum.support,
        payload: {
          action: WidgetActionEnum.supportReject,
          config: { height: 300 },
          payload: {
            processInstanceId: query.flowId,
            taskId: query.taskId,
            formData: JSON.stringify(values),
          },
        },
      });
    });
  };

  // 转办操作
  const tranfer = async () => {
    formRef.current?.submit((values) => {
      sendMessage({
        action: WidgetEventEnum.support,
        payload: {
          action: WidgetActionEnum.supportTransfer,
          config: { height: 650 },
          payload: {
            processInstanceId: query.flowId,
            taskId: query.taskId,
            formData: JSON.stringify(values),
          },
        },
      });
    });
  };

  return (
    <div ref={containerRef}>
      <PreviewWidget schema={schema} getForm={getForm} />
      {query.action === 'create' && visible ? (
        <Button type="primary" loading={loading?.submit} onClick={submit}>
          提交
        </Button>
      ) : null}
      {query.action === 'handle' && visible ? (
        <Space>
          <Button danger loading={loading?.reject} onClick={reject}>
            拒绝
          </Button>
          <Button type="primary" loading={loading?.pass} onClick={pass}>
            通过
          </Button>
          <Button onClick={tranfer}>转办</Button>
        </Space>
      ) : null}
    </div>
  );
};
