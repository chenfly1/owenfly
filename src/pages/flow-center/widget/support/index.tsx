import { passFlow, rejectFlow, startFlow, transferFlow } from '@/services/flow';
import { useLocation } from 'react-router';
import SubmitModal from './submit';
import RejectModal from './reject';
import PassModal from './pass';
import TransferModal from './transfer';
import { useRef, useEffect } from 'react';
import { Events, WidgetActionEnum, WidgetEventEnum, WidgetMessageBody } from '../../sdk/interface';
export default () => {
  const submitRef = useRef<any>();
  const passRef = useRef<any>();
  const rejectRef = useRef<any>();
  const transferRef = useRef<any>();
  const query = (useLocation() as any).query || {};

  // 消息处理
  const messageHandler = (event: { data: WidgetMessageBody }) => {
    const { id, action, payload } = event.data;
    if (id !== query.id) return;
    switch (action) {
      case WidgetActionEnum.supportSubmit:
        return submitRef.current?.open(payload);
      case WidgetActionEnum.supportPass:
        return passRef.current?.open(payload);
      case WidgetActionEnum.supportReject:
        return rejectRef.current?.open(payload);
      case WidgetActionEnum.supportTransfer:
        return transferRef.current?.open(payload);
      default:
        return;
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

  // 内容显示状态变更处理
  const afterOpenChange = (open: boolean) => {
    sendMessage({
      action: open ? WidgetEventEnum.supportOpen : WidgetEventEnum.supportClose,
    });
  };

  useEffect(() => {
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <>
      <SubmitModal
        ref={submitRef}
        afterOpenChange={afterOpenChange}
        submit={async (values, source) => {
          const data = {
            ...source,
            userList: values.list,
          };
          try {
            sendOperateMessage(Events.onFormSubmitStart, {
              action: 'submit',
              values: data,
            });
            await startFlow(data);
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'submit',
              values: data,
            });
            return true;
          } catch (error) {
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'submit',
              values: data,
              error,
            });
            return false;
          }
        }}
      />
      <PassModal
        ref={passRef}
        afterOpenChange={afterOpenChange}
        submit={async (values, source) => {
          const data = {
            ...(source || {}),
            message: values.feedback,
          };
          try {
            sendOperateMessage(Events.onFormSubmitStart, {
              action: 'pass',
              values: data,
            });
            await passFlow(data);
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'pass',
              values: data,
            });
            return true;
          } catch (error) {
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'pass',
              values: data,
              error,
            });
            return false;
          }
        }}
      />
      <RejectModal
        ref={rejectRef}
        afterOpenChange={afterOpenChange}
        submit={async (values, source) => {
          const data = {
            ...(source || {}),
            message: values.feedback,
          };
          try {
            sendOperateMessage(Events.onFormSubmitStart, {
              action: 'reject',
              values: data,
            });
            await rejectFlow(data);
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'reject',
              values: data,
            });
            return true;
          } catch (error) {
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'reject',
              values: data,
              error,
            });
            return false;
          }
        }}
      />
      <TransferModal
        ref={transferRef}
        afterOpenChange={afterOpenChange}
        submit={async (values, source) => {
          const data = {
            ...(source || {}),
            message: values.feedback,
            transferUserBid: values.list?.[0]?.code,
            transferUserName: values.list?.[0]?.name,
          };
          try {
            sendOperateMessage(Events.onFormSubmitStart, {
              action: 'transfer',
              values: data,
            });
            await transferFlow(data);
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'transfer',
              values: data,
            });
            return true;
          } catch (error) {
            sendOperateMessage(Events.onFormSubmitEnd, {
              action: 'transfer',
              values: data,
              error,
            });
            return false;
          }
        }}
      />
    </>
  );
};
