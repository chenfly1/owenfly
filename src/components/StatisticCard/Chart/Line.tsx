import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { CSSProperties } from 'react';
type IProps = {
  options?: any;
  style?: CSSProperties;
  category?: string[];
  data?: any[];
};
const colorList = ['#165DFF ', '#14C9C9', '#9FDB1D', '#F7BA1E', '#722ED1', '#14C9C9 '];
const colorEndList = [
  'rgba(22, 93, 225, 0.1) ',
  'rgba(20, 201, 201, 0.1) ',
  'rgba(159, 219, 29, 0.1) ',
  'rgba(217, 188, 20, 0.1) ',
  'rgba(133, 76, 178, 0.1)',
  'rgba(20, 201, 201, 0.1) ',
];
export default (props: IProps) => {
  let defaultOptions = {
    grid: { top: 8, right: 36, bottom: 40, left: 36 },
    xAxis: {
      type: 'category',
      data: props.category,
    },
    yAxis: {
      type: 'value',
    },
    color: colorList,
    series: (props?.data || []).map((item, index) => {
      return {
        name: item.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: item.data,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: colorList[index],
            },
            {
              offset: 1,
              color: colorEndList[index],
            },
          ]),
        },
        ...item,
      };
    }),
    tooltip: {
      trigger: 'axis',
    },
  };
  defaultOptions = { ...defaultOptions, ...props.options };
  console.log('defaultOptions: ', defaultOptions);

  return <ReactECharts option={defaultOptions} style={props.style} />;
};
