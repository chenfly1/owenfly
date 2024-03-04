import { verifyCode } from '@/services/app';
import { ModalForm, ProFormCaptcha } from '@ant-design/pro-components';
import type { CaptFieldRef, ProFormInstance } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
  onSubmit: (data: Record<string, any>, action: Record<string, any>) => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const captchaRef = useRef<CaptFieldRef | null | undefined>();

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      const { mobile } = data.getCurrentRowData();
      if (mobile) {
        setTitle('修改手机号');
        formRef?.current?.setFieldsValue({
          mobile: mobile,
          verifyCode: '',
        });
      } else {
        setTitle('绑定手机号');
      }
    }
  }, [open]);
  const onFinish = async (formData: Record<string, any>) => {
    onSubmit(formData, data);
    return true;
  };

  return (
    <>
      <ModalForm
        colon={false}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
      >
        <ProFormText
          label="手机号"
          labelCol={{ flex: '98px' }}
          name="mobile"
          width={300}
          validateTrigger="onBlur"
          placeholder="请输入手机号"
          rules={[
            { required: true },
            {
              pattern: /^1[356789]\d{9}$/,
              message: '手机号格式错误',
            },
          ]}
        />
        <ProFormCaptcha
          captchaProps={{
            type: 'primary',
            ghost: true,
          }}
          labelCol={{ flex: '98px' }}
          label="验证码"
          width={300}
          fieldProps={{
            maxLength: 10,
          }}
          placeholder={'请输入验证码'}
          name="verifyCode"
          rules={[
            {
              required: true,
              message: '请输入验证码',
            },
            {
              pattern: /\d{6}$/,
              message: '请输入6位数验证码',
            },
          ]}
          fieldRef={captchaRef}
          captchaTextRender={(timing, count) => {
            if (timing) {
              return `${count}S ${'获取验证码'}`;
            }
            return '获取验证码';
          }}
          onGetCaptcha={async () => {
            const securePhone = formRef?.current?.getFieldValue('mobile');
            if (!securePhone) {
              message.warning('请输入手机号');
              return new Promise((resolve, reject) => {
                reject();
              });
            }
            if (!/^1[356789]\d{9}$/.test(securePhone)) {
              message.warning('手机号格式错误');
              return new Promise((resolve, reject) => {
                reject();
              });
            }
            captchaRef.current?.startTiming();
            verifyCode({
              phone: securePhone,
              verifyCodeType: 'MERCHANT_BIND_PHONE',
            }).then((res) => {
              if (res.code === 'SUCCESS') {
                message.success('获取验证码成功');
              }
            });
          }}
        />
      </ModalForm>
    </>
  );
};

export default Add;
