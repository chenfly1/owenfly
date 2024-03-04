import { FLOWABLE_PREFIX } from '@/pages/flow-center/BPMN/core/constant/constants';
import { getTotalPageSource } from '@/services/energy';
import { getDicItems, getDicTypes, getMemberList, getTenantList } from '@/services/flow';
import { useState } from 'react';

export interface FlowState {
  // 流程引擎前缀
  prefix: string;
  // 流程id
  processId?: string;
  // 流程名称
  processName?: string;
  // 流程表单
  processFormSchema?: { form: Record<string, any>; schema: Record<string, any> };
  // 当前租户
  tenantId?: string;
}

export interface FlowTheme {
  borderRadius: number;
  // 基础主题色
  colorPrimary: string;
  // 暗夜模式
  darkMode: boolean;
}

interface WrapperInitedState<T> {
  value: T;
  inited?: boolean;
  loading?: boolean;
}

export interface FlowSource {
  // 租户列表
  tenants: WrapperInitedState<{ label: string; value: string }[]>;
  // 关联数据
  source: WrapperInitedState<{ label: string; value: string }[]>;
  // 人员列表
  __person__: WrapperInitedState<{ label: string; value: string }[]>;
  // 关联字典数据
  [key: string]: WrapperInitedState<{ label: string; value: string }[]>;
}

// 初始化默认值
const initValue = (value: FlowSource[keyof FlowSource]['value']) => ({
  value,
  inited: false,
  loading: false,
});

// 同步 load 状态，防止因 state 的异步特性导致重复请求
const syncLoad: Record<string, boolean> = {};

export default () => {
  const [flowState, setFLowState] = useState<FlowState>({
    prefix: FLOWABLE_PREFIX,
    processId: undefined,
    processName: undefined,
    processFormSchema: undefined,
    tenantId: undefined,
  });
  const [flowTheme, setFlowTheme] = useState<FlowTheme>({
    borderRadius: 6,
    colorPrimary: '#0D74FF',
    darkMode: false,
  });
  const [flowSource, setFlowSource] = useState<FlowSource>({
    tenants: initValue([]),
    source: initValue([]),
    __person__: initValue([]),
  });

  const updateState = async (key: keyof FlowSource, init = true, payload = {}) => {
    if (flowSource[key] && ((init && flowSource[key].inited) || syncLoad[key])) return;
    let values: FlowSource[typeof key]['value'];
    syncLoad[key] = true;
    setFlowSource((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
      },
    }));
    try {
      switch (key) {
        case 'tenants': {
          const res = await getTotalPageSource(getTenantList, { pageNo: 1, pageSize: 2000 });
          values = res.items.map(({ code, name }) => ({
            label: name,
            value: code,
          }));
          break;
        }
        case 'source': {
          const res = await getDicTypes();
          values = res.map((item) => ({
            label: item.name,
            value: item.code,
          }));
          break;
        }
        case '__person__': {
          const res = await getMemberList(payload);
          values = res.map((item) => ({
            label: item.name,
            value: item.code,
          }));
          break;
        }
        default: {
          const res = await getDicItems(payload);
          values = res.map((item) => ({
            label: item.name,
            value: item.code,
          }));
          break;
        }
      }
      syncLoad[key] = false;
      const newState = {
        inited: true,
        loading: false,
        value: values || flowSource[key].value,
      };
      setFlowSource((prev) => ({
        ...prev,
        [key]: newState,
      }));
      return newState;
    } catch (err) {
      syncLoad[key] = false;
      setFlowSource((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
        },
      }));
      return flowSource[key];
    }
  };

  return {
    flowState,
    flowTheme,
    ...flowSource,
    handlePrefix: (prefix: string) => setFLowState((prev) => ({ ...prev, prefix })),
    handleProcessId: (processId?: string) => setFLowState((prev) => ({ ...prev, processId })),
    handleProcessName: (processName?: string) => setFLowState((prev) => ({ ...prev, processName })),
    handleProcessFormSchema: (processFormSchema?: FlowState['processFormSchema']) =>
      setFLowState((prev) => ({ ...prev, processFormSchema })),
    handleColorPrimary: (colorPrimary: string) =>
      setFlowTheme((prev) => ({ ...prev, colorPrimary })),
    handleDarkMode: (darkMode: boolean) => setFlowTheme((prev) => ({ ...prev, darkMode })),
    handleTenant: (id?: string) => setFLowState((prev) => ({ ...prev, tenantId: id })),
    updateState,
    getSource: async (key: string, payload: any) => {
      if (flowSource[key]) return flowSource[key].value;
      const res = await updateState(key, true, payload);
      return res?.value ?? [];
    },
  };
};
