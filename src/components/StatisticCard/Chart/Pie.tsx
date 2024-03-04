import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts/types/dist/shared';
import type { CompareIndicatorProps } from '../CompareIndicator';
import { ChartProps, defaultColors } from './config';
import { pieCenterMap, pieRadius, pieInsideContentRich, getLegendAndData } from './config';

interface InsideContent {
  label: string;
  value: string | number;
  compare?: CompareIndicatorProps;
  rich?: Partial<typeof pieInsideContentRich>;
}

export interface PieChartProps<T> extends ChartProps<T> {
  // 源数据
  source?: T[];
  // 中心内容配置
  insideContent?: InsideContent;
  // 饼图中心位置
  center?: [string, string];
  // 饼图圆环占比
  radius?: [string, string];
}

export default <T extends object>(props: PieChartProps<T>) => {
  const {
    source,
    getOption,
    insideContent,
    legend,
    center,
    radius,
    style,
    colors = defaultColors,
  } = props;
  const getOptionByProps = () => {
    const [legendOption, data] = getLegendAndData(legend, source, colors);
    // 设置饼图中心位置
    let centerValue = center;
    if (!centerValue) {
      // 不显示图例时，饼图位置默认居中; 图例位置使用描述词时，设置对应的饼图位置
      if (legendOption?.show === false) {
        centerValue = pieCenterMap.default;
      } else if (typeof legend?.position !== 'object') {
        centerValue = pieCenterMap[legend?.position || 'bottom'];
      }
    }
    const option: EChartsOption = {
      tooltip: {
        show: true,
        trigger: 'item',
      },
      color: colors,
      legend: legendOption,
      series: [
        {
          // name: 'main',
          type: 'pie',
          center: centerValue ?? pieCenterMap.default,
          radius: radius || pieRadius,
          avoidLabelOverlap: false,
          data,
          // silent: true,
          label: {
            show: false,
          },
        },
      ],
    };
    if (insideContent) {
      option.series = ([] as any[]).concat(option.series).concat({
        type: 'pie',
        radius: ['0%', '0%'],
        center: centerValue ?? pieCenterMap.default,
        itemStyle: { color: 'transparent' },
        label: {
          position: 'inside',
          formatter: () => {
            let str = `${insideContent.label ? `{label|${insideContent.label}}\n` : ''}{value|${
              insideContent.value || '0'
            }}`;
            if (insideContent.compare) {
              let compareStr = `{clabel|${insideContent.compare.label}}`;
              if (insideContent.compare.direction === 'top') {
                compareStr += `{ctvalue|${insideContent.compare.value}}{top|}`;
              } else if (insideContent.compare.direction === 'down') {
                compareStr += `{cdvalue|${insideContent.compare.value}}{down|}`;
              } else {
                compareStr += `{cvalue|${insideContent.compare.value}}`;
              }
              str += `\n${compareStr}`;
            }
            return str;
          },
          rich: {
            ...pieInsideContentRich,
            ...insideContent?.rich,
          },
        },
        data: [0],
        silent: true,
        labelLine: {
          show: false,
        },
      });
    }

    return getOption ? getOption(option) : option;
  };

  return <ReactECharts option={getOptionByProps()} style={style} />;
};
