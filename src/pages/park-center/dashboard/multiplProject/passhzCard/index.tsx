import { BarChart } from '@/components/StatisticCard';
import { authVehicStatic, parkPassDetailRank } from '@/services/bi';
import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

type IProps = {
  dates: string[];
  projectIds: string[];
  isRate: number;
  type: '0' | '1'; // 0:进场 1:出场
};

const App: React.FC<IProps> = ({ dates, projectIds, isRate, type }) => {
  const [detailData, setDetailData] = useState<ParkPassDetailRankType[]>([]);
  const [YData, setYData] = useState<string[]>(['项目1', '项目2', '项目3', '项目4', '项目5']);
  const [XData, setXData] = useState<number[]>([60, 72, 71, 74, 190, 130, 110]);
  const queryDetail = async () => {
    if (projectIds.length > 0) {
      const res = await parkPassDetailRank({
        pageSize: 10,
        pageNo: 1,
        projectIds: projectIds,
        start: dates[0],
        end: dates[1],
        isRate,
        type,
      });
      setDetailData(res.data.items || []);
    }
  };
  useMemo(() => {
    queryDetail();
  }, [dates, projectIds, type]);

  useMemo(() => {
    const YDataTem = detailData.map((item) => item.projectName ?? '');
    const XDataTem = detailData.map((item) => item.amount ?? 0);
    setYData(YDataTem);
    setXData(XDataTem);
  }, [detailData]);

  const getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: { show: false },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: YData,
          axisTick: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: type === '0' ? '进场' : '离场',
          type: 'bar',
          barWidth: 13,
          emphasis: {
            focus: 'series',
          },
          data: XData,
        },
      ],
    };
  };
  return <ReactECharts option={getOption()} />;
};

export default App;
