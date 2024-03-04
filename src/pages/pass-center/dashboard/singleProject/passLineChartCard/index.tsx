import Line from '@/components/StatisticCard/Chart/Line';
import { getPassRecordCountTrend } from '@/services/bi';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

type IProps = {
  projectIds?: string[];
  passType?: string;
};

const App: React.FC<IProps> = ({ projectIds, passType }) => {
  const [detail, setDetail] = useState<any>({});
  const [xData, setXData] = useState<string[]>([]);
  const [yData, setYData] = useState<number[]>([]);
  const queryDetail = async () => {
    let start;
    let end;
    if (passType === 'today') {
      start = dayjs().format('YYYY-MM-DD') + ' 00:00:00';
      end = dayjs().format('YYYY-MM-DD') + ' 23:59:59';
    } else {
      start = dayjs().subtract(30, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      end = dayjs().subtract(1, 'day').format('YYYY-MM-DD') + ' 23:59:59';
    }
    const res = await getPassRecordCountTrend({
      projectIds: projectIds,
      start,
      end,
    });
    setDetail(res.data || {});
  };
  useMemo(() => {
    queryDetail();
  }, [passType]);

  useMemo(() => {
    setXData(detail.xaxis || []);
    setYData(detail.passGraph || []);
  }, [detail]);
  return (
    <>
      <Line
        options={{
          yAxis: {
            type: 'value',
            name: '单位/人次',
            nameTextStyle: {
              align: 'center',
              verticalAlign: 'bottom',
              padding: [0, 20, 10, 0],
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
          },
          xAxis: {
            type: 'category',
            name: '时',
            data: xData,
            axisTick: {
              show: false,
            },
          },
          grid: { top: 50, right: 36, bottom: 40, left: 60 },
          series: [
            {
              data: yData,
              type: 'line',
              smooth: true,
            },
          ],
          tooltip: {
            trigger: 'axis',
            formatter: function (params: any) {
              const str = `${
                params[0].axisValue > 9
                  ? params[0].axisValue + ':00'
                  : '0' + params[0].axisValue + ':00'
              }<br />通行频次 <span style="color:#000520">${params[0].value}</span>人次`;
              return str;
            },
          },
        }}
      />
    </>
  );
};

export default App;
