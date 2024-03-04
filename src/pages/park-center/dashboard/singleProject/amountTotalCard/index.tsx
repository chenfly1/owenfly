import { CompareIndicator, Indicator } from '@/components/StatisticCard';
type IProps = {
  data: ParkingFeeType;
  isRate: number;
};
const App: React.FC<IProps> = ({ data, isRate }) => {
  const totalTotalAmount = data?.totalTotalAmount || 0;
  const totalTotalAmountY = data?.totalTotalAmount / 100 || 0;
  const totalTotalAmountWY = data?.totalTotalAmount / 1000000 || 0;

  const totalCompare = data?.totalCompare || 0;
  const totalRate = parseFloat(data?.totalRate || '0');
  const totalPaidAmount = data?.totalPaidAmount || 0;
  const totalPaidAmountY = data?.totalPaidAmount / 100 || 0;
  const totalPaidAmountWY = data?.totalPaidAmount / 1000000 || 0;
  return (
    <>
      <Indicator
        label="总收入"
        value={totalTotalAmount > 1000000 ? totalTotalAmountWY : totalTotalAmountY}
        unit={totalTotalAmount > 1000000 ? '万元' : '元'}
        countProps={{
          decimals: 2,
        }}
        size="large"
        labelStyle={{ fontWeight: 'bold' }}
      />
      {isRate === 1 && (
        <CompareIndicator
          label="较前期"
          value={totalCompare + '%'}
          direction={totalCompare >= 0 ? 'top' : 'down'}
        />
      )}
      {isRate === 0 && <div style={{ minHeight: '22px' }} />}
      <Indicator
        className="mt-5"
        label="应收总数"
        countProps={{
          decimals: 2,
        }}
        value={totalPaidAmount > 1000000 ? totalPaidAmountWY : totalPaidAmountY}
        unit={totalPaidAmount > 1000000 ? '万元' : '元'}
        inline={true}
      />
      <Indicator
        label="实收率"
        value={totalRate}
        countProps={{
          decimals: 2,
        }}
        unit="%"
        inline={true}
      />
    </>
  );
};
export default App;
