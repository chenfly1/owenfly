import type { TreeProps } from 'antd/es/tree';
import ProCard from '@ant-design/pro-card';
import SpaceTree from '@/components/SpaceTree';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import styles from './index.less';
import {
  AppstoreOutlined,
  // CaretDownFilled,
  // CaretLeftFilled,
  // CaretRightFilled,
  // CaretUpFilled,
  // CloseCircleOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Dropdown, Tag } from 'antd';
import classnames from 'classnames';
import { launchIntoFullscreen, exitFullscreen } from '@/utils/Method/fullscreen';
import FlvVideo from '@/components/FlvVideo';
import { listDevices, ptzsControl } from '@/services/monitor';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { useModel } from 'umi';
// import { storageSy } from '@/utils/Setting';
const TableList: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>();
  const [currentDeviceInfo, setCurrentDeviceInfo] = useState<Record<string, any>>({});
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [screenNumber, setScreenNumber] = useState(4);
  const [deviceList, setDeviceList] = useState<Record<string, any>>([]);
  const { initialState } = useModel('@@initialState');

  const defaultVideoList = [
    {
      id: 'mse1',
      deviceId: '',
      isActive: true,
      hasVideo: false,
      ref: useRef<any>(),
    },
    {
      id: 'mse2',
      deviceId: '',
      isActive: false,
      hasVideo: false,
      ref: useRef<any>(),
    },
    {
      id: 'mse3',
      deviceId: '',
      isActive: false,
      hasVideo: false,
      ref: useRef<any>(),
    },
    {
      id: 'mse4',
      deviceId: '',
      isActive: false,
      hasVideo: false,
      ref: useRef<any>(),
    },
    {
      id: 'mse5',
      deviceId: '',
      isActive: false,
      hasVideo: false,
      ref: useRef<any>(),
    },
    {
      id: 'mse6',
      deviceId: '',
      isActive: false,
      hasVideo: false,
      ref: useRef<any>(),
    },
  ];
  const [videoList, setVideoList] = useState(defaultVideoList.slice(0, screenNumber));
  const treeRef = useRef<any>();

  const getDeviceListByAreaId = async (id: any) => {
    const res = await listDevices({
      spaceId: id,
    });
    if (res.code === 'SUCCESS') {
      const deviceListTem = (res.data || []).map((item: any) => ({
        ...item,
        active: false,
      }));
      setDeviceList(deviceListTem);
    }
  };

  // 空间树选择
  const onSelect: TreeProps['onSelect'] = async (selectedKeys, info) => {
    getDeviceListByAreaId((info.node as any).id);
  };

  const treeLoadComplate: any = (treeData: any) => {
    const id = treeData[0]?.id;
    treeRef.current.setselectedKeys(id);
    if (id) {
      getDeviceListByAreaId(id);
    }
  };
  // 播放器点击
  const onVideoClick = (item: any) => {
    const tempVideoList = videoList.map((i: any) => {
      let isActive = false;
      if (i.id === item.id) {
        if (item.deviceId) {
          setCurrentDeviceInfo(deviceList.find((j: any) => j.id === item.deviceId));
        } else {
          setCurrentDeviceInfo({});
        }
        isActive = true;
      }
      return {
        ...i,
        isActive,
      };
    });
    setVideoList(tempVideoList);
  };
  // 分屏
  const onScreenClick = (number: number) => {
    setScreenNumber(number);
    const voideListTemp = defaultVideoList.slice(0, number);
    setVideoList(voideListTemp);
    videoList.forEach((item) => {
      const destroyPlayer: any = item.ref?.current?.destroyPlayer;
      if (destroyPlayer) destroyPlayer();
    });
  };

  // 设备点击
  const onDeviceClick = (deviceDetail: any) => {
    const currentVideoIndex: any = videoList.findIndex((item) => item.isActive);
    const currentVideo = videoList[currentVideoIndex];
    const { destroyPlayer, createPlayer } = currentVideo.ref?.current;
    if (currentVideo.hasVideo) {
      destroyPlayer();
    }
    createPlayer(deviceDetail.id);
    const tempVideoList = videoList.map((item: any, index) => {
      let isActive = false;
      let nextIndex = currentVideoIndex + 1;
      if (currentVideoIndex === index) {
        item.hasVideo = true;
        item.deviceId = deviceDetail.id;
      }
      if (nextIndex > videoList.length - 1) {
        nextIndex = 0;
      }
      if (index === nextIndex) {
        isActive = true;
        if (item.deviceId) {
          setCurrentDeviceInfo(deviceList.find((j: any) => j.id === item.deviceId) || {});
        } else {
          setCurrentDeviceInfo({});
        }
      }
      return {
        ...item,
        isActive,
      };
    });
    setVideoList(tempVideoList);
    const deviceListTem = deviceList.map((item: any) => {
      let isActive = false;
      if (deviceDetail.id === item.id) {
        isActive = true;
      }
      return {
        ...item,
        isActive,
      };
    });
    setDeviceList(deviceListTem);
  };

  const items = [
    {
      key: '1',
      label: (
        <a
          onClick={() => {
            onScreenClick(1);
          }}
        >
          单屏
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a
          onClick={() => {
            onScreenClick(4);
          }}
        >
          四分屏
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a
          onClick={() => {
            onScreenClick(6);
          }}
        >
          六分屏
        </a>
      ),
    },
  ];

  const getClassName = (item: any) => {
    return classnames(
      item.isActive ? styles.videoItemBorder : '',
      screenNumber === 1 ? styles.one : '',
      screenNumber === 4 ? styles.four : '',
      screenNumber === 6 ? styles.six : '',
      isFullscreen ? styles.fullscreen : '',
    );
  };
  const getDeviceClassName = (item: any) => {
    return classnames(
      item.isActive ? 'active' : '',
      item.status === 1 ? 'onLine' : 'offLine',
      'deviceItem',
    );
  };
  const getConClassName = () => {
    return classnames(
      styles.controlContent,
      currentDeviceInfo.intelligenceType === 2 ? '' : styles.readonly,
    );
  };

  document.addEventListener('fullscreenchange', (e) => {
    setIsFullscreen(document?.fullscreen);
  });

  const fullscreenFn = () => {
    const $el = document.getElementsByClassName('fullScreenDiv')[0];
    if (document?.fullscreen) {
      setIsFullscreen(false);
      exitFullscreen();
    } else {
      setIsFullscreen(true);
      launchIntoFullscreen($el);
    }
  };
  const onControlClick = async (command: CommandType) => {
    if (currentDeviceInfo.id && currentDeviceInfo.intelligenceType === 2) {
      await ptzsControl({
        deviceId: currentDeviceInfo.id,
        command,
      });
    }
  };
  return (
    <PageContainer
      header={{ title: null }}
      className={styles.pageWarp}
      waterMarkProps={{
        content: initialState?.currentUser?.userName,
        fontColor: 'rgba(100,100,100, 0.1)',
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <ProCard
            bodyStyle={{
              height: 'calc(100vh - 103px)',
              paddingTop: '4px',
            }}
            colSpan={5}
            split="horizontal"
          >
            <SplitPane split="horizontal">
              <Pane className="SpaceTreePane" minSize="30%" maxSize="80%">
                <SpaceTree
                  style={{ height: '380px' }}
                  projectBid={project.bid || ''}
                  cardProps={{ bodyStyle: { padding: '0', overflow: 'scroll' } }}
                  onSelectChange={onSelect}
                  mode="monitoring"
                  ref={treeRef}
                  treeLoadComplate={treeLoadComplate}
                />
              </Pane>
              <ProCard className={styles.deviceWarp} title="设备列表">
                {deviceList.map((item: any) => (
                  <div
                    className={getDeviceClassName(item)}
                    onClick={() => {
                      onDeviceClick(item);
                    }}
                    key={item.name}
                  >
                    {item.status === 1 ? (
                      <Tag color="success">在线</Tag>
                    ) : (
                      <Tag color="default">离线</Tag>
                    )}
                    {item.name}
                  </div>
                ))}
              </ProCard>
            </SplitPane>
          </ProCard>
        </Pane>
        <Pane>
          <ProCard
            colSpan={19}
            title="监控画面"
            className="fullScreenDiv"
            extra={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* <CloseCircleOutlined
                  onClick={() => {
                    onScreenClick(screenNumber);
                  }}
                  style={{ fontSize: '20px', marginRight: '20px', cursor: 'pointer' }}
                /> */}
                <img
                  src="/images/clear.svg"
                  onClick={() => {
                    onScreenClick(screenNumber);
                  }}
                  style={{
                    width: '25px',
                    height: '25px',
                    marginRight: '20px',
                    cursor: 'pointer',
                  }}
                />
                <Dropdown menu={{ items }} placement="bottomRight">
                  <AppstoreOutlined style={{ fontSize: '20px', marginRight: '20px' }} />
                </Dropdown>
                {isFullscreen && (
                  <CompressOutlined
                    onClick={() => {
                      fullscreenFn();
                    }}
                    style={{ fontSize: '18px' }}
                  />
                )}
                {!isFullscreen && (
                  <ExpandOutlined
                    onClick={() => {
                      fullscreenFn();
                    }}
                    style={{ fontSize: '18px' }}
                  />
                )}
              </div>
            }
          >
            <div className={styles.videoConten}>
              <div className={styles.videoLayout}>
                {videoList.map((item, index) => (
                  <div
                    key={item.id}
                    className={getClassName(item)}
                    onClick={() => {
                      onVideoClick(item);
                    }}
                  >
                    <FlvVideo
                      ref={item.ref}
                      id={item.id}
                      onClick={() => {
                        onVideoClick(item);
                      }}
                    />
                    <div className={styles.selectTip}>{!item.hasVideo && '请选择监控点位'}</div>
                  </div>
                ))}
              </div>
              <div className={styles.control}>
                <div className={getConClassName()}>
                  <div
                    className={styles.up}
                    onClick={() => {
                      onControlClick('UP');
                    }}
                  >
                    <UpOutlined />
                  </div>
                  <div
                    className={styles.down}
                    onClick={() => {
                      onControlClick('DOWN');
                    }}
                  >
                    <DownOutlined />
                  </div>
                  <div className={styles.middle} />
                  <div
                    className={styles.left}
                    onClick={() => {
                      onControlClick('LEFT');
                    }}
                  >
                    <LeftOutlined />
                  </div>
                  <div
                    className={styles.right}
                    onClick={() => {
                      onControlClick('RIGHT');
                    }}
                  >
                    <RightOutlined />
                  </div>
                </div>
              </div>
            </div>
          </ProCard>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default TableList;
