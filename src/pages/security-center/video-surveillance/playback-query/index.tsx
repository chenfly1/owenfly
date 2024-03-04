import type { TreeProps } from 'antd/es/tree';
import ProCard from '@ant-design/pro-card';
import SpaceTree from '@/components/SpaceTree';
import { PageContainer } from '@ant-design/pro-layout';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import classnames from 'classnames';
import { listDevices } from '@/services/monitor';
import HlsVideo from '@/components/HlsVideo';
import type { DatePickerProps } from 'antd';
import { message } from 'antd';
import { Tag } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import CusSlider from './cusSlider';
import { useModel } from 'umi';
// import { ProFormDatePicker } from '@ant-design/pro-components';
// import { storageSy } from '@/utils/Setting';
const TableList: React.FC = () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [deviceList, setDeviceList] = useState<Record<string, any>>([]);
  const [deviceId, setDeviceId] = useState<string>();
  const [videoType, setVideoType] = useState<'flv' | 'hls'>('flv');
  const { initialState } = useModel('@@initialState');
  // const dateTem = dayjs().subtract(1, 'd').format('YYYY-MM-DD');
  const [backDate, setBackDate] = useState<any>(dayjs().subtract(1, 'd'));
  const treeRef = useRef<any>();

  const ref = useRef<any>();

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

  // 创建播放器
  const createPlayerByIdDate = (params: Record<string, any>) => {
    const { destroyPlayer, createPlayer } = ref?.current;
    if (deviceId) {
      destroyPlayer();
    }
    createPlayer(params);
  };

  // 设备点击
  const onDeviceClick = (item: any) => {
    const { id, brand } = item;
    const voideTypeTem = brand === 'hik_cloud' ? 'flv' : 'hls';
    setVideoType(voideTypeTem);
    createPlayerByIdDate({
      id,
      date: backDate?.format('YYYY-MM-DD') as string,
      type: voideTypeTem,
    });
    setDeviceId(id);

    const deviceListTem = deviceList.map((j: any) => {
      let isActive = false;
      if (id === j.id) {
        isActive = true;
      }
      return {
        ...j,
        isActive,
      };
    });
    setDeviceList(deviceListTem);
  };
  const getDeviceClassName = (item: any) => {
    return classnames(
      item.isActive ? 'active' : '',
      item.status === 1 ? 'onLine' : 'offLine',
      'deviceItem',
    );
  };

  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (deviceId) {
      createPlayerByIdDate({
        id: deviceId as string,
        date: date?.format('YYYY-MM-DD') as string,
        type: videoType,
      });
    }
    setBackDate(date);
  };

  useEffect(() => {}, []);

  const onAfterChange = (val: any) => {
    const startTime = dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    const endTime = dayjs(val).format('YYYY-MM-DD') + ' 23:59:59';
    if (deviceId) {
      createPlayerByIdDate({
        id: deviceId as string,
        date: dayjs(val).format('YYYY-MM-DD') as string,
        startTime,
        endTime,
        type: videoType,
      });
    } else {
      message.info('请选择设备');
    }
  };

  return (
    <PageContainer
      onBack={() => history.back()}
      header={{ title: null }}
      className={styles.pageWarp}
      waterMarkProps={{
        content: initialState?.currentUser?.userName,
        fontColor: 'rgba(100,100,100, 0.1)',
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div>
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
                    ref={treeRef}
                    mode="monitoring"
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
                      key={item.id}
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
          </div>
        </Pane>
        <Pane>
          <ProCard
            colSpan={19}
            className={styles.fullScreenDiv}
            title={
              <ProFormDatePicker
                fieldProps={{
                  defaultPickerValue: dayjs().subtract(1, 'd'),
                  value: backDate,
                  picker: 'date',
                  onChange: onChange,
                  allowClear: false,
                }}
              />
            }
          >
            <div className={styles.videoLayout}>
              <div className={styles.content}>
                <HlsVideo ref={ref} id="playBack" type={videoType} />
                <div className={styles.selectTip}>{!deviceId && '请选择监控点位'}</div>
              </div>
              <CusSlider date={backDate} onAfterChange={onAfterChange} />
            </div>
            {/* </div> */}
          </ProCard>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default TableList;
