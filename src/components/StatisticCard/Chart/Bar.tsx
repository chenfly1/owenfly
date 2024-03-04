import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts/types/dist/shared';
import { defaultColors, ChartProps, barGridMap, getLegendAndData } from './config';
import type { CSSProperties } from 'react';

interface transformSourceConfigItem {
  categoryKey: string;
  valueKey: string;
}

interface BarChartProps<T> extends ChartProps<T> {
  category?: string[];
  source?: Record<string, T[]>;
  transformSourceConfig?: transformSourceConfigItem | transformSourceConfigItem[];
  swap?: boolean;
  grid?: EChartsOption['grid'];
  style?: CSSProperties;
}

export const getBarCategoryAndSource = <T extends object>(
  source: Record<string, T[]>,
  config: BarChartProps<T>['transformSourceConfig'],
) => {
  const labels = Object.keys(source);
  const [categories, data] = Object.values(source).reduce(
    (prev, curr, index) => {
      const con: transformSourceConfigItem = config?.[index] || config?.[0] || config || {};
      curr.forEach((item) => prev[0].add(item[con?.categoryKey]));
      prev[1][index] = (prev[1][index] || []).concat(curr.map((item) => item[con?.valueKey]));
      return prev;
    },
    [new Set(), []] as [Set<string>, (string | number)[][]],
  );
  return {
    labels,
    categories: [...categories],
    source: data.map((item, index) => {
      return {
        type: 'bar',
        name: labels[index],
        data: item,
      };
    }),
  };
};

export default <T extends object>(props: BarChartProps<T>) => {
  const getOptionByProps = () => {
    const {
      colors = defaultColors,
      category,
      transformSourceConfig,
      source,
      legend,
      getOption,
      grid,
      swap = false,
    } = props;
    let series: any = source;
    let categories = category;
    if (transformSourceConfig) {
      const res = getBarCategoryAndSource(source || {}, transformSourceConfig);
      series = res.source;
      categories = categories || res.categories;
    }
    const [legendOption, data] = getLegendAndData(legend, series, colors);

    // 设置图形位置
    let barGrid = grid;
    if (!barGrid && typeof legend?.position !== 'object') {
      barGrid = barGridMap[legend?.position || 'bottom'];
    }
    const option: EChartsOption = {
      color: colors,
      legend: legendOption,
      grid: { ...(barGrid || {}), containLabel: true },
      ...(swap
        ? {
            xAxis: {
              type: 'value',
            },
            yAxis: {
              data: categories,
            },
          }
        : {
            xAxis: {
              data: categories,
            },
            yAxis: {
              type: 'value',
            },
          }),
      series: data.map((item) => ({ ...item, type: 'bar' })),
    };
    return getOption ? getOption(option) : option;
  };
  return <ReactECharts notMerge={true} option={getOptionByProps()} style={props.style} />;
};
