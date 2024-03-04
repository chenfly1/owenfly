import { Alert, Tabs, message } from 'antd';
import React, { useRef, useState } from 'react';
import { ProFormText, LoginForm, ProFormCaptcha } from '@ant-design/pro-form';
import { history, useModel } from 'umi';
import { login, getUserInfo, verifyCode, loginAuthVerify, loginAuthLogin } from '@/services/app';
import styles from './index.less';
import md5 from 'js-md5';
import qs from 'qs';
import { config } from '@/utils/config';
import { storageSy } from '@/utils/Setting';
import { useLocalStorageState, useMount, useSessionStorageState } from 'ahooks';
import { CodeMessage } from '@/utils/Request/constant';
import { getMenu } from '@/services/auth';
import { getProjectAllList } from '@/services/mda';
import defaultSettings from '../../../../config/defaultSettings';
import TenantList from './tenant-list/index';
import type { ProFormInstance } from '@ant-design/pro-components';
type LoginType = 'phone' | 'account';
const recordInfo: string =
  'www.lingdong.cn©2012零洞 All Rights Reserved 粤ICP备19018230号 粤公安备案 44060602002278号';
const companyInfo: string = '零洞科技有限公司 联系地址： 广东省佛山市顺德区碧桂园集团第二工作区';
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  // 登录类型
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [, setToken] = useLocalStorageState<string>(storageSy.token);
  const [authLoginVerify, setAuthLoginVerify] = useState<LoginAuthVerifyRes>();
  const formRef = useRef<ProFormInstance>();
  const [userLoginState] = useState<ResultData<UserInfo>>();
  const { setInitialState } = useModel('@@initialState');
  const [menuInfo, setMenuInfo] = useSessionStorageState<MenuInfo>('menuInfo');
  useMount(async () => {
    if (!menuInfo || !Object.keys(menuInfo || {}).length) {
      setMenuInfo({
        type: 'base',
        code: 'base',
        systemBid: '',
      });
    }
  });

  const initData = async (
    loginResult: ResultData<LoginResult>,
    callback: (menuData: ResourceTreeItemType[], userInfo: UserInfo) => any,
  ) => {
    setToken(loginResult.data?.access_token);
    const userInfoRes = await getUserInfo();
    localStorage.setItem('userInfo', JSON.stringify(userInfoRes.data ? userInfoRes.data : {}));

    let menuRes: ResultData<ResourceTreeItemType[]> = {
      data: [],
      code: '',
      message: '',
    };
    let projectList: ProjectListType[] = [];

    if (userInfoRes.data?.type !== 'sadmin') {
      menuRes = await getMenu({
        type: menuInfo?.type,
        systemBid: menuInfo?.systemBid,
      });
      const projectListRes = await getProjectAllList();
      projectList = projectListRes.data ? projectListRes.data.items : [];
    }

    callback(menuRes.data, userInfoRes.data);
    setInitialState((s: any) => ({
      ...s,
      currentUser: userInfoRes.data,
      menuData: menuRes.data,
      projectList,
      menu: {
        ...s.menuData,
        loading: true, // 正在加载菜单
      },
    }));
  };
  const handleSubmit = (loginResult: any) => {
    console.log('loginResult: ', loginResult);

    try {
      if (loginResult.code === CodeMessage.SUCCESS) {
        const defaultLoginSuccessMessage = '登录成功';

        initData(loginResult, (menu, userInfo) => {
          if (!history) return;
          const { query } = history.location;
          const { redirect } = query as {
            redirect: string;
          };
          if (!menu) {
            return;
          }
          if (menu && userInfo?.type !== 'sadmin' && redirect) {
            console.log(`${redirect}&token="${loginResult.data.access_token}"`);

            window.location.replace(`${redirect}&token="${loginResult.data.access_token}"`);
          } else if (userInfo?.type !== 'sadmin' && menuInfo?.type === 'base') {
            history.replace('/home?type=base');
          } else if (userInfo?.type !== 'sadmin' && menuInfo?.type === 'verticals') {
            const url = menu[0].children?.[0].children?.[0]?.url;
            history.push(url || '');
          } else {
            history.push('/super-admin/tenant');
          }

          message.success(defaultLoginSuccessMessage);

          return;
        });
        /** 此方法会跳转到 redirect 参数所在的位置 */
      }
    } catch (error) {
      console.log(error);
      const defaultLoginFailureMessage = '登录失败，请重试';
      message.error(defaultLoginFailureMessage);
    }
  };
  const handlePhoneLogin = async (values: LoginParams) => {
    const res = await loginAuthVerify(
      qs.stringify({
        phone: values.phone,
        verifyCode: values.validateCode,
        loginChannel: 'PC',
        loginAuthType: 'PHONE',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (res.code === 'SUCCESS') {
      if (res.data.accountResDTO && res.data.accountResDTO.length === 1) {
        const loginAuthLoginRes = await loginAuthLogin({
          preLoginCode: res.data.preLoginCode,
          userBid: (res.data.accountResDTO && res.data.accountResDTO[0].userBid) || '',
        });
        if (loginAuthLoginRes.code === 'SUCCESS') {
          handleSubmit(loginAuthLoginRes);
        }
      } else {
        setAuthLoginVerify(res.data);
      }
    }
  };
  const handleAccountLogin = async (values: LoginParams) => {
    const data = qs.stringify({
      username: values.username,
      password: md5(values.password || ''),
      phone: values.phone,
      validateCode: values.validateCode,
      client_id: config.client_id,
      client_secret: config.client_secret,
      grant_type: config.grant_type,
    });
    const result = await login(data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    handleSubmit(result);
  };
  const code = userLoginState?.code || CodeMessage.SUCCESS;

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${defaultSettings.loginBgImg})` }}
    >
      <div className={styles.titleWrapper}>
        <div className={styles.title}>
          欢迎来访{' '}
          <img
            src={defaultSettings.loginLogo}
            className={styles.subLogo}
            alt=""
            style={{ fontSize: '40px' }}
          />
        </div>
        <div className={styles.subTitle}>
          整合社区设施、业务、用户、数据，实现一站式综合数字化管理
        </div>
        <div className={styles.subTitle}>提升产业服务能力和品牌价值</div>
      </div>

      <div className={styles.content}>
        {authLoginVerify &&
        authLoginVerify.accountResDTO &&
        authLoginVerify.accountResDTO.length > 1 ? (
          <TenantList
            data={authLoginVerify}
            phone={formRef.current?.getFieldValue('phone')}
            handleSubmit={handleSubmit}
            resetData={() => {
              setAuthLoginVerify({
                preLoginCode: '',
              });
            }}
          />
        ) : (
          <LoginForm
            title="零洞智慧社区"
            formRef={formRef}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              if (loginType === 'account') await handleAccountLogin(values as LoginParams);
              else if (loginType === 'phone') await handlePhoneLogin(values as LoginParams);
            }}
          >
            {' '}
            <Tabs
              centered
              activeKey={loginType}
              onChange={(activeKey) => setLoginType(activeKey as LoginType)}
              items={[
                {
                  key: 'account',
                  label: '密码登录',
                },
                {
                  key: 'phone',
                  label: '验证码登录',
                },
              ]}
            />
            {code !== CodeMessage.SUCCESS && <LoginMessage content={'错误的用户名和密码'} />}
            {loginType === 'account' && (
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                  }}
                  placeholder={'请输入用户名'}
                  rules={[
                    {
                      required: true,
                      message: '用户名是必填项',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                  }}
                  placeholder={'请输入密码'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项',
                    },
                  ]}
                />
              </>
            )}
            {loginType === 'phone' && (
              <>
                <ProFormText
                  fieldProps={{
                    size: 'large',
                  }}
                  name="phone"
                  validateTrigger="onBlur"
                  placeholder={'手机号'}
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
                />
                <div className="catchaInput">
                  <ProFormCaptcha
                    fieldProps={{
                      size: 'large',
                    }}
                    captchaProps={{
                      size: 'middle',
                      type: 'text',
                    }}
                    placeholder={'请输入验证码'}
                    captchaTextRender={(timing, count) => {
                      if (timing) {
                        return `${count} ${'获取验证码'}`;
                      }
                      return '获取验证码';
                    }}
                    name="validateCode"
                    rules={[
                      {
                        required: true,
                        message: '请输入验证码',
                      },
                    ]}
                    onGetCaptcha={async (value) => {
                      const current = formRef.current as any;
                      const phone = current.getFieldValue('phone');
                      const res = await verifyCode({
                        verifyCodeType: 'PHONE_CODE_LOGIN',
                        phone,
                      });
                      if (res.code === 'SUCCESS') {
                        message.success('验证码已下发，请注意查收');
                      } else {
                        // console.log('用户名密码错误');
                        throw new Error(res.message);
                      }
                    }}
                  />
                </div>
              </>
            )}
            <div
              className={styles.forgotPassord}
              onClick={() => {
                history.push('/user/forget-password');
              }}
            >
              忘记密码？
            </div>
          </LoginForm>
        )}
      </div>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>{recordInfo}</div>
        <div className={styles.footerContent}>{companyInfo}</div>
      </div>
    </div>
  );
};
export default Login;
