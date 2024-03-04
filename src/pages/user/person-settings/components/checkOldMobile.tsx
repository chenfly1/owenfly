import { checkVerifyCode, verifyCode } from '@/services/app';
import { ModalForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import type { CaptFieldRef, ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import UpdateNewMobile from './updateNewMobile';
import CheckAccount from './checkAccount';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
};

const CheckOldMobile: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange }) => {
  const [phoneBool, setPhoneBool] = useState<boolean>(false);
  const [accountBool, setAccountBool] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const captchaRef = useRef<CaptFieldRef | null | undefined>();
  const [oldPhoneVerifyCode, setOldPhoneVerifyCode] = useState<string>();

  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const next = () => {
    setAccountBool(true);
    onOpenChange(false);
  };

  useEffect(() => {
    formRef?.current?.resetFields();
    formRef?.current?.setFieldsValue({
      verifyCode: null,
      phone: currentUser?.mobile,
    });
  }, [open]);

  const onFinish = async (values: Record<string, any>) => {
    setOldPhoneVerifyCode(values.verifyCode);
    const checkRes = await checkVerifyCode({
      ...values,
      verifyCodeType: 'UNBIND_PHONE',
    });
    if (checkRes.code === 'SUCCESS') {
      setPhoneBool(true);
      onOpenChange(false);
    }
  };
  return (
    <>
      <ModalForm<{
        name: string;
        company: string;
      }>
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={520}
        modalProps={{
          centered: true,
        }}
        title="当前手机号验证"
        open={open}
        formRef={formRef}
        onFinish={onFinish}
      >
        <ProFormText disabled name="phone" placeholder="请输入手机号" />
        <ProFormCaptcha
          captchaProps={{
            type: 'primary',
            ghost: true,
          }}
          countDown={600}
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
          ]}
          fieldRef={captchaRef}
          captchaTextRender={(timing, count) => {
            if (timing) {
              return `${count}S ${'获取验证码'}`;
            }
            return '获取验证码';
          }}
          onGetCaptcha={async () => {
            const securePhone = formRef?.current?.getFieldValue('phone');
            if (!securePhone) {
              message.warning('请输入手机号');
              return new Promise((resolve, reject) => {
                reject();
              });
            }
            if (!/^1\d{10}$/.test(securePhone)) {
              message.warning('手机号格式错误');
              return new Promise((resolve, reject) => {
                reject();
              });
            }
            captchaRef.current?.startTiming();
            verifyCode({
              phone: securePhone,
              verifyCodeType: 'UNBIND_PHONE',
            }).then((res) => {
              if (res.code === 'SUCCESS') {
                message.success('获取验证码成功');
              }
            });
          }}
        />
        <a onClick={() => next()}>手机号已停用？</a>
      </ModalForm>
      <UpdateNewMobile
        open={phoneBool}
        oldPhoneVerifyCode={oldPhoneVerifyCode}
        onOpenChange={setPhoneBool}
      />
      <CheckAccount open={accountBool} onOpenChange={setAccountBool} />
    </>
  );
};

export default CheckOldMobile;
