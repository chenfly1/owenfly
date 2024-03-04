import ReactECharts from 'echarts-for-react';
import type { CSSProperties } from 'react';
type IProps = {
  options?: any;
  style?: CSSProperties;
  category: string[];
  data: any[];
};
const colorList = ['#165DFF ', '#14C9C9', '#9FDB1D', '#F7BA1E', '#722ED1', '#14C9C9 '];
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
    series: props.data.map((item) => {
      return {
        type: 'line',
        smooth: true,
        data: item,
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
