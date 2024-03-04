import Line from '@/components/StatisticCard/Chart/Line';
import { getUserAuthCountTrend } from '@/services/bi';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

type IProps = {
  dates?: string[];
  projectIds?: string[];
  parkIds?: string[];
  qryType?: string;
};

const App: React.FC<IProps> = ({ projectIds, dates, qryType }) => {
  const [detail, setDetail] = useState<any>({});
  const [unit, setUnit] = useState<string>('日');
  const [xData, setXData] = useState<any[]>([]);
  const [yData, setYData] = useState<number[]>([]);
  const queryDetail = async () => {
    let start;
    let end;
    if (qryType === 'day') {
      setUnit('日');
      start = dayjs().subtract(30, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      end = dayjs().subtract(1, 'day').format('YYYY-MM-DD') + ' 23:59:59';
    } else {
      setUnit('月');
      start =
        dayjs()
          .month(dayjs().month() - 12)
          .date(1)
          .format('YYYY-MM-DD') + ' 00:00:00';
      end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
    }
    const res = await getUserAuthCountTrend({
      projectIds: projectIds,
      start,
      end,
      qryType,
    });
    setDetail(res.data || {});
  };
  useMemo(() => {
    queryDetail();
  }, [qryType, projectIds]);

  useMemo(() => {
    setXData(
      (detail.xaxis &&
        detail.xaxis.map((i: string) => ({ value: Number(i.slice(i.length - 2)), time: i }))) ||
        [],
    );
    setYData(detail.authGraph || []);
  }, [detail]);
  return (
    <>
      <Line
        options={{
          yAxis: {
            type: 'value',
            name: '单位/人',
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
            name: unit,
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
                xData[params[0].dataIndex].time
              }<br />授权人数 <span style="color:#000520">${params[0].value}</span>人`;
              return str;
            },
          },
        }}
      />
    </>
  );
};

export default App;
