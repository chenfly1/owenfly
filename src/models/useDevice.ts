import { getDeviceTypeList, getProducts, getUpgradeSourceVersion } from '@/services/device';
import { getTenantList } from '@/services/flow';
import { getProjectAllList } from '@/services/mda';
import { getTotalPageSource } from '@/utils/Request';
import { useState } from 'react';

// 同步 load 状态，防止因 state 的异步特性导致重复请求
const syncLoad: Record<string, boolean> = {};

interface WrapperInitedState<T> {
  value: T;
  inited?: boolean;
  loading?: boolean;
}

export interface DeviceState {
  productMap: WrapperInitedState<Record<string, string>>; // 产品列表映射
  tenantMap: WrapperInitedState<Record<string, string>>; // 租户列表映射
  projectMap: WrapperInitedState<Record<string, string>>; // 项目列表映射
  upgradeSourceMap: WrapperInitedState<Record<string, string>>; // 升级资源列表映射
  deviceTypeMap: WrapperInitedState<Record<string, string>>; // 设备类型映射
}

// 初始化默认值
const initValue = (value: DeviceState[keyof DeviceState]['value']) => ({
  value,
  inited: false,
  loading: false,
});

// 获取映射对象第一个属性 key
export const getFirstValue = (mapValue: Record<string, string>) => {
  return Object.keys(mapValue)?.[0];
};

export default () => {
  const [state, setState] = useState({
    productMap: initValue({}),
    tenantMap: initValue({}),
    projectMap: initValue({}),
    upgradeSourceMap: initValue({}),
    deviceTypeMap: initValue({}),
  } as DeviceState);

  const updateState = async (key: keyof DeviceState, init = true) => {
    if (state[key] && ((init && state[key].inited) || syncLoad[key])) return;
    let values: DeviceState[typeof key]['value'];
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
        case 'productMap': {
          const res = await getProducts();
          values = res.reduce(
            (prev, curr) => ({
              ...prev,
              [curr.productId]: curr.productName,
            }),
            {},
          );
          break;
        }
        case 'tenantMap': {
          const res = await getTotalPageSource(getTenantList, { pageNo: 1, pageSize: 2000 });
          values = res?.items?.reduce(
            (prev, curr) => ({
              ...prev,
              [curr.code]: curr.name,
            }),
            {},
          );
          break;
        }
        case 'projectMap': {
          const res = await getProjectAllList();
          values = res?.data?.items?.reduce(
            (prev, curr) => ({
              ...prev,
              [curr.bid]: curr.name,
            }),
            {},
          );
          break;
        }
        case 'upgradeSourceMap': {
          const res = await getUpgradeSourceVersion({ name });
          values = {
            [`${res?.definition?.versionCode}`]: res?.definition?.versionName,
          };
          break;
        }
        case 'deviceTypeMap': {
          const res = await getDeviceTypeList();
          values = res.data.reduce(
            (prev, curr) => ({
              ...prev,
              [curr.code]: curr.name,
            }),
            {},
          );
          break;
        }
        default: {
          values = {};
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
