import { Button, Modal } from 'antd';
import { useEffect, useRef } from 'react';
import Method from '@/utils/Method';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  saveImage: (files: File) => Promise<void>;
  width: number; // 生成图片大小
};

const CameraComponent: React.FC<IProps> = ({ modalVisit, onOpenChange, saveImage, width }) => {
  const cameraVideoRef = useRef(null);
  const cameraCanvasRef = useRef(null);

  function successFunc(mediaStream: any) {
    const video: any = cameraVideoRef.current;
    const canvas: any = cameraCanvasRef.current;
    // const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    // 旧的浏览器可能没有srcObject
    if ('srcObject' in video) {
      video.srcObject = mediaStream;
    }
    video.onloadedmetadata = () => {
      video.play();
    };
  }

  function errorFunc(err: any) {
    console.log(`${err.name}: ${err.message}`);
    // always check for errors at the end.
  }
  // 启动摄像头
  const openMedia = () => {
    // 打开摄像头
    const opt = {
      audio: false,
      video: {
        width: 800,
        height: 800,
      },
    };
    navigator.mediaDevices.getUserMedia(opt).then(successFunc).catch(errorFunc);
  };
  // 关闭摄像头
  const closeMedia = () => {
    // const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    const video: any = cameraVideoRef.current;
    const stream = video.srcObject;
    if ('getTracks' in stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track: any) => {
        track.stop();
      });
    }
  };

  const dataURLToBlob = (dataurl: string) => {
    const arr: any = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const getImg = () => {
    // 获取图片资源
    // const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    // const canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
    const video: any = cameraVideoRef.current;
    const canvas: any = cameraCanvasRef.current;
    if (canvas == null) {
      return;
    }
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    ); // 把视频中的一帧在canvas画布里面绘制出来
    const imgStr = canvas.toDataURL('image/jpg', 0.8); // 将图片资源转成字符串
    const blob = dataURLToBlob(imgStr);
    const files = new File([blob], Method.getUuid() + '.jpg', { type: 'image/jpg' });
    saveImage(files);
    closeMedia(); // 获取到图片之后可以自动关闭摄像头
    onOpenChange(false);
  };

  useEffect(() => {
    if (modalVisit) {
      openMedia();
    }
  }, [modalVisit]);

  return (
    <Modal
      title="拍照"
      width={848}
      open={modalVisit}
      onCancel={() => {
        onOpenChange(false);
        closeMedia();
      }}
      centered
      footer={[
        <Button
          key="back"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={() => {
            getImg();
          }}
        >
          保存
        </Button>,
      ]}
    >
      <video
        id="cameraVideo"
        ref={cameraVideoRef}
        style={{
          width: '800px',
        }}
      />
      <canvas
        id="cameraCanvas"
        ref={cameraCanvasRef}
        width={width}
        height={width}
        style={{
          width: width + 'px',
          height: width + 'px',
          display: 'none',
        }}
      />
    </Modal>
  );
};

export default CameraComponent;
