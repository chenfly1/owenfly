/**
 * 功能说明: 适时初始化 useModel 内定义的全局状态数据，适时时机一般在第一次进入应用模块页面时。
 * 注意事项: useModel 内状态文件需定义 updateState 方法用于初始化指定 key 状态数据。可参考 useEnergy 编写状态文件。
 */
import { useEffect } from 'react';
import { useModel } from 'umi';

const useInitState = <T>(
  modelName: 'useEnergy' | 'useFlow' | 'useDevice' | 'usePassCenter',
  keys: (keyof T)[],
) => {
  const state = useModel(modelName);

  useEffect(() => {
    if (state?.updateState) {
      keys.forEach((key) => state?.updateState(key as never));
    }
  }, []);

  return state as T;
};

export { useInitState };
