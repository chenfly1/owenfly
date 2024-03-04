import ReactECharts from 'echarts-for-react';
import type { CSSProperties } from 'react';
type IProps = {
  options?: any;
  style?: CSSProperties;
  category?: string[];
  data?: any[];
  type?: 'vertical' | 'horizontal'; //垂直 水平
};
const colorList = ['#165DFF ', '#14C9C9', '#9FDB1D', '#F7BA1E', '#722ED1', '#14C9C9 '];
export default (props: IProps) => {
  console.log('options: ', props.options);
  let defaultOptions = {
    grid: { top: 8, right: 36, bottom: 40, left: 36 },
    xAxis: {
      type: props.type === 'horizontal' ? 'category' : 'value',
      data: props.category,
    },
    yAxis: {
      type: props.type === 'horizontal' ? 'value' : 'category',
      data: props.type === 'vertical' && props.category,
    },
    color: colorList,
    series: (props?.data || []).map((item) => {
      return {
        type: 'bar',
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
