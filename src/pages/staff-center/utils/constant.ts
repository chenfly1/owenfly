import type { DataNode } from 'antd/lib/tree';
import { request } from 'umi';

export enum parkTitles {
  projectName = '项目名称',
  projectNum = '项目编号',
  areaNum = '区域编号',
  areaName = '区域名称',
  belongYard = '所属车场',
  belongProject = '所属项目',
  total = '区域总车位数',
  fullAccess = '满位是否允许进入',

  alitaYardName = '车场名称',
  alitaYardNo = '车场编号',

  yardName = '车场名称',

  channelName = '通道名称',
  channelType = '通道类型',
  channelStatus = '通道使用状态',

  ruleName = '套餐名称',
  ruleUsage = '套餐用途',
  rulePrice = '套餐价格',
  ruleCycleTime = '套餐周期',
  ruleAceessAreas = '准入区域',
}

export const parkChildType = {
  yard: 'park', // 车场
  area: 'area', // 区域
  channel: 'passage', // 通道
};

export enum yardStatusEnum {
  '未启用',
  '已上线',
  '已下线',
}

export const serviceTypeEnum = {
  1: '产权',
  2: '月租',
  3: '免费',
  4: '其他',
};

export const serviceTypeOptions = Object.keys(serviceTypeEnum).map((item) => ({
  label: serviceTypeEnum[item],
  value: Number(item),
}));

export const chargeModeEnum = {
  1: '按时收费',
  2: '计次收费',
  3: '阶梯收费',
};

export const chargeHolidayModeEnum = {
  1: '不区分',
  2: '工作日',
  3: '节假日',
};

/** 查找区域 */
export const getChildArea = (
  orgList: ParkAreaTreeType[],
  childKey: string,
): ParkAreaTreeType | undefined => {
  const list = orgList.filter((c) => c.id == childKey);
  if (list.length) {
    return list[0];
  }
  return undefined;
};

const cycleAddRootChild = (ids: string[], dataList: ParkAreaTreeType[]) => {
  dataList.forEach((d) => {
    if (d.child?.length) {
      cycleAddRootChild(ids, d.child);
    } else {
      if (d.id && d.type == parkChildType.channel) {
        ids.push(d.id);
      }
    }
  });
};

export const cycleAddChildId = (
  originSelectIds: string[],
  ids: string[],
  dataList: ParkAreaTreeType[],
) => {
  dataList.forEach((el) => {
    if (el.id && originSelectIds.indexOf(el.id) == -1) {
      // 这一级没有找到，继续找
      if (el.child?.length) {
        cycleAddChildId(originSelectIds, ids, el.child);
      }
    } else {
      // 这一级找到，处理
      if (el.child?.length) {
        cycleAddRootChild(ids, el.child);
      } else {
        if (el.type == parkChildType.channel && el.id) {
          ids.push(el.id);
        }
      }
    }
  });
};

/** 提取树下通道列表 */
export const generateChildList = (list: ParkAreaTreeType[], gList: ParkAreaTreeType[]) => {
  for (let index = list.length - 1; index >= 0; index--) {
    const aChild = list[index];

    if (aChild.child && aChild.child.length) {
      generateChildList(aChild.child, gList);
    } else {
      if (aChild.type == parkChildType.channel && aChild.id) {
        gList.push(aChild);
      }
    }
  }
};

const getNodeParent = (list: DataNode[], parentKey: string): DataNode | undefined => {
  for (let index = list.length - 1; index >= 0; index--) {
    const aChild = list[index];
    if (aChild.key == parentKey) {
      return aChild;
    }
    if (aChild.children && aChild.children.length) {
      const parent = getNodeParent(aChild.children as any, parentKey);
      if (parent != undefined) {
        return parent;
      }
    }
  }
  return undefined;
};

/** 形成tree数据 */
export const generateTreeNodes = (
  orgList: ParkAreaTreeType[],
  newList: DataNode[],
  parentKey: string,
) => {
  orgList.forEach((item) => {
    const { name, id, child } = item;
    const node: DataNode = { title: name, key: id as any };
    // 收起来
    if (!parentKey.length) {
      newList.push(node);
    } else {
      // 取出父后存
      const p = getNodeParent(newList, parentKey);
      if (p != undefined) {
        let children = p?.children ?? [];
        children = [...children, node];
        p.children = children;
      }
    }

    if (child?.length) {
      generateTreeNodes(child, newList, id as string);
    }
  });
};

export const exportExcel = (
  url: string,
  name: string,
  params: Record<string, any>,
  method?: string,
) => {
  request(url, {
    method: method || 'GET',
    params,
    data: params,
    timeout: 600000,
    responseType: 'blob',
  }).then((res: any) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });
    const fileName = name + '.xlsx';
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(blob, fileName);
    } else {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    }
  });
};
