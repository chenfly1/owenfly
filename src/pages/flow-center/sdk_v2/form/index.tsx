/* eslint-disable @typescript-eslint/no-shadow */
import { useEffect, useRef, useState } from 'react';
import { PreviewWidget } from '../../designer/widgets';
import {
  getFlowDetail,
  getFlowInstanceDetail,
  getFormDetail,
  handlerFlow,
  passFlow,
  rejectFlow,
  startFlow,
  transferFlow,
} from '@/services/flow';
import { Button, Space } from 'antd';
import { Form } from '@formily/core';
import {
  Events,
  WidgetAction,
  WidgetActionEnum,
  WidgetEventEnum,
  WidgetMessageBody,
  WidgetOptions,
} from '../interface';
import { processWidgetAction, startWidgetAction } from '../constant';
import { getMatchNode, safeParse } from './help';
import RejectModal from './action/reject';
import PassModal from './action/pass';
import TransferModal from './action/transfer';
import BackModal from './action/back';

export default (props: WidgetOptions) => {
  const containerRef = useRef<any>();
  const formRef = useRef<Form | null>(null);
  const passRef = useRef<any>();
  const rejectRef = useRef<any>();
  const transferRef = useRef<any>();
  const backRef = useRef<any>();
  const [action, setAction] = useState<WidgetAction[]>([]);
  const [info, setInfo] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState({});
  const [loading, setLoading] = useState<{ [key in WidgetAction]?: boolean }>();

  // 消息处理
  const messageHandler = (event: { data: WidgetMessageBody }) => {
    try {
      const { id, action, payload } = event.data;
      if (id !== props.id) return;
      if (action === WidgetActionEnum.formInteraction && payload?.expression) {
        console.log(44, `formRef.current?.${payload.expression}`);
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
        id: props.id,
        ...body,
      },
      '*',
    );
  };

  // 发送操作钩子消息
  const sendOperateMessage = (
    action: Events.onFormSubmitStart | Events.onFormSubmitEnd,
    payload: {
      action: WidgetAction;
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

  // 获取表单操作方法
  const getAction = () => {
    const { flowId, flowInstanceId, actions } = props;
    if (actions === false) return [];
    if (flowInstanceId) {
      return actions?.length
        ? processWidgetAction.filter((item) => actions.includes(item))
        : processWidgetAction;
    }
    if (flowId) {
      return actions?.length
        ? startWidgetAction.filter((item) => actions.includes(item))
        : startWidgetAction;
    }
    return [];
  };

  // 依据流程实例获取信息
  const getInfo = async () => {
    const { id, flowId, flowInstanceId } = props;
    if (flowInstanceId) {
      const { modelKey, formData, taskId, taskDefKey } = await getFlowInstanceDetail(
        flowInstanceId,
      );
      const info: any = {
        start: false,
        formData: safeParse(formData),
        taskId,
        taskDefKey,
      };
      if (modelKey) {
        const [{ formJson }, { modelXmlJson }] = await Promise.all([
          getFormDetail({ modelKey }).catch(() => ({} as any)),
          getFlowDetail({ modelKey }).catch(() => ({} as any)),
        ]);
        info.formJSON = safeParse(formJson);
        info.xmlJSON = safeParse(modelXmlJson);
      }
      return info;
    }
    if (flowId) {
      const [{ formJson }, { modelXmlJson }] = await Promise.all([
        getFormDetail({ modelKey: flowId }).catch(() => ({} as any)),
        getFlowDetail({ modelKey: flowId }).catch(() => ({} as any)),
      ]);
      return {
        start: true,
        formJSON: safeParse(formJson),
        xmlJSON: safeParse(modelXmlJson),
      };
    }
    if (id) {
      // 尝试渲染表单
      const { formJson } = await getFormDetail({ modelKey: flowId }).catch(() => ({} as any));
      return {
        start: true,
        formJSON: safeParse(formJson),
      };
    }
    return null;
  };

  useEffect(() => {
    getInfo()
      .then((info) => {
        if (!info) return setSchema({});
        // 设置表单 schema
        setSchema(info.formJSON);
        if (!info.start) {
          // 暂时隐藏表单
          formRef.current?.setDisplay('hidden');
          // 设置表单值
          formRef.current?.setValues(info.formData);
          // 设置表单值显示状态
          const matchNode = getMatchNode(info.xmlJSON, info.taskDefKey);
          console.log(88, matchNode);
          matchNode?.extension?.formAccess?.forEach((item: any) => {
            formRef.current?.setFieldState(item.field, (state) => {
              if (item.access === 'hidden') state.display = 'none';
              if (item.access === 'readonly') state.pattern = 'readPretty';
            });
          });
          formRef.current?.setDisplay('visible');
        }
        setInfo(info);
        setAction(getAction());
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
      })
      .catch(() => {
        setSchema({});
      });
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  // 操作方法
  const createHandler = async (
    action: WidgetAction,
    values: object,
    req: () => Promise<any>,
    loading = false,
  ) => {
    try {
      sendOperateMessage(Events.onFormSubmitStart, {
        action,
        values,
      });
      if (loading) {
        setLoading((prev) => ({ ...prev, [action]: true }));
      }
      await req();
      if (loading) {
        setLoading((prev) => ({ ...prev, [action]: false }));
      }
      sendOperateMessage(Events.onFormSubmitEnd, {
        action,
        values,
      });
      return true;
    } catch (error) {
      if (loading) {
        setLoading((prev) => ({ ...prev, [action]: false }));
      }
      sendOperateMessage(Events.onFormSubmitEnd, {
        action,
        values,
        error,
      });
      return false;
    }
  };

  // 提交表单
  const submit = async () => {
    await formRef.current?.validate();
    setLoading((prev) => ({ ...prev, submit: true }));
    formRef.current?.submit((values) => {
      const payload = {
        processDefinitionKey: props.flowId,
        formData: JSON.stringify(values),
      };
      createHandler(WidgetAction.submit, payload, () => startFlow(payload), true);
    });
  };

  // 通过操作
  const pass = async () => {
    await formRef.current?.validate();
    formRef.current?.submit((values) => {
      passRef.current?.open({
        processInstanceId: info.flowId,
        taskId: info.taskId,
        formData: JSON.stringify(values),
      });
    });
  };

  const passHandler = async (values: { feedback: string }, source: object) => {
    const data = {
      ...(source || {}),
      message: values.feedback,
    };
    return createHandler(WidgetAction.pass, data, () => passFlow(data));
  };

  // 拒绝操作
  const reject = async () => {
    await formRef.current?.validate();
    formRef.current?.submit((values) => {
      rejectRef.current?.open({
        processInstanceId: info.flowId,
        taskId: info.taskId,
        formData: JSON.stringify(values),
      });
    });
  };

  const rejectHandler = async (values: { feedback: string }, source: any) => {
    const data = {
      ...(source || {}),
      message: values.feedback,
    };
    return createHandler(WidgetAction.reject, data, () => rejectFlow(data));
  };

  // 转办操作
  const tranfer = async () => {
    formRef.current?.submit((values) => {
      transferRef.current?.open({
        processInstanceId: info.flowId,
        taskId: info.taskId,
        formData: JSON.stringify(values),
      });
    });
  };

  const transferHandler = async (
    values: { feedback: string; list: { code: string; name: string }[] },
    source: any,
  ) => {
    const data = {
      ...(source || {}),
      message: values.feedback,
      transferUserBid: values.list?.[0]?.code,
      transferUserName: values.list?.[0]?.name,
    };
    return createHandler(WidgetAction.transfer, data, () => transferFlow(data));
  };

  // 回退操作
  const back = async () => {
    formRef.current?.submit((values) => {
      backRef.current?.open({
        processInstanceId: info.flowId,
        taskId: info.taskId,
        formData: JSON.stringify(values),
        operateType: 4, // 跳转操作
        skipType: 2, // 跳转到上一节点
      });
    });
  };

  const backHandler = async (
    values: { feedback: string; list: { code: string; name: string }[] },
    source: any,
  ) => {
    const data = {
      ...(source || {}),
      message: values.feedback,
    };
    return createHandler(WidgetAction.back, data, () => handlerFlow(data));
  };

  return (
    <div ref={containerRef}>
      <PreviewWidget schema={schema} getForm={getForm} />
      {action.includes(WidgetAction.submit) ? (
        <>
          <Button type="primary" loading={loading?.submit} onClick={submit}>
            提交
          </Button>
        </>
      ) : null}
      <Space>
        {action.includes(WidgetAction.transfer) ? (
          <>
            <Button onClick={tranfer}>转办</Button>
            <TransferModal ref={transferRef} submit={transferHandler} />
          </>
        ) : null}
        {action.includes(WidgetAction.back) ? (
          <>
            <Button onClick={back}>回退</Button>
            <BackModal ref={backRef} submit={backHandler} />
          </>
        ) : null}
        {action.includes(WidgetAction.reject) ? (
          <>
            <Button danger onClick={reject}>
              拒绝
            </Button>
            <RejectModal ref={rejectRef} submit={rejectHandler} />
          </>
        ) : null}
        {action.includes(WidgetAction.pass) ? (
          <>
            <Button type="primary" onClick={pass}>
              通过
            </Button>
            <PassModal ref={passRef} submit={passHandler} />
          </>
        ) : null}
      </Space>
    </div>
  );
};
