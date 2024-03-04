import Player from 'xgplayer';
import HlsPlayer from 'xgplayer-hls.js';
import FlvPlayer from 'xgplayer-flv.js';
import React, { forwardRef, useImperativeHandle, useLayoutEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { getMediaStream } from '@/services/monitor';
import { Spin } from 'antd';
import styles from './style.less';

type Iprops = {
  id: string;
  useRequestOptions?: Record<string, any>;
  ref?: any;
  style?: Record<string, any>;
  autoplay?: boolean;
  type?: 'flv' | 'hls';
};
const FlvVideo: React.FC<Iprops> = forwardRef(
  ({ id, autoplay = true, type = 'flv', ...rest }, ref) => {
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
    const fetchDeviceInfo = async (
      params: Record<string, any>,
      // dId: string,
      // date: string,
      // startTime?: string,
      // stopTime?: string,
    ): Promise<string> => {
      setSpinning(true);
      const startTimeT = params.startTime ? params.startTime : `${params.date} 00:00:00`;
      const stopTimeT = params.stopTime ? params.stopTime : `${params.date} 23:59:59`;
      const res = await getMediaStream({
        deviceId: params.id,
        protocol: params.type,
        streamType: 'main_code_stream',
        watchType: 'pass',
        startTime: `${startTimeT}`,
        stopTime: `${stopTimeT}`,
        mock: false,
      });
      setSpinning(false);
      return res.data.url;
    };

    // 创建播放器
    const createPlayer = (url: string) => {
      const params = {
        id,
        type: type,
        isLive: false,
        volume: 0.3,
        url,
        playsinline: true,
        autoplay,
        duration: 1,
        cors: true,
        height: '100%',
        width: '100%',
        playbackRate: [0.5, 1, 2, 4],
        screenShot: {
          saveImg: false,
          quality: '0.92',
          type: 'image/png',
          format: '.png',
        },
        ...rest,
      };
      const _player = type === 'flv' ? new FlvPlayer(params) : new HlsPlayer(params);
      _player.on('screenShot', (screenShotImg: any) => {
        cutPic(screenShotImg);
      });
      _player.on('error', () => {
        setTimeout(() => {
          _player.destroy();
          createPlayer(url);
        }, 1000);
      });

      setPlayer(_player);
    };

    const { run } = useRequest((params: Record<string, any>) => fetchDeviceInfo(params), {
      manual: true,
      refreshDeps: [type],
      ...rest?.useRequestOptions,
      onSuccess: (url) => {
        createPlayer(url);
      },
    });

    useImperativeHandle(ref, () => {
      return {
        createPlayer: (params: Record<string, any>) => {
          run(params);
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
    return (
      <Spin spinning={spinning} wrapperClassName={styles.cusSpin} size="large">
        <div id={id} {...rest} />
      </Spin>
    );
  },
);

export default FlvVideo;
