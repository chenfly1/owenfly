import { PieChart } from '@/components/StatisticCard';
import { deviceOnlineInfo } from '@/services/bi';
import { useEffect, useState } from 'react';
type IProps = {
  dates: string[];
  projectIds: string[];
};
const App: React.FC<IProps> = ({ dates, projectIds }) => {
  const [detail, setDetail] = useState<any>({
    online: 0,
    offline: 0,
    rate: '50%',
  });
  const queryDetail = async () => {
    if (projectIds.length > 0) {
      const res = await deviceOnlineInfo({
        projectIds: projectIds,
        start: dates[0],
        end: dates[1],
      });
      setDetail({
        online: res?.data?.online || 0,
        offline: res?.data?.offline || 0,
        rate: res?.data?.rate + '%' || '100%',
      });
    }
  };
  useEffect(() => {
    queryDetail();
  }, [dates, projectIds]);

  return (
    <>
      <PieChart
        style={{
          height: '130px',
        }}
        source={[
          { value: detail.online, name: '在线设备总数' },
          { value: detail.offline, name: '离线设备总数' },
        ]}
        center={['20%', '50%']}
        legend={{
          x: null,
          y: 'center',
          right: 10,
          position: 'right',
          format: (name, row) => {
            return [name, row.value];
          },
          rich: {
            name: {
              width: 100,
              padding: [0, 0, 0, 10],
              align: 'left',
            },
            _el1: {
              padding: [0, 0, 0, 20],
              align: 'left',
            },
          },
        }}
        insideContent={{
          label: '',
          value: detail.rate,
          rich: {
            value: {
              fontSize: 18,
              color: `#1D2129`,
              lineHeight: 34,
              padding: [0, 0, 10, 0],
            },
          },
        }}
        getOption={(option) => {
          return {
            ...option,
          };
        }}
        colors={['#0D74FFFF', '#E5E8EFFF']}
      />
    </>
  );
};
export default App;
