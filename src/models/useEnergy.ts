import { meterTypeEnum } from '@/pages/energy/config';
import { getMeasureTree, getMeterRootNode, getTotoalSource } from '@/services/energy';
import { useState } from 'react';

// 同步 load 状态，防止因 state 的异步特性导致重复请求
const syncLoad: Record<string, boolean> = {};

// 映射字段参数信息
const mappingFields = {
  categoryMap: 'TAG', // 分项信息
  insTypeMap: 'InsType', // 仪表类型
  publicTypeMap: 'PublicType', // 公区类型
  netStateMap: 'NetStateType', // 网络状态
  installStateMap: 'InstallationStateType', // 安装状态
  monitorTypeMap: 'MonitorType', // 预警类型
  energyTypeMap: 'EnergyType', // 能源类型
  monitorPointPeriodTypeMap: 'MonitorPointPeriodType', // 预警监控点周期类型
  carbonPeriodTypeMap: 'CarbonPeriodType', // 碳指标周期类型
  monitorPointTypeMap: 'MonitorPointType', // 预警监控点类型
  carbonStateTypeMap: 'CarbonStateType', // 碳系数状态类型
  monitorStateTypeMap: 'MonitorStateType', // 预警状态类型
} as const;

interface WrapperInitedState<T> {
  value: T;
  inited?: boolean;
  loading?: boolean;
}

export interface EnergyState
  extends Record<keyof typeof mappingFields, WrapperInitedState<Record<string, string>>> {
  measureTree: WrapperInitedState<MeasureTreeType[]>; // 计量位置树
  meterRootNode: WrapperInitedState<{ key: string; title: string; data: MeterItemType }>; // 仪表树根节点
  electricCategoryMap: WrapperInitedState<Record<string, string>>; // 电表分项
  waterCategoryMap: WrapperInitedState<Record<string, string>>; // 水表分项
}

// 初始化默认值
const initValue = (value: EnergyState[keyof EnergyState]['value']) => ({
  value,
  inited: false,
  loading: false,
});

// 依据请求数据生产计量位置树
const transformMeasureTree = (data: MeasureResTreeType[]): MeasureTreeType[] => {
  return data.map(({ item, children }) => {
    return {
      key: item.id,
      title: item.meterSpaceName,
      data: item,
      children: transformMeasureTree(children || []),
    };
  });
};

// 获取映射对象第一个属性 key
export const getFirstValue = (mapValue: Record<string, string>) => {
  return Object.keys(mapValue)?.[0];
};

export default () => {
  const [state, setState] = useState({
    measureTree: initValue([]),
    meterRootNode: initValue({ key: '', title: '' }),
    electricCategoryMap: initValue({}),
    waterCategoryMap: initValue({}),
    ...Object.keys(mappingFields).reduce(
      (prev, key) => ({
        ...prev,
        [key]: initValue({}),
      }),
      {},
    ),
  } as EnergyState);

  const updateState = async (key: keyof EnergyState, init = true) => {
    if (state[key] && ((init && state[key].inited) || syncLoad[key])) return;
    let values: EnergyState[typeof key]['value'];
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
        case 'measureTree': {
          const res = await getMeasureTree();
          values = transformMeasureTree([res]);
          break;
        }
        case 'meterRootNode': {
          const res = await getMeterRootNode();
          values = { key: `${res?.id}`, title: res?.cnName, data: res };
          break;
        }
        case 'electricCategoryMap': {
          values = await getTotoalSource('TAG', { param: { insType: meterTypeEnum.electric } });
          break;
        }
        case 'waterCategoryMap': {
          const [hot, cold] = await Promise.all([
            getTotoalSource('TAG', { param: { insType: meterTypeEnum.hotWater } }),
            getTotoalSource('TAG', { param: { insType: meterTypeEnum.coldWater } }),
          ]);
          values = { ...hot, ...cold };
          break;
        }
        default: {
          values = mappingFields[key] ? await getTotoalSource(mappingFields[key]) : [];
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
