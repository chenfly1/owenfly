import { PieChart } from '@/components/StatisticCard';
import { getDevicesCountType } from '@/services/bi';
import { useMemo, useState } from 'react';

type IProps = {
  dates?: string[];
  projectIds?: string[];
  parkIds?: string[];
  isRate?: number;
};

const App: React.FC<IProps> = ({ dates, projectIds, parkIds, isRate }) => {
  const [total, setTotal] = useState<number>(0);
  const [detailData, setDetailData] = useState<Record<string, any>[]>([]);
  const queryDetail = async () => {
    const res = await getDevicesCountType({
      projectIds: projectIds,
    });
    setDetailData(res.data);
  };
  useMemo(() => {
    setTotal(0);
    queryDetail();
  }, [projectIds]);

  const source = useMemo(() => {
    let sum = 0;
    if ((detailData || []).length !== 0) {
      sum = (detailData || [])
        .map((i) => i.count)
        .reduce(function (prev, curr) {
          return prev + curr;
        });
      setTotal(sum);
    }
    return (detailData || []).map((item) => {
      return {
        value: item.count,
        name: item.typeName,
        rate: ((item.count / sum) * 100).toFixed(2) + '%',
      };
    });
  }, [detailData]);
  return (
    <>
      <PieChart
        style={{ height: '266px' }}
        source={source}
        center={['30%', 'center']}
        legend={{
          key: 'name',
          position: 'right',
          format: (name, row) => {
            return [name, row.rate];
          },
          rich: {
            name: {
              width: 60,
              padding: [0, 0, 0, 10],
              align: 'left',
            },
            rate: {
              width: 0,
            },
          },
          x: 'auto',
          right: '15%',
          top: 'center',
        }}
        insideContent={{
          label: '设备总数',
          value: total,
        }}
        getOption={(option) => ({
          ...option,
          tooltip: {
            trigger: 'item',
            formatter: function (params: any) {
              const str = `
              <div style="display: flex; justify-content: space-between;">
                <div style="margin-right: 8px">${params.marker}</div>
                <div style="width: 100px">
                  <span style="color:#000520">${params.data.name}</span></br>
                  <span>数量</span></br>
                  <span style="color:#000520">${params.data.value}</span>
                </div>
                <div>
                  <span> </span></br>
                  <span>占比</span></br>
                  <span style="color:#000520">${params.data.rate}</span>
                </div>
              </div>`;
              return str;
            },
          },
        })}
      />
    </>
  );
};

export default App;
