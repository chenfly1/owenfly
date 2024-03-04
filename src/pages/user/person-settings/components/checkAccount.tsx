import { ModalForm, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import UpdateNewMobile from './updateNewMobile';
import { checkAuthAccount } from '@/services/security';
import md5 from 'js-md5';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
};

const UpdateCheckAccount: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange }) => {
  const formRef = useRef<ProFormInstance>();
  const [phoneBool, setPhoneBool] = useState<boolean>(false);
  const [password, setPassword] = useState<string>();
  const [account, setAccount] = useState<string>();

  useEffect(() => {
    formRef?.current?.resetFields();
  }, [open]);

  const onFinish = async (values: Record<string, any>) => {
    const res = await checkAuthAccount({
      ...values,
      password: md5(values.passwords || ''),
    });
    setPassword(values.passwords);
    setAccount(values.account);
    if (res.code === 'SUCCESS') {
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
        title="身份验证"
        open={open}
        modalProps={{
          centered: true,
        }}
        formRef={formRef}
        onFinish={onFinish}
      >
        <ProFormText
          name="account"
          placeholder={'请输入账号名'}
          rules={[
            {
              required: true,
              message: '请输入账号名',
            },
          ]}
        />
        <ProFormText.Password
          name="passwords"
          placeholder={'请输入密码'}
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
      </ModalForm>
      <UpdateNewMobile
        open={phoneBool}
        password={password}
        account={account}
        onOpenChange={setPhoneBool}
      />
    </>
  );
};

export default UpdateCheckAccount;
