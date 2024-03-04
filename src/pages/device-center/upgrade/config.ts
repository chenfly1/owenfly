export enum SourceEnum {
  'local' = 1,
  'remote' = 2,
}

export enum StateEnum {
  'apply' = '预约中',
  'upgrade' = '升级中',
  'done' = '已结束',
}

export enum UpgradeResEnum {
  'success' = '成功',
  'fail' = '失败',
}

export const UpgradeSourceMap = {
  firmware: 'android',
  'mcu-firmware': 'mcu',
  // 'android-sytem-firmware': 'android-sytem-firmware',
};

export const SourceMap = {
  '1': '本地上传',
  '2': '云端获取',
};

export const UpgradeTypeMap = {
  firmware: '模组固件',
  'mcu-firmware': 'MCU固件',
  // 'android-sytem-firmware': '安卓系统固件',
};

export const StateMap = {
  [StateEnum.apply]: StateEnum.apply,
  [StateEnum.upgrade]: StateEnum.upgrade,
  [StateEnum.done]: StateEnum.done,
};

export const DependencyVersionUpgradeOptions = [
  {
    label: '不更新',
    value: '0',
  },
  {
    label: '更新',
    value: '1',
    disabled: true,
  },
];

export const DependencyVersionUpgradeMap = DependencyVersionUpgradeOptions.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.value]: curr.label,
  }),
  {},
);

export const RetryTaskOptions = [
  {
    label: '不重试',
    value: '0',
  },
  {
    label: '重试',
    value: '1',
    disabled: true,
  },
];

export const RetryTaskMap = RetryTaskOptions.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.value]: curr.label,
  }),
  {},
);

export const UpgradeResMap = {
  [UpgradeResEnum.success]: UpgradeResEnum.success,
  [UpgradeResEnum.fail]: UpgradeResEnum.fail,
};
