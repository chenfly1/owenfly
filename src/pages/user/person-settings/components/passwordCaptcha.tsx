import CaptchaInput from '@/components/CaptchaInput';
import Method from '@/utils/Method';
import { ModalForm } from '@ant-design/pro-components';
import { useModel } from 'umi';
import UpdateNewPassWord from './updateNewPassWord';
import { useState } from 'react';
import { checkVerifyCode } from '@/services/app';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
};

const PasswordCaptcha: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange }) => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [passwordBool, setpasswordBool] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>();

  const captchaLength = 6;
  const captchaValueChange = async (val: string) => {
    if (val.length === captchaLength) {
      const checkRes = await checkVerifyCode({
        phone: currentUser?.mobile,
        verifyCode: val,
        verifyCodeType: 'RESET_PASSWORD',
      });
      if (checkRes.code === 'SUCCESS') {
        setVerifyCode(val);
        onOpenChange(false);
        setpasswordBool(true);
      }
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
        submitter={false}
        title="手机号验证"
        open={open}
      >
        <p>
          请输入手机号+86{Method.onlySeeSome(currentUser?.mobile as string, 'phone')}
          收到的6位验证码，有效期为15分钟。如验证码失效，请尝试重新获取验证码
        </p>
        <CaptchaInput
          theme="box"
          length={captchaLength}
          style={{ width: '420px' }}
          onChange={captchaValueChange}
        />
      </ModalForm>
      <UpdateNewPassWord
        open={passwordBool}
        verifyCode={verifyCode}
        onOpenChange={setpasswordBool}
      />
    </>
  );
};

export default PasswordCaptcha;
