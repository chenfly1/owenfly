import ReactECharts from 'echarts-for-react';
import type { CSSProperties } from 'react';
import 'echarts-liquidfill/src/liquidFill.js';
import defaultSettings from '../../../../config/defaultSettings';
type IProps = {
  options?: any;
  style?: CSSProperties;
};
export default (props: IProps) => {
  const value = 0.2104;
  let defaultOptions = {
    series: [
      {
        type: 'liquidFill',
        radius: '78.1%',
        center: ['50%', '50%'],
        color: ['#ecf3fe', '#c8dcfe', defaultSettings.primaryColor],
        data: [value, value, value], // data个数代表波浪数
        amplitude: 15,
        // 图形样式
        itemStyle: {
          opacity: 1, // 波浪的透明度
          shadowBlur: 0, // 波浪的阴影范围
        },
        backgroundStyle: {
          borderWidth: 2,
          borderColor: defaultSettings.primaryColor,
          color: '#fff',
        },
        label: {
          show: true,
          textStyle: {
            color: defaultSettings.primaryColor,
            insideColor: '#12786f',
            fontSize: 15,
          },
          formatter: (params: any) => {
            return `${(params.value * 100).toFixed(2)}%`;
          },
        },
        outline: {
          show: false,
        },
      },
    ],
  };
  defaultOptions = { ...defaultOptions, ...props.options };
  console.log('defaultOptions: ', defaultOptions);

  return <ReactECharts option={defaultOptions} style={props.style} />;
};
