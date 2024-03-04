import { useEffect, useRef } from 'react';

// 返回组件的挂载状态，如果还没挂载或者已经卸载，返回false；反之，返回true
export const useMountedRef = () => {
  const mountedRef = useRef(false);

  useEffect(() => {
    //页面加载完调用
    mountedRef.current = true;
    //页面卸载调用
    return () => {
      mountedRef.current = false;
    };
  });
  return mountedRef;
};
