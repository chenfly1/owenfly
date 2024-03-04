import { getUserInfo, verifyCode } from '@/services/app';
import { userPhoneUpdate } from '@/services/security';
import { ModalForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import type { CaptFieldRef, ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { useModel } from 'umi';
import md5 from 'js-md5';
type IProps = {
  open: boolean;
  oldPhoneVerifyCode?: string;
  account?: string;
  password?: string;
  onOpenChange: (bool: boolean) => void;
};

const UpdateNewMobile: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  oldPhoneVerifyCode,
  account,
  password,
}) => {
  const formRef = useRef<ProFormInstance>();
  const captchaRef = useRef<CaptFieldRef | null | undefined>();

  const { initialState, setInitialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  useEffect(() => {
    formRef?.current?.resetFields();
    formRef?.current?.setFieldsValue({
      newPhone: null,
      newPhoneVerifyCode: null,
    });
  }, [open]);

  const onFinish = async (values: Record<string, any>) => {
    const res = await userPhoneUpdate({
      ...values,
      oldPhoneVerifyCode: oldPhoneVerifyCode,
      account: account,
      password: password ? md5(password || '') : null,
      id: currentUser?.accountId,
    });
    if (res.code === 'SUCCESS') {
      const userInfoRes = await getUserInfo();
      setInitialState((s: any) => ({
        ...s,
        currentUser: userInfoRes.data,
      }));
      message.success('更新成功');
      onOpenChange(false);
    }
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      title="绑定新手机号"
      open={open}
      modalProps={{
        centered: true,
      }}
      formRef={formRef}
      onFinish={onFinish}
    >
      <ProFormText
        name="newPhone"
        validateTrigger="onBlur"
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
          {
            pattern: /^1\d{10}$/,
            message: '手机号格式错误',
          },
        ]}
        placeholder="请输入手机号"
      />
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
        name="newPhoneVerifyCode"
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
          const securePhone = formRef?.current?.getFieldValue('newPhone');
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
            verifyCodeType: 'BIND_PHONE',
          }).then((res) => {
            if (res.code === 'SUCCESS') {
              message.success('获取验证码成功');
            }
          });
        }}
      />
    </ModalForm>
  );
};

export default UpdateNewMobile;
