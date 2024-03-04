import { getAlarmEventDetail, listAllEventType } from '@/services/monitor';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProFormItem, DrawerForm, ProFormText } from '@ant-design/pro-components';
import VideoModal from '../video-modal';
import { Image } from 'antd';
import { useEffect, useRef, useState } from 'react';
import HlsVideo from '@/components/HlsVideo';
import dayjs from 'dayjs';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const [photoUrl, setPhoteUrl] = useState<string>();
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoData, setVideoData] = useState<Record<string, any>>();
  const [videoType, setVideoType] = useState<'flv' | 'hls'>('flv');
  const videoRef = useRef<any>();
  // 创建播放器
  const createPlayerByIdDate = (detailInfo: any) => {
    const { deviceId: id, handleTime, brandCode } = detailInfo;
    const videoTypeTem: any = brandCode === 'hik_cloud' ? 'flv' : 'hls';
    setVideoType(videoTypeTem);
    const dateTem = dayjs(handleTime).format('YYYY-MM-DD');
    const startTime = dayjs(handleTime).subtract(3, 's').format('YYYY-MM-DD HH:mm:ss');
    const stopTime = dayjs(handleTime).add(3, 's').format('YYYY-MM-DD HH:mm:ss');
    videoRef?.current.createPlayer({ id, date: dateTem, startTime, stopTime, type: videoTypeTem });
    // videoRef?.current.createPlayer('1654808596382142465', '2023-05-15');
  };

  const queryEventTypes = async () => {
    const res = await listAllEventType();
    return Object.entries(res.data || {}).map((item) => ({
      label: item[1],
      value: item[0],
    }));
  };

  const getDetail = async () => {
    const res = await getAlarmEventDetail({ id: data?.id });

    formRef?.current?.setFieldsValue({
      ...res.data,
      // ...data,
    });
    setPhoteUrl(((res.data.photoUrls as string) || '').split(';')[0]);
    createPlayerByIdDate(res.data);
  };

  const getImage = () => {
    if (photoUrl) {
      return (
        <Image src={photoUrl} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
      );
    } else {
      return '-';
    }
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      getDetail();
    } else {
      videoRef?.current?.destroyPlayer!();
    }
  }, [open]);
  return (
    <DrawerForm
      {...rest}
      readonly={true}
      labelCol={{ flex: '120px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      title={'告警详情'}
      formRef={formRef}
      colon={false}
      open={open}
      submitter={false}
    >
      <ProFormText name="eventCode" label="告警事件号" />
      <ProFormSelect name="eventTypeCode" request={queryEventTypes} label="告警类型" />
      <ProFormText name="handleAddress" label="触发区域" />
      <ProFormText name="deviceName" label="触发设备" />
      <ProFormSelect
        name="eventLevel"
        options={[
          {
            label: '低',
            value: 1,
          },
          {
            label: '中',
            value: 2,
          },
          {
            label: '高',
            value: 3,
          },
        ]}
        label="告警等级"
      />
      <ProFormSelect
        name="handleStatus"
        options={[
          {
            label: '无配置处理',
            value: 0,
          },
          {
            label: '已发通知',
            value: 1,
          },
          {
            label: '已转工单',
            value: 2,
          },
        ]}
        label="处理状态"
      />
      <ProFormText name="handleTime" label="触发时间" />
      <ProFormItem name="photoUrls" label="告警抓拍照片">
        {getImage()}
      </ProFormItem>
      <ProFormItem name="photoUrls" label="告警抓拍视频">
        <div style={{ width: '300px', height: '170px', background: '#000' }}>
          <HlsVideo ref={videoRef} id="playBack3" autoplay={false} type={videoType} />
        </div>
      </ProFormItem>
      <ProFormItem name="deviceId" label="告警区域实时监控">
        <a
          onClick={() => {
            setVideoOpen(true);
            setVideoData(data);
          }}
        >
          调阅监控
        </a>
      </ProFormItem>
      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} data={videoData} />
    </DrawerForm>
  );
};

export default Add;
