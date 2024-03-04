import { ModalForm, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import UpdateNewPassWord from './updateNewPassWord';
import { useModel } from 'umi';
import { checkAuthAccount } from '@/services/security';
import md5 from 'js-md5';
import PasswordCaptcha from './passwordCaptcha';
import { verifyCode } from '@/services/app';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
};

const CheckOldPassWord: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange }) => {
  const formRef = useRef<ProFormInstance>();
  const [passwordBool, setpasswordBool] = useState<boolean>(false);
  const [captchaBool, setCaptchaBool] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>();

  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  useEffect(() => {
    formRef?.current?.resetFields();
  }, [open]);

  const next = async () => {
    const res = await verifyCode({
      account: currentUser?.account,
      verifyCodeType: 'RESET_PASSWORD',
    });
    if (res.code === 'SUCCESS') {
      onOpenChange(false);
      setCaptchaBool(true);
    }
  };

  const onFinish = async (values: Record<string, any>) => {
    const res = await checkAuthAccount({
      account: currentUser?.account,
      password: md5(values.passwords || ''),
    });
    setOldPassword(values.passwords);
    if (res.code === 'SUCCESS') {
      setpasswordBool(true);
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
        title="输入旧密码"
        modalProps={{
          centered: true,
        }}
        open={open}
        formRef={formRef}
        onFinish={onFinish}
      >
        <p>
          为了你的账号安全，修改密码前需先验证旧密码。请输入登录“{currentUser?.userName}”的旧密码
        </p>
        <ProFormText.Password
          name="passwords"
          placeholder={'请输入密码'}
          validateTrigger="onBlur"
          fieldProps={{
            autoComplete: 'new-password',
          }}
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        />
        <div>
          忘记密码？用<a onClick={() => next()}>手机号验证</a>
        </div>
      </ModalForm>
      <UpdateNewPassWord
        open={passwordBool}
        oldPassword={oldPassword}
        onOpenChange={setpasswordBool}
      />
      <PasswordCaptcha open={captchaBool} onOpenChange={setCaptchaBool} />
    </>
  );
};

export default CheckOldPassWord;
