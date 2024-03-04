import { Indicator } from '@/components/StatisticCard';
import { indicatorBasic } from '@/services/bi';
import { useEffect, useState } from 'react';

export default () => {
  const [data, setData] = useState<IndicatorBasicType>({
    project: 0,
    park: 0,
    passage: 0,
    onlinePark: 0,
  });
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const queryDetail = async () => {
    const res = await indicatorBasic({ projectIds: [project.bid] });
    setData(res.data || {});
  };
  useEffect(() => {
    queryDetail();
  }, []);
  return (
    <>
      <Indicator
        style={{ marginBottom: '15px' }}
        label="上线车场总数/车场总数"
        labelStyle={{ fontWeight: 'bold', marginBottom: '20px' }}
        className="mt-5"
        notCountUp={true}
        value={`${data.onlinePark}/${data.park}`}
        unit=""
        size="large"
      />
      <Indicator
        label="当前总通道数"
        labelStyle={{ fontWeight: 'bold', marginBottom: '20px' }}
        className="mt-5"
        value={data.passage}
        unit=""
        size="large"
      />
    </>
  );
};
