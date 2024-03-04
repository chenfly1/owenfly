// 全屏封装
export const launchIntoFullscreen = (element: any) => {
  if (element.requestFullscreen) {
    element?.requestFullscreen!();
  } else if (element.mozRequestFullScreen) {
    element?.mozRequestFullScreen!();
  } else if (element.webkitRequestFullscreen) {
    element?.webkitRequestFullscreen!();
  } else if (element.msRequestFullscreen) {
    element?.msRequestFullscreen!();
  }
};
// 退出全屏封装
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document?.mozCancelFullScreen) {
    document?.mozCancelFullScreen!();
  } else if (document?.webkitExitFullscreen) {
    document?.webkitExitFullscreen!();
  }
};
