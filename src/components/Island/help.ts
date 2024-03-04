import * as ZR from 'zrender';

const img2DataURL = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, img.width, img.height);
  return canvas.toDataURL();
};

// 图片加载
export const loadImg = (
  src: string,
): Promise<{
  src: string;
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.setAttribute('crossOrigin', 'Anonymous');
    img.src = src;
    img.onerror = (err) => {
      console.log('island_load_img', err);
      reject(err);
    };
    img.onload = () => {
      resolve({
        src: img2DataURL(img),
        width: img.width,
        height: img.height,
      });
    };
  });
};

// 调整图片宽高
export const optimizeSize = (
  imgSize: { width: number; height: number },
  containerSize: { width: number; height: number },
) => {
  const containerRatio = containerSize.width / containerSize.height;
  const imgRatio = imgSize.width / imgSize.height;
  if (imgRatio > containerRatio) {
    return {
      ...imgSize,
      scale: containerSize.width / imgSize.width,
    };
  } else {
    return {
      ...imgSize,
      scale: containerSize.height / imgSize.height,
    };
  }
};

// 获取图片宽高
export const getImgSize = async ({ image, width, height }: ZR.ImageStyleProps) => {
  const res = { width, height };
  if (!image || (width && height)) return res;
  const img = typeof image === 'string' ? await loadImg(image) : image;
  res.width = res.width ?? img.width;
  res.height = res.height ?? img.height;
  return res;
};

// 进入全屏模式
export const requestFullscreen = (ele: any) => {
  if (ele.requestFullscreen) {
    ele.requestFullscreen();
  } else if (ele.webkitRequestFullscreen) {
    ele.webkitRequestFullscreen();
  } else if (ele.msRequestFullscreen) {
    ele.msRequestFullscreen();
  }
};

// 退出全屏模式
export const exitFullscreen = () => {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  } catch (err) {
    console.log(err);
  }
};
