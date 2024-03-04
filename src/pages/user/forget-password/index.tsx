import { Button, Input, Result, Steps, message } from 'antd';
import React, { useState } from 'react';
import styles from './style.less';
import CaptchaInput from '@/components/CaptchaInput';
import { useCountDown, useSetState } from 'ahooks';
import { ProFormText } from '@ant-design/pro-components';
import { captchaPassword, checkVerifyCode, verifyCode } from '@/services/app';
import { history } from 'umi';
import md5 from 'js-md5';
import Method from '@/utils/Method';

const ForgetPassword: React.FC = () => {
  const [data, setData] = useSetState<ForgetPassword>({
    account: '',
    verifyCode: '',
    newPassword: '',
  });
  const [current, setCurrent] = useState(0);
  const [targetDate, setTargetDate] = useState<number>();
  const [gotoLoginTargetDate, setGotoLoginTargetDate] = useState<number>();
  const [phone, setPhone] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const [countdown] = useCountDown({
    targetDate,
  });
  const [gotoLoginPageCountDown] = useCountDown({
    targetDate: gotoLoginTargetDate,
    onEnd() {
      history.push('/user/login');
    },
  });
  const time = 30000; // 倒数时间
  const captchaLength = 6;
  const getVerifyCode = async () => {
    setLoading(true);
    const res = await verifyCode({
      verifyCodeType: 'FIND_PASS',
      account: data.account,
    });
    setLoading(false);
    if (res.code !== 'SUCCESS') {
      return;
    }
    setPhone(res.data);

    setCurrent(1);

    setTargetDate(Date.now() + time);
  };
  const captchaValueChange = async (val: string) => {
    if (val.length === captchaLength) {
      setData({
        ...data,
        verifyCode: val,
      });
      const checkRes = await checkVerifyCode({
        phone: phone,
        verifyCode: val,
        verifyCodeType: 'FIND_PASS',
      });
      if (checkRes.code === 'SUCCESS') {
        setCurrent(2);
      }
    }
  };
  const onFinish = () => {
    if (newPassword && !Method.passwordFormatCheck(newPassword)) {
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('密码不一致');
      return;
    } else if (!newPassword || !confirmPassword) {
      message.error('密码不能为空');
      return;
    } else {
      captchaPassword({
        account: data.account,
        newPassword: md5(newPassword || ''),
        verifyCode: data.verifyCode,
      }).then((res) => {
        if (res.code !== 'SUCCESS') {
          return;
        }
        setGotoLoginTargetDate(Date.now() + 6000);
        setCurrent(3);
      });
    }
  };

  const accountSept = () => {
    return (
      <>
        <div className={styles.title}>零洞社区管理平台账号密码找回</div>

        <Input
          type="text"
          name="account"
          onChange={(e) => {
            setData({
              ...data,
              account: e.currentTarget.value,
            });
          }}
          onPressEnter={() => {
            getVerifyCode();
          }}
          size="large"
          placeholder="请输入账号名"
          className={styles.accountName}
        />

        <Button
          size="large"
          type="primary"
          loading={loading}
          className={styles.button}
          disabled={data.account?.length === 0}
          onClick={async () => {
            getVerifyCode();
          }}
        >
          下一步
        </Button>
      </>
    );
  };
  const captchaSept = () => {
    return (
      <>
        <div className={styles.title}>手机号验证</div>
        <div className={styles.subTitle}>
          请输入手机号{phone}收到的6位验证码，有效期为15分钟。如验证码失效，请尝试重新获取验证码
        </div>
        <CaptchaInput
          theme="box"
          length={captchaLength}
          style={{ width: '420px' }}
          onChange={captchaValueChange}
        />

        <div className={styles.countDownContent}>
          {countdown > 0 && `${Math.round(countdown / 1000)}秒后可重新`}
          <Button
            type="link"
            disabled={countdown > 0}
            onClick={async () => {
              getVerifyCode();
            }}
          >
            重新获取
          </Button>
        </div>
        <div className={styles.captchaTip}>验证方法均无法使用，请联系企业管理员</div>
      </>
    );
  };
  const confirmPasswordSept = () => {
    return (
      <>
        <div className={styles.title}>零洞社区管理平台账号设置新密码</div>
        <div className={styles.subTitle} style={{ width: '550px' }}>
          8-32位字符，包含大写字母、小写字母、数字和特殊符号至少3种
        </div>

        <ProFormText.Password
          fieldProps={{
            size: 'large',
            onChange: (e) => {
              setNewPassword(e.target.value);
            },
            autoFocus: true,
            onInput: (e) => {},
          }}
          placeholder="请输入新密码"
          style={{ marginBottom: '40px', width: '100%' }}
        />
        <ProFormText.Password
          fieldProps={{
            size: 'large',
            onChange: (e) => {
              setConfirmPassword(e.target.value);
            },
            onPressEnter: onFinish,
          }}
          placeholder="确认密码"
        />
        <Button type="primary" style={{ width: '80%' }} size="large" onClick={onFinish}>
          提交
        </Button>
      </>
    );
  };
  const resetPasswordResult = () => {
    return (
      <Result
        status="success"
        title={
          <div className={styles.title}>
            <span>密码修改成功</span>
          </div>
        }
        subTitle={`${
          gotoLoginPageCountDown > 0 && Math.round(gotoLoginPageCountDown / 1000)
        }s后自动跳转到登录页`}
        extra={
          <Button
            size="large"
            type="primary"
            style={{ width: '100%' }}
            onClick={() => history.push('/user/login')}
          >
            <span>前往登录页</span>
          </Button>
        }
      />
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Steps
          current={current}
          items={[
            {
              title: '账号信息',
            },
            {
              title: '身份验证',
            },
            {
              title: '修改密码',
            },
            {
              title: '完成',
            },
          ]}
        />
        {current === 0 && <div className={styles.form}>{accountSept()}</div>}
        {current === 1 && <div className={styles.form}>{captchaSept()}</div>}
        {current === 2 && <div className={styles.form}>{confirmPasswordSept()}</div>}
        {current === 3 && <div className={styles.form}>{resetPasswordResult()}</div>}
      </div>
    </div>
  );
};
export default ForgetPassword;
