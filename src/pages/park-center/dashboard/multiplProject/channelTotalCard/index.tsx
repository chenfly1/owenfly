import { Indicator } from '@/components/StatisticCard';
import { indicatorBasic } from '@/services/bi';
import { useMemo, useState } from 'react';
type IProps = {
  projectIds: string[];
};

const App: React.FC<IProps> = ({ projectIds }) => {
  const [data, setData] = useState<IndicatorBasicType>({
    project: 0,
    park: 0,
    passage: 0,
    onlinePark: 0,
  });
  const queryDetail = async () => {
    if (projectIds && projectIds.length > 0) {
      const res = await indicatorBasic({ projectIds: projectIds });
      setData(res.data || {});
    }
  };
  useMemo(() => {
    queryDetail();
  }, [projectIds]);
  return (
    <>
      <Indicator
        style={{ marginBottom: '15px' }}
        label="当前项目总数"
        labelStyle={{ fontWeight: 'bold', marginBottom: '20px' }}
        className="mt-5"
        value={data.project}
        unit=""
        size="large"
      />
      <Indicator
        label="上线车场总数/车场总数"
        labelStyle={{ fontWeight: 'bold', marginBottom: '20px' }}
        className="mt-5"
        notCountUp={true}
        value={`${data.onlinePark}/${data.park}`}
        unit=""
        size="large"
      />
    </>
  );
};

export default App;
