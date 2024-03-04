import React, { useEffect, useRef, useState } from 'react';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { history } from 'umi';
import { Button, Tooltip, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { noticeTest } from '@/services/notice';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    formRef?.current?.resetFields();
    setTitle('测试');
  }, [open]);

  const onFinish = async (values: any) => {
    const res = await noticeTest({
      templateBid: data.bid,
      receiver: values.receiver,
      jsonParams: values.jsonParams,
      channelBid: data.channelBid,
    });
    if (res.code === 'SUCCESS') {
      message.success('发送成功');
      onSubmit();
      return true;
    }
    return false;
  };
  const handleRest = () => {
    formRef?.current?.resetFields();
  };

  return (
    <ModalForm
      formRef={formRef}
      layout="vertical"
      onOpenChange={onOpenChange}
      width={550}
      labelAlign="left"
      title={title}
      open={open}
      colon={false}
      onFinish={onFinish}
      submitter={{
        render: (props) => {
          return (
            <>
              <Button type="default" onClick={handleRest}>
                重置
              </Button>
              <Button type="primary" onClick={() => props.form?.submit?.()}>
                提交
              </Button>
            </>
          );
        },
      }}
      onReset={() => history.goBack()}
    >
      <ProFormText
        label={
          <>
            接收方
            <Tooltip title="渠道为微信公众号请提前进行关注，填写接收人微信号； 小程序和站内信请提前在平台内进行注册，填写接收人的平台账号 短信请确保该手机号能够正常接收短信，填写接收人的手机号；">
              <InfoCircleOutlined
                style={{
                  color: '#8a8a8a',
                  fontSize: '14px',
                  verticalAlign: 'top',
                  paddingLeft: '5px',
                }}
              />
            </Tooltip>
          </>
        }
        name="receiver"
        rules={[
          {
            required: true,
            message: '请输入接收方',
          },
        ]}
      />
      <ProFormTextArea
        name="jsonParams"
        label={
          <>
            变量信息
            <Tooltip title="变量是该消息内容的可变字符，请预置后再行发送">
              <InfoCircleOutlined
                style={{
                  color: '#8a8a8a',
                  fontSize: '14px',
                  verticalAlign: 'top',
                  paddingLeft: '5px',
                }}
              />
            </Tooltip>
          </>
        }
        rules={[
          {
            required: true,
            message: '请输入变量信息',
          },
        ]}
        fieldProps={{
          rows: 4,
        }}
      />
    </ModalForm>
  );
};

export default Add;
