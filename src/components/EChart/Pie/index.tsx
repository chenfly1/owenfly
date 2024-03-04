import ReactECharts from 'echarts-for-react';
import type { CSSProperties } from 'react';
type IProps = {
  options?: any;
  style?: CSSProperties;
};
export default (props: IProps) => {
  const colorList = ['#14C9C9 ', '#165DFF', '#9FDB1D', '#F7BA1E', '#722ED1', '#14C9C9 '];

  let defaultOptions = {
    title: {
      text: '车辆总数',
      subtext: '3000',
      textStyle: {
        fontSize: 12,
        color: '#999',
        lineHeight: 0,
      },
      subtextStyle: {
        fontSize: 28,
        color: '#1D2129',
      },
      textAlign: 'center',
      left: '18.8%',
      top: '40%',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: '2%',
      top: 'center',
      itemGap: 30,
      selectedMode: false,
      icon: 'circle',
      data: ['产权车辆', '月租车辆', '免费车辆', '其他车辆', '访客车辆'],
      textStyle: {
        color: '#77899c',
        rich: {
          uname: {
            width: 100,
          },
          unum: {
            color: '#4ed139',
            width: 10,
            align: 'right',
          },
        },
      },
      formatter(name: string) {
        return `{uname|${name}}{unum|1132}`;
      },
    },
    color: colorList,
    series: [
      {
        type: 'pie',
        radius: [60, 90],
        center: ['20%', '50%'],
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderWidth: 3,
          borderColor: '#fff',
        },
        data: [
          { name: '产权车辆', value: 100 },
          { name: '月租车辆', value: 100 },
          { name: '免费车辆', value: 100 },
          { name: '其他车辆', value: 100 },
          { name: '访客车辆', value: 100 },
        ],
      },
    ],
  };

  defaultOptions = { ...defaultOptions, ...props.options };
  console.log('defaultOptions: ', defaultOptions);

  return <ReactECharts option={defaultOptions} style={props.style} />;
};
