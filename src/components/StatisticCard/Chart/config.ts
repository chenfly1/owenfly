import type { EChartsOption } from 'echarts-for-react';

/** 公共配置 */
export interface ChartLegend<T> extends Record<string, any> {
  show?: boolean;
  key?: string;
  data?: string[];
  position?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | { x?: string; y?: string; orient?: 'horizontal' | 'vertical' };
  format?: (name: string, row: T) => any;
  width?: number;
}
export interface ChartProps<T> {
  // 图例颜色配置
  colors?: string[];
  // 图例常用配置
  legend?: ChartLegend<T>;
  // 自定义配置
  getOption?: (option: EChartsOption) => EChartsOption;
  style?: React.CSSProperties;
}

export const defaultColors = [
  '#0D74FF',
  '#fc910b',
  '#09d9be',
  '#0da9FF',
  '#d967e7',
  '#a539dc',
  '#55ed66',
  '#44EB57',
  '#FCA029',
  '#6DD455',
  '#E5E8EF',
  '#9D6FEE',
  '#FC7370',
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
  '#75bedc',
  '#ef6567',
  '#91cd77',
  '#f9c956',
];
export const getColorRich = (colors: string[]) =>
  colors.reduce(
    (prev, color) => ({
      ...prev,
      [color.slice(1)]: {
        width: 10,
        height: 10,
        borderRadius: 100,
        backgroundColor: color,
      },
    }),
    {},
  );
export const legendPosMap = {
  top: {
    orient: 'horizontal',
    x: 'center',
    y: 'top',
  },
  right: {
    orient: 'vertical',
    x: '55%',
    y: 'center',
  },
  bottom: {
    orient: 'horizontal',
    x: 'center',
    y: 'bottom',
  },
  left: {
    orient: 'vertical',
    x: 'left',
    y: 'center',
  },
};
export const directionIconMap = {
  top: '/images/compare_top.svg',
  down: '/images/compare_down.svg',
};

const legendElements = new Array(10)
  .fill({
    width: 60,
    padding: [0, 0, 0, 10],
    align: 'left',
  })
  .reduce(
    (prev, item, index) => ({
      ...prev,
      [`_el${index}`]: item,
    }),
    {},
  );

export const getLegendAndData = <T>(
  legend: ChartLegend<T> = {},
  source: T[] = [],
  colors: string[],
): [EChartsOption['legend'], (T & { name: string | number })[]] => {
  const { key = 'name', position = 'bottom', width = 'auto', format, rich, ...restLegend } = legend;
  // 图例位置具体配置
  let legendPostion = {};
  // 图例位置使用描述词时，设置对应的饼图位置
  if (typeof position === 'string') {
    legendPostion = { ...legendPosMap[position], ...restLegend };
  } else {
    legendPostion = {
      x: position?.x ?? 'center',
      y: position?.y ?? 'center',
      orient: position?.orient ?? 'horizontal',
      ...restLegend,
    };
  }
  // 补充图例名称属性
  const data = source.map((item) => ({ ...item, name: item[key] }));
  return [
    {
      icon: 'none', // 自定义 icon 样式
      data: legend?.data,
      show: legend?.show ?? true,
      formatter: (name: string) => {
        const index: number = data.findIndex((item) => item.name === name);
        if (index < 0) return '';
        const iconColor = colors[index % colors.length].slice(1);
        const formatList = legend?.format?.(name, data[index]).map((text: any, i: any) => {
          return `{_el${[i]}|${text}}`;
        });
        return legend?.format
          ? `{${iconColor}|}${formatList.join('')}`
          : `{${iconColor}|}{name|${name}}`;
      },
      ...legendPostion,
      textStyle: {
        width: width ?? 'auto',
        height: 50,
        overflow: 'truncate',
        rich: {
          name: {
            width: 60,
            padding: [0, 0, 0, 10],
            align: 'left',
          },
          ...getColorRich(colors),
          ...legendElements,
          ...(rich || {}),
        },
      },
    },
    data,
  ];
};

/** 饼图配置 */
export const pieRadius = ['50%', '60%'];
export const pieCenterMap: Record<string, [string, string]> = {
  top: ['50%', '65%'],
  right: ['25%', '50%'],
  bottom: ['50%', '35%'],
  left: ['75%', '50%'],
  default: ['50%', '50%'],
};
export const pieInsideContentRich = {
  label: {
    fontSize: 12,
    color: `#616577`,
    lineHeight: 14,
    padding: [0, 0, 25, 0],
  },
  value: {
    fontSize: 25,
    color: `#1D2129`,
    lineHeight: 25,
    padding: [0, 0, 10, 0],
  },
  clabel: {
    fontSize: 12,
    color: `#616577`,
    lineHeight: 14,
    padding: [0, 5, 0, 0],
  },
  cvalue: {
    fontSize: 14,
    padding: [0, 0, 0, 0],
  },
  ctvalue: {
    fontSize: 14,
    color: '#F53F3F',
    lineHight: 17,
    padding: [0, 4, 0, 0],
  },
  cdvalue: {
    fontSize: 14,
    color: '#6dd455',
    lineHight: 17,
    padding: [0, 4, 0, 0],
  },
  top: {
    backgroundColor: {
      image: directionIconMap.top,
    },
  },
  down: {
    backgroundColor: {
      image: directionIconMap.down,
    },
  },
};

/** 柱状图配置 */
export const barGridMap = {
  top: {
    top: '20%',
  },
  right: {
    right: '30%',
  },
  bottom: {
    bottom: '20%',
  },
  left: {
    left: '30%',
  },
};
