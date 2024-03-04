import React, { useEffect } from 'react';
import { Image } from 'antd';
import { history } from 'umi';
import styles from './index.less';
import { useSessionStorageState } from 'ahooks';

const HeaderLogo: React.FC = () => {
  const [menuInfo] = useSessionStorageState<MenuInfo>('menuInfo');
  const headerImageMap = {
    base: '/images/header-community.svg', // 智慧社区
    alitaBaseConfig: '/images/header-baseConfig.svg', // 业务基础配置
    alitaDoor: '/images/header-door.svg', // 智慧人行
    alitaContent: '/images/header-content.svg', // 内容服务
    alitaParking: '/images/header-parking.svg', // 智慧车场
    alitaMonitor: '/images/header-security.svg', // 智慧安防
    AlitaSteward: '/images/header-housekeeper.svg',
    alitaEnergy: '/images/header-energy.svg', // 智慧能耗
    alitaIOC: '/images/header-energy.svg', // 社区IOC大屏
  };
  const headerRoutersMap = {
    base: '/home?type=base',
    alitaBaseConfig: '',
    alitaDoor: '',
    alitaContent: '',
    alitaParking: '/park-center/dashboard/singleProject',
    alitaMonitor: '',
    AlitaSteward: '',
    alitaEnergy: '/energy/dashboard',
    alitaIOC: '/ioc/dashboard',
  };
  useEffect(() => {
    window.name = `alita-${(menuInfo && menuInfo.code) || 'base'}`;
  }, [menuInfo]);
  const toClick = (e: any) => {
    e.stopPropagation();
    history.push(headerRoutersMap[menuInfo?.code || 'base']);
  };
  return (
    <>
      <Image
        className={styles.image}
        src={headerImageMap[menuInfo?.code || 'base']}
        onClick={toClick}
        preview={false}
      />
      {/* <div className={styles.applicationName}>{menuInfo?.name || '智慧社区'}</div> */}
    </>
  );
};

export default HeaderLogo;
