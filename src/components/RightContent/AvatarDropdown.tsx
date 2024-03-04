import React, { useCallback, useState } from 'react';
import {
  ExclamationCircleFilled,
  LogoutOutlined,
  SettingOutlined,
  SwapOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Avatar, Spin, Modal } from 'antd';
import { history, useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { useLocalStorageState, useMount } from 'ahooks';
import { authAccountList, loginAuth } from '@/services/app';
import OssImage from '../OssImage';
import { securityBusiness } from '../FileUpload/business';
import storageSy from '@/utils/Setting/storageSy';

const { confirm } = Modal;

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const { query = {} } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [accountList, setAccountList] = useState<AccountListRes[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string>('');
  const onMenuClick = useCallback(
    async (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        confirm({
          icon: <ExclamationCircleFilled />,
          title: '确定是否退出登录',
          centered: true,
          okText: '确定',
          cancelText: '取消',
          onOk: async () => {
            localStorage.clear();
            await setInitialState((s: any) => ({ ...s, currentUser: undefined }));
            loginOut();
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        return;
      } else if (key === 'accountSettings') {
        history.push(`/user/person-settings`);
      }
    },
    [setInitialState],
  );
  useMount(() => {
    const accountType = initialState?.currentUser?.type;
    if (accountType !== 'sadmin') {
      authAccountList().then((res) => {
        setAccountList(res.data);
        res.data.map((item) => {
          if (item.tenant.tenantId === initialState?.currentUser?.tenantId) {
            setCurrentTenant(item.tenant.name);
          }
        });
      });
    }
  });
  const [, setToken] = useLocalStorageState('TOKEN');
  const changeTenant = (item: AccountListRes) => {
    loginAuth({
      userBid: item.userBid,
    }).then((res) => {
      if (res.code === 'SUCCESS') {
        setToken(res.data.access_token);
        localStorage.removeItem(storageSy.projectInfo);
        location.reload();
      }
    });
  };
  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState?.currentUser) {
    return loading;
  }

  if (!initialState?.currentUser || !initialState?.currentUser.userName) {
    return loading;
  }

  const switchTenant = {
    key: 'switchTenant',
    label: (
      <>
        <div className={`${styles.userName} ${styles.userInfoItem}`}>
          <UserOutlined className="mr-5" /> {initialState.currentUser.userName}
        </div>
        <div className={`${styles.navText} ${styles.userInfoItem}`}>
          账号：{initialState.currentUser.account}
        </div>
        <div className={`${styles.navText} ${styles.userInfoItem}`}>{currentTenant}</div>
      </>
    ),
    children: accountList?.map((item) => {
      return {
        key: item.userBid,
        label: (
          <span className={styles.tenantItem} onClick={() => changeTenant(item)}>
            {item.tenant.tenantId === initialState.currentUser?.tenantId && (
              <span className={styles.tenantTag}>当前租户</span>
            )}
            <a>{item.tenant.name}</a>
          </span>
        ),
      };
    }),
  };
  const customItems = [
    accountList && accountList.length > 1 && switchTenant,
    accountList &&
      accountList.length > 1 && {
        type: 'divider',
      },
  ];
  const menuHeaderDropdown = {
    items: [
      ...customItems,

      {
        key: 'accountSettings',
        label: (
          <div style={{ width: '150px' }}>
            <SettingOutlined className="mr-5" /> 个人设置
          </div>
        ),
      },
      {
        key: 'logout',
        label: (
          <>
            <LogoutOutlined className="mr-5" /> 退出登录
          </>
        ),
      },
    ],
    onClick: onMenuClick,
  };
  return (
    <HeaderDropdown menu={menuHeaderDropdown as any}>
      <span className={`${styles.action} ${styles.account}`}>
        {initialState?.currentUser?.userAvatarUrl ? (
          <>
            <OssImage
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
              objectId={initialState?.currentUser?.userAvatarUrl}
              preview={false}
              business={securityBusiness.id}
            />
            &nbsp;&nbsp;
          </>
        ) : (
          <Avatar size="small" className={styles.avatar} src={'/images/avart.png'} alt="avatar" />
        )}
        <span className={`${styles.name} anticon`}>{initialState?.currentUser.userName}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
