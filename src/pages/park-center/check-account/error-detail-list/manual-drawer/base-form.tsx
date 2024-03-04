import { ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import styles from './index.less';

type Props = {
  data?: any;
};

export default ({ data = {} }: Props) => {
  return (
    <>
      <ProFormSelect
        name="errType"
        label="异常类型"
        valueEnum={{
          1: {
            text: '金额不齐',
          },
          2: {
            text: '业务单边',
          },
          3: {
            text: '三方单边',
          },
        }}
        readonly
      />
      <ProFormSelect
        name="chkResult"
        label="对账结果"
        valueEnum={{
          1: {
            text: '差错账',
          },
          2: {
            text: '跨日账',
          },
        }}
        readonly
      />
      <div style={{ marginBottom: '24px', backgroundColor: '#D8D8D8', height: '1px' }} />
      <ProFormText name="orderId" label="车场订单编号" readonly />
      <div className={data.isAmountErr ? styles.inputTextRed : ''}>
        <ProFormText name="payAmount" label="车场支付金额" readonly addonAfter="元" />
      </div>
      <ProFormText name="thirdOrderId" label="三方交易订单号" readonly />
      <ProFormText name="paySuccessTime" label="交易完成时间" readonly />
      <ProFormText name="thirdTotalAmount" label="三方交易金额" readonly addonAfter="元" />
    </>
  );
};
