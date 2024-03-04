// 社区IOC大屏首页-按项目切换大屏
import React, { useEffect, useRef, useState } from 'react';
import { Space, Divider, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { getProjectAllList } from '@/services/mda';
import type { MenuProps } from 'antd';
import { message, Dropdown } from 'antd';
import { SettingFilled, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import CurrentDateTime from '../components/currentDateTime';
import EditBgImg from '../components/editBgImg';
import screenfull from 'screenfull';
import styles from './style.less';

const IocDashboad: React.FC = () => {
  const [currentModel, setCurrentModel] = useState('1'); // 三种模式：'1'监控模式 '2'编辑模式 '3'接待模式
  const [currentProjectBid, setCurrentProjectBid] = useState(''); // 当前所选项目
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEditBg, setIsEditBg] = useState(false);
  let projectAllList = useRef<ProjectListType[]>([]);
  const initPage = () => {
    // 切换项目后，需要初始化对应项目的大屏数据
    // getBgImageUrlByProject();
    // 测试数据
    setBgImageUrl('https://t7.baidu.com/it/u=813347183,2158335217&fm=193&f=GIF');
  };
  // 获取项目列表
  const getProject = async () => {
    const res = await getProjectAllList();
    console.log('获取项目列表:', res);
    if (res.code === 'SUCCESS') {
      projectAllList = res.data.items || [];
      // const list = res.data.items || [];
      // if (list.length > 0) {
      //   list.forEach((item) => {
      //     if (!item.current) {
      //       item.current = list[0].bid;
      //     }
      //   });
      //   projectAllList = list;
      // console.log('list:', list, list[0].bid);
      // setCurrentProjectBid(list[0].bid);
      // setCurrentProjectBid(list[0].bid);
      setCurrentProjectBid(projectAllList[0].bid);
      initPage();
      // }
    }
  };
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <span className={currentModel === '1' ? styles.itemBold : styles.itemNormal}>监控模式</span>
      ),
    },
    {
      key: '2',
      label: (
        <span className={currentModel === '2' ? styles.itemBold : styles.itemNormal}>编辑模式</span>
      ),
    },
    {
      key: '3',
      label: (
        <span className={currentModel === '3' ? styles.itemBold : styles.itemNormal}>接待模式</span>
      ),
    },
    {
      key: '4',
      label: <span className={styles.itemNormal}>编辑背景图</span>,
    },
  ];
  const onProjectChange = async (value: string) => {
    // 设置选中的项目
    setCurrentProjectBid(value);
    setTimeout(() => {
      initPage();
    }, 50);
  };
  const onClick: MenuProps['onClick'] = ({ key }) => {
    // message.info(`Click on item ${key}`);
    if (key === '4') {
      // 编辑背景图片
      setIsEditBg(true);
    } else {
      setCurrentModel(key);
      if (key === '2') {
        message.success('您已成功切换为编辑模式！');
      }
    }
  };
  const changeFullScreen = () => {
    setIsFullScreen(screenfull.isFullscreen);
  };
  const destroy = () => {
    if (screenfull.isEnabled) {
      screenfull.off('change', changeFullScreen);
    }
  };
  const initFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.on('change', changeFullScreen);
    }
  };
  // 获取背景图片
  // const getBgImageUrlByProject = async () => {
  //   const res = await generateGetUrl({
  //     bussinessId: business,
  //     urlList: [
  //       {
  //         objectId: objectId,
  //       },
  //     ],
  //   });
  //   if (res.code === 'SUCCESS') {
  //     console.log(res.data.urlList[0].presignedUrl.url);
  //     setBgImageUrl(res.data.urlList[0].presignedUrl.url);
  //   }
  // };

  useEffect(() => {
    // common data
    getProject();
    initFullScreen();

    //页面卸载调用
    return () => {
      destroy();
    };
  }, []);

  return (
    <div className={styles.iocContainer}>
      {bgImageUrl.length > 0 ? <img className={styles.bgImage} src={bgImageUrl} /> : ''}
      <div className={styles.iocHeader}>
        <div className={styles.iocHeaderLeft}>
          <img src="" alt="" />
        </div>
        <div className={styles.iocHeaderRight}>
          <div className={styles.projectList}>
            <Select
              showSearch
              style={{ width: '200px' }}
              bordered={false}
              className="select-v-project"
              placeholder="请输入搜索关键词"
              value={currentProjectBid}
              suffixIcon={<CaretDownOutlined />}
              filterOption={(input, option) =>
                (option?.name ?? '').toLowerCase().includes(input.toLowerCase())
              }
              fieldNames={{
                label: 'name',
                value: 'bid',
              }}
              onChange={onProjectChange}
              options={projectAllList && projectAllList.length ? projectAllList : []}
            />
            {(projectAllList && projectAllList.length) || '无'}
          </div>
          <div className={styles.currentDateTime}>
            <CurrentDateTime />
          </div>
          <div className={styles.settingBtn}>
            <Dropdown
              menu={{ items, onClick }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <SettingFilled key="Icon" />
            </Dropdown>
          </div>
          <div
            className={styles.fullScreenBtn}
            onClick={() => {
              if (!screenfull.isEnabled) {
                message.warning('you browser can not work');
                return false;
              }
              screenfull.toggle();
            }}
          >
            {isFullScreen ? (
              <FullscreenExitOutlined key="Icon" />
            ) : (
              <FullscreenOutlined key="Icon" />
            )}
          </div>
        </div>
      </div>
      <div className={styles.iocBd}>
        <div className={styles.siderLeft}></div>
        <div className={styles.contentCenter}></div>
        <div className={styles.siderRight}></div>
      </div>
      <EditBgImg isEditBg={isEditBg} />
    </div>
  );
};

export default IocDashboad;
