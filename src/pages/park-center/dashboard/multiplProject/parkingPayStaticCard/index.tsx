import { CompareIndicator, Indicator, PieChart } from '@/components/StatisticCard';
import { Col, Row } from 'antd';

type IProps = {
  data: ParkingFeeType;
  type: 'lt' | 'yz';
  isRate: number;
};

const App: React.FC<IProps> = ({ data, type, isRate }) => {
  const detail: any = data[type] || {};
  const totalCompare = detail?.totalCompare || 0;
  const totalAmount = detail?.totalAmount / 100 || 0;
  const orderCount = detail?.orderCount || 0;
  const paidAmount = detail?.paidAmount || 0;
  const paidAmountWY = paidAmount / 1000000;
  const paidAmountY = paidAmount / 100;
  const discountAmount = detail?.discountAmount || 0;
  const unpaidAmount = detail?.unpaidAmount || 0;
  const onlineRate = parseInt(detail?.onlineRate) || '0';
  const onlineNumber = detail?.onlineAmount / 100 || 0;
  const offlineNumber = detail?.paidAmountCash / 100 || 0;
  const paidAmountWx = detail?.paidAmountWx / 100 || 0;
  const paidAmountAli = detail?.paidAmountAli / 100 || 0;
  const paidAmountTl = detail?.paidAmountTl / 100 || 0;
  const paidAmountCash = detail?.paidAmountCash / 100 || 0;
  const totlalPay = paidAmountWx + paidAmountTl + paidAmountAli + paidAmountCash;
  const paidAmountWxRate: any = totlalPay ? ((paidAmountWx / totlalPay) * 100).toFixed(0) : 0;
  const paidAmountAliRate = totlalPay ? ((paidAmountAli / totlalPay) * 100).toFixed(0) : 0;
  const paidAmountTlRate = totlalPay ? ((paidAmountTl / totlalPay) * 100).toFixed(0) : 0;
  const paidAmountCashRate = paidAmountCash
    ? 100 - (Number(paidAmountWxRate) + Number(paidAmountAliRate) + Number(paidAmountTlRate))
    : 0;
  return (
    <>
      <PieChart
        style={{ height: '266px' }}
        source={[
          { value: paidAmountWx, name: '微信', rate: paidAmountWxRate + '%' },
          { value: paidAmountAli, name: '支付宝', rate: paidAmountAliRate + '%' },
          { value: paidAmountTl, name: '通联', rate: paidAmountTlRate + '%' },
          { value: paidAmountCash, name: '现金', rate: paidAmountCashRate + '%' },
        ]}
        center={['30%', '50%']}
        legend={{
          key: 'name',
          position: 'right',
          format: (name, row) => {
            return [name, row.rate, row.value + '元'];
          },
          // x: 'center',
          // y: 'bottom',
          // itemGap: 20,
          // itemWidth: 50,
          // width: 550,
        }}
        insideContent={{
          label: paidAmount > 1000000 ? '实收共计(万元)' : '实收共计(元)',
          value: paidAmount > 1000000 ? paidAmountWY : paidAmountY,
          compare:
            isRate === 1
              ? {
                  label: '较前期',
                  value: totalCompare + '%',
                  direction: totalCompare >= 0 ? 'top' : 'down',
                }
              : undefined,
        }}
      />
      <Row style={{ marginTop: '16px', borderTop: '1px dashed rgba(5, 5, 5, 0.06)' }}>
        <Col
          flex={'1 1 52%'}
          style={{ margin: '16px 24px', borderRight: '1px dashed rgba(5, 5, 5, 0.06)' }}
        >
          <Indicator
            label="应收总额"
            value={totalAmount}
            countProps={{
              decimals: 2,
            }}
            unit="元"
            size="large"
            labelStyle={{ fontWeight: 'bold' }}
          />
          {isRate === 1 && (
            <CompareIndicator
              label="较前期"
              value={totalCompare + '%'}
              direction={totalCompare >= 0 ? 'top' : 'down'}
              style={{ padding: '10px 0 20px 0' }}
            />
          )}
          {isRate === 0 && <div style={{ minHeight: '52px' }} />}
          <Indicator
            label="订单总数"
            value={orderCount}
            unit=""
            valueStyle={{ fontWeight: 'bold' }}
            inline={true}
          />
          <Indicator
            label="优惠金额总数"
            value={discountAmount}
            countProps={{
              decimals: 2,
            }}
            unit="元"
            valueStyle={{ fontWeight: 'bold' }}
            inline={true}
          />
          <Indicator
            label={type === 'lt' ? '欠费金额总数' : '待支付总金额'}
            value={unpaidAmount}
            countProps={{
              decimals: 2,
            }}
            unit="元"
            inline={true}
            valueStyle={{ fontWeight: 'bold' }}
          />
        </Col>
        <Col flex={1} style={{ padding: '16px 24px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
            线上支付率
          </div>
          <PieChart
            source={[
              { value: onlineNumber, name: '线上支付' },
              { value: offlineNumber, name: '线下支付' },
            ]}
            center={['50%', '50%']}
            legend={{
              show: false,
            }}
            insideContent={{
              label: '',
              value: onlineRate + '%',
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
            style={{
              height: '155px',
              display: 'flex',
              justifyContent: 'center',
            }}
            colors={['#0D74FFFF', '#E5E8EFFF']}
          />
        </Col>
      </Row>
    </>
  );
};

export default App;
