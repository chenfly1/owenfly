import { Events } from '../sdk/interface';

// JSON parse
export const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.log('safe-parse', err);
    return str.toString();
  }
};

/** 获取当前流程节点信息 */
export const getMatchNode = (config: object, nodeName?: string) => {
  const process: any = config?.['bpmn2:definitions']?.['bpmn2:process'] || {};
  // 默认取开始节点
  let match = process['bpmn2:startEvent'];
  // 若指定节点则取该节点信息
  if (nodeName) {
    match = ([] as any)
      .concat(...Object.values(process).map((item) => (Array.isArray(item) ? item : [item])))
      .find((item: any) => item.id === nodeName);
  }
  // 获取节点扩展属性
  const extensionProperty: Record<string, any>[] = [].concat(
    match?.['bpmn2:extensionElements']?.['flowable:properties']?.['flowable:property'] || [],
  );

  return {
    id: match?.id,
    name: match?.name,
    extension: (extensionProperty || []).reduce(
      (prev, curr) => ({
        ...prev,
        [curr.name]: safeParse(curr.value),
      }),
      {},
    ),
  };
};

export const FormEvents = [
  Events.onFormMount,
  Events.onFormUnMount,
  Events.onFormReset,
  Events.onFieldValueChange,
] as string[];
