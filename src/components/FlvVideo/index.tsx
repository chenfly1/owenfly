import FlvPlayer from 'xgplayer-hls.js';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { getMediaStream } from '@/services/monitor';
import { Spin } from 'antd';
import styles from './style.less';

type Iprops = {
  id: string;
  useRequestOptions?: Record<string, any>;
  ref?: any;
  onClick?: () => void;
};
const FlvVideo: React.FC<Iprops> = forwardRef(({ id, onClick, ...rest }, ref) => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [spinning, setSpinning] = useState<boolean>(false);
  // 截图
  const cutPic = (base64: any) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = '截屏' + dayjs().format('YYYYMMDDHHmmss') + '.png';
    link.click();
    link.remove();
  };
  const [player, setPlayer] = useState<any>();

  // 查询播放链接
  const fetchDeviceInfo = async (dId: string, streamType = 'main_code_stream'): Promise<string> => {
    setSpinning(true);
    setDeviceId(dId);
    const res = await getMediaStream({
      deviceId: dId,
      protocol: 'hls',
      streamType,
      watchType: 'now',
      mock: false,
    });
    setSpinning(false);
    return res.data.url;
  };

  // 创建播放器
  const createPlayer = (url: string) => {
    const _player = new FlvPlayer({
      id,
      autoplay: true,
      volume: 0.3,
      isLive: true,
      url,
      playsinline: true,
      cors: true,
      height: '100%',
      width: '100%',
      screenShot: {
        saveImg: false,
        quality: '0.92',
        type: 'image/png',
        format: '.png',
      },
    });
    _player.on('screenShot', (screenShotImg: any) => {
      cutPic(screenShotImg);
    });
    _player.emit('resourceReady', [
      {
        name: '高清',
        url: url,
      },
      {
        name: '流畅',
        url: url,
      },
    ]);
    _player.on('pause', () => {
      if (onClick) onClick();
    });
    // _player.on('play', () => {
    //   if (onClick) onClick();
    // });
    _player.on('definitionChange', async (e: any) => {
      if (e.to === '流畅') {
        const subUrl = await fetchDeviceInfo(deviceId, 'sub_code_stream');
        _player.src = subUrl;
      } else {
        const subUrl = await fetchDeviceInfo(deviceId);
        _player.src = subUrl;
      }
    });

    _player.on('error', () => {
      setTimeout(() => {
        _player.destroy();
        createPlayer(url);
      }, 1000);
    });

    setPlayer(_player);
  };

  const { run } = useRequest((dId: string) => fetchDeviceInfo(dId), {
    manual: true,
    ...rest?.useRequestOptions,
    onSuccess: (url) => {
      createPlayer(url);
    },
  });

  useImperativeHandle(ref, () => {
    return {
      createPlayer: (dId: string) => {
        run(dId);
      },
      destroyPlayer: () => {
        if (player) {
          try {
            player.destroy();
          } catch (error) {}
        }
      },
      getPlayer: () => {
        return player;
      },
    };
  });
  // return <div id={id} />;
  return (
    <Spin spinning={spinning} wrapperClassName={styles.cusSpin} size="large">
      <div id={id} />
    </Spin>
  );
});

export default FlvVideo;
