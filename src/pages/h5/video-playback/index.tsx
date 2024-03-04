import { useLocation } from 'react-router';
import HlsVideoH5 from './HlsVideoH5';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import style from './style.less';

export default () => {
  const location = useLocation() as any;
  const videoRef = useRef<any>();
  const [videoType, setVideoType] = useState<'flv' | 'hls'>('flv');

  const query = location.query;

  // 创建播放器
  const createPlayerByIdDate = () => {
    const videoTypeTem: any = query.brandCode === 'hik_cloud' ? 'flv' : 'hls';
    setVideoType(videoTypeTem);
    const dateTem = dayjs(query.handleTime).format('YYYY-MM-DD');
    const startTime = dayjs(query.handleTime).subtract(3, 's').format('YYYY-MM-DD HH:mm:ss');
    const stopTime = dayjs(query.handleTime).add(3, 's').format('YYYY-MM-DD HH:mm:ss');
    videoRef.current.createPlayer({
      id: query.deviceId,
      date: dateTem,
      startTime,
      stopTime,
      type: videoTypeTem,
    });
  };

  useEffect(() => {
    createPlayerByIdDate();
  }, []);

  return (
    <div className={style.page}>
      <HlsVideoH5
        ref={videoRef}
        xtoken={query.xtoken}
        id="playBack3"
        autoplay={true}
        type={videoType}
      />
    </div>
  );
};
