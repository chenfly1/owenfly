import { queryPeriodList } from '@/services/door';
import { useState } from 'react';

// 同步 load 状态，防止因 state 的异步特性导致重复请求
const syncLoad: Record<string, boolean> = {};

interface WrapperInitedState<T> {
  value: T;
  inited?: boolean;
  loading?: boolean;
}

export interface PassCenterState {
  periodList: WrapperInitedState<Record<string, any>>; // 计量位置树
}

// 初始化默认值
const initValue = (value: PassCenterState[keyof PassCenterState]['value']) => ({
  value,
  inited: false,
  loading: false,
});

export default () => {
  const [state, setState] = useState({
    periodList: initValue([]),
  } as PassCenterState);

  const updateState = async (key: keyof PassCenterState, init = true) => {
    if (state[key] && ((init && state[key].inited) || syncLoad[key])) return;
    let values: PassCenterState[typeof key]['value'];
    syncLoad[key] = true;
    setState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
      },
    }));
    try {
      switch (key) {
        case 'periodList': {
          const res = await queryPeriodList();
          values =
            res.data.map((i: any) => ({ ...i, value: i.id.toString(), label: i.name })) || [];
          break;
        }
        default: {
          break;
        }
      }
      syncLoad[key] = false;
      setState((prev) => ({
        ...prev,
        [key]: {
          inited: true,
          loading: false,
          value: values || prev[key].value,
        },
      }));
    } catch (err) {
      syncLoad[key] = false;
      setState((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
        },
      }));
    }
  };

  return {
    ...state,
    updateState,
  };
};
