import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import style from './index.less';
import { loginAuthLogin } from '@/services/app';
import { Spin } from 'antd';
import DataMasking from '@/components/DataMasking';
type Params = {
  data: LoginAuthVerifyRes;
  phone: string;
  handleSubmit: (res: any) => void;
  resetData: () => void;
};
const TenantList: React.FC<Params> = (props: {
  data: LoginAuthVerifyRes;
  phone: string;
  handleSubmit: (res: any) => void;
  resetData: () => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleLogin = async (item: {
    tenant?: { name: string; tenantId: string };
    name?: string;
    accountType?: string;
    userBid: any;
  }) => {
    const res = await loginAuthLogin({
      preLoginCode: props.data.preLoginCode,
      userBid: item.userBid,
    });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    props.handleSubmit(res);
  };
  return (
    <div className="ant-pro-form-login-container">
      {loading ? (
        <Spin tip="正在登录" style={{ marginTop: '120px' }} />
      ) : (
        <div className={style.container}>
          <div
            className={style.goBack}
            onClick={() => {
              props.resetData();
            }}
            style={{ cursor: 'pointer' }}
          >
            <LeftOutlined /> 返回
          </div>
          <div className={style.title}>你可以进入以下企业</div>
          <div className={style.subTitle}>
            <DataMasking text={props.phone} showIcon={false} />{' '}
            已在以下企业或组织绑定了账号，你可以进入以下任一企业或组织
          </div>

          <div className={style.tenantList}>
            {props.data.accountResDTO?.map((item) => {
              return (
                <div
                  className={style.item}
                  style={{ cursor: 'pointer' }}
                  key={item.userBid}
                  onClick={() => {
                    handleLogin(item);
                  }}
                >
                  <div className={style.tenantName}>{item.tenant.name}</div>
                  <div className={style.userName}>{item.name}</div>
                  <RightOutlined className={style.icon} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default TenantList;
