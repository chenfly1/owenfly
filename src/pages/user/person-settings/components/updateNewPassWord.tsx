import { passwordUpdate } from '@/services/security';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Checkbox } from 'antd';
import { useEffect, useRef } from 'react';
import { useModel, history } from 'umi';
import { stringify } from 'querystring';
import md5 from 'js-md5';
type IProps = {
  open: boolean;
  verifyCode?: string;
  oldPassword?: string;
  onOpenChange: (bool: boolean) => void;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    localStorage.clear();
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};

const UpdateNewPassWord: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  verifyCode,
  oldPassword,
}) => {
  const formRef = useRef<ProFormInstance>();
  const [passwordVisible, { toggle: setPasswordVisible }] = useBoolean(false);

  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  useEffect(() => {
    formRef?.current?.resetFields();
  }, [open]);

  const onChangeVisible = () => {
    setPasswordVisible();
  };

  const onFinish = async (values: Record<string, any>) => {
    const res = await passwordUpdate({
      account: currentUser?.account,
      verifyCode: verifyCode,
      oldPassword: oldPassword ? md5(oldPassword || '') : null,
      newPassword: values.newPassword ? md5(values.newPassword || '') : null,
    });
    if (res.code === 'SUCCESS') {
      onOpenChange(false);
      loginOut();
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
        title="修改密码"
        open={open}
        modalProps={{
          centered: true,
        }}
        formRef={formRef}
        onFinish={onFinish}
      >
        <p>8-32位字符，包含大写字母、小写字母、数字和特殊符号至少3种</p>
        <ProFormText.Password
          name="newPassword"
          placeholder={'请输入新密码'}
          fieldProps={{
            visibilityToggle: { visible: passwordVisible, onVisibleChange: setPasswordVisible },
            iconRender: () => null,
            autoComplete: 'new-password',
          }}
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
            {
              pattern:
                /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,30}$/,
              message: '8-32位字符，包含大写字母、小写字母、数字和特殊符号至少3种',
            },
          ]}
        />
        <ProFormText.Password
          name="againPassword"
          placeholder={'再次确认新密码'}
          fieldProps={{
            visibilityToggle: { visible: passwordVisible, onVisibleChange: setPasswordVisible },
            iconRender: () => null,
            autoComplete: 'new-password',
          }}
          validateTrigger="onBlur"
          rules={[
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.reject('请输入密码');
                }
                if (
                  !/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,30}$/.test(
                    value,
                  )
                ) {
                  return Promise.reject(
                    '8-32位字符，包含大写字母、小写字母、数字和特殊符号至少3种',
                  );
                }
                if (getFieldValue('newPassword') && getFieldValue('newPassword') !== value) {
                  return Promise.reject('新密码与确认新密码不同');
                }
                return Promise.resolve();
              },
            }),
          ]}
        />
        <Checkbox onChange={onChangeVisible}>展示密码</Checkbox>
      </ModalForm>
    </>
  );
};

export default UpdateNewPassWord;
