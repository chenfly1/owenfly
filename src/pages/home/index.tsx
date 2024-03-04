import { getMenu, getVerticalsSystem } from '@/services/auth';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount, useSessionStorageState } from 'ahooks';
import { useState } from 'react';
import styles from './style.less';
import OssImage from '@/components/OssImage';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { storageSy } from '@/utils/Setting';

export default () => {
  const [applicationList, setApplicationList] = useState<Application[]>([]);
  const [, setMenuInfo] = useSessionStorageState<MenuInfo>('menuInfo');
  useMount(async () => {
    const res = await getVerticalsSystem();
    setMenuInfo({
      type: 'base',
      code: 'base',
      systemBid: '',
    });
    setApplicationList(res.data);
  });
  const gotoApplication = async (menuInfo: Application) => {
    console.log('menuInfo:', menuInfo);
    if (menuInfo.code === 'alitaIOC') {
      // 社区IOC大屏
      window.open(
        `${location.origin}/ioc/dashboard?token=${localStorage.getItem(
          storageSy.token,
        )}&systemBid=${menuInfo.bid}`,
        `alita-${menuInfo.code}`,
      );
    } else if (menuInfo.sourceSystem === 'SELF' || !menuInfo.sourceSystem) {
      const res = await getMenu({ type: menuInfo.type, systemBid: menuInfo.bid });
      const menu = res.data;
      console.log('menu:', menu);
      const url = menu[0].children?.[0].children?.[0]?.url;
      window.open(`${location.origin}${url}?systemBid=${menuInfo.bid}`, `alita-${menuInfo.code}`);
    } else {
      window.open(
        `${menuInfo.url}?token=${localStorage.getItem(storageSy.token)}&systemBid=${menuInfo.bid}`,
        `alita-${menuInfo.code}`,
      );
    }
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProCard bodyStyle={{ padding: '16px 26px' }} colSpan={24}>
        <div className={styles.title}>首页</div>
        <div className={styles.header}>
          <div className={styles.content}>
            <div className={styles.title}>用一个管理平台轻松实现社区的数字化管理</div>
            <div className={styles.subTitle}>
              整合社区空间、人、设备和组织等信息，实现业务数据互联互通、资源整合共享，助你提高工作效率，形成一种基于信息化、智能化的社区管理形态。
            </div>
          </div>
          <img className={styles.headerImg} src="/images/home-header.png" />
        </div>
        <div className={styles.title}>业务应用</div>
        <div className={styles.applicationList}>
          {applicationList &&
            applicationList.length &&
            applicationList?.map((item: Application) => {
              return (
                <div
                  key={item.bid}
                  className={styles.application}
                  onClick={() => {
                    gotoApplication({
                      ...item,
                      type: 'verticals',
                    });
                  }}
                >
                  <OssImage
                    className={styles.logo}
                    objectId={item.icon}
                    business={publicMaterialLib.id}
                    preview={false}
                  />
                  <div className={styles.content}>
                    <div className={styles.applicationName}>{item.name}</div>
                    <div className={styles.applicationSubName}>
                      {JSON.parse(item.extension).desc}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </ProCard>
    </PageContainer>
  );
};
