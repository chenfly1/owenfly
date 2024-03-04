import { ProForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import { useEffect, useRef } from 'react';
import { history } from 'umi';
import style from './style.less';
import {
  billListDetailTrade,
  billListElectric,
  billListManage,
  billListWater,
} from '@/services/payment';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const query = history.location.query as any;

  const queryDetail = async () => {
    const res = await billListDetailTrade({ code: query?.code });
    const item = (res?.data || [])[0];
    formRef?.current?.setFieldsValue({
      ...item,
      accountName: item.accountName || item.personal,
    });
  };
  const queryList = async () => {
    let queryFn: any;
    if (query.type === '0') {
      queryFn = billListWater;
    } else if (query.type === '1') {
      queryFn = billListElectric;
    } else if (query.type === '2') {
      queryFn = billListManage;
    }
    const params = {
      pageNo: 1,
      pageSize: 1,
      code: query.code,
    };

    const res = await queryFn(params);

    const item: any = res.data?.items[0];
    const itemTem = {
      ...item,
      price: item.price ? Number(item.price / 100).toFixed(2) : '',
      waterFee: item.waterFee ? Number(item.waterFee / 100).toFixed(2) : '',
      indoorFee: item.indoorFee ? Number(item.indoorFee / 100).toFixed(2) : '',
      publicFee: item.publicFee ? Number(item.publicFee / 100).toFixed(2) : '',
      waterAmount: item.waterAmount ? Number(item.waterAmount / 100).toFixed(2) : '',
      indoorAmount: item.indoorAmount ? Number(item.indoorAmount / 100).toFixed(2) : '',
      publicAmount: item.publicAmount ? Number(item.publicAmount / 100).toFixed(2) : '',

      electricFee: item.electricFee ? Number(item.electricFee / 100).toFixed(2) : '',
      electricAmount: item.electricAmount ? Number(item.electricAmount / 100).toFixed(2) : '',

      manageFee: item.manageFee ? Number(item.manageFee / 100).toFixed(2) : '',
      manageAmount: item.manageAmount ? Number(item.manageAmount / 100).toFixed(2) : '',

      totalAmountTax: item.totalAmountTax ? Number(item.totalAmountTax / 100).toFixed(2) : '',
      totalAmount: item.totalAmount ? Number(item.totalAmount / 100).toFixed(2) : '',
      taxAmount: item.taxAmount ? Number(item.taxAmount / 100).toFixed(2) : '',
      paidAmount: item.paidAmount ? Number(item.paidAmount / 100).toFixed(2) : '',
      refundAmount: item.refundAmount ? Number(item.refundAmount / 100).toFixed(2) : '',
      paidOffAmount: item.paidOffAmount ? Number(item.paidOffAmount / 100).toFixed(2) : '',
      paidOnlineAmount: item.paidOnlineAmount ? Number(item.paidOnlineAmount / 100).toFixed(2) : '',
    };
    formRef?.current?.setFieldsValue(itemTem);
  };

  useEffect(() => {
    queryDetail();
    queryList();
  }, []);

  return (
    <PageContainer header={{ title: '账单详情', onBack: () => history.goBack() }}>
      <div style={{ padding: '24px' }} className={style.cusCard}>
        <ProForm
          colon={false}
          labelCol={{ flex: '130px' }}
          layout="horizontal"
          formRef={formRef}
          submitter={false}
        >
          <h3 style={{ fontWeight: 'bold', marginTop: '0' }}>
            <div className={style.titleBlock} />
            <div>账单信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText readonly name="gmtCreated" label="账单创建时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="code" label="账单编号" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="property" label="房产" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="statusName" label="下发状态" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="billStartTime" label="账单实际产生时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="billMonth" label="账单所属月份" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="totalAmountTax" label="应收金额(含税)" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="totalAmount" label="应收金额(不含税)" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="taxAmount" label="税金" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="taxRate" label="税率" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="typeName" label="服务类目" />
            </Col>
            {query.type === '0' && (
              <>
                <Col span={8}>
                  <ProFormText readonly name="waterAmount" label="合计用量" addonAfter="吨" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="price" label="单价" addonAfter="元/吨" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="waterFee" label="合计费用" addonAfter="元" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="indoorAmount" label="室内用量" addonAfter="吨" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="indoorFee" label="室内费用" addonAfter="元" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="publicAmount" label="公区用量" addonAfter="吨" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="publicFee" label="公区费用" addonAfter="元" />
                </Col>
              </>
            )}
            {query.type === '1' && (
              <>
                <Col span={8}>
                  <ProFormText readonly name="electricAmount" label="合计用量" addonAfter="度" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="price" label="单价" addonAfter="元/度" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="electricFee" label="合计费用" addonAfter="元" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="indoorAmount" label="室内用量" addonAfter="度" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="indoorFee" label="室内费用" addonAfter="元" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="publicAmount" label="公区用量" addonAfter="度" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="publicFee" label="公区费用" addonAfter="元" />
                </Col>
              </>
            )}
            {query.type === '2' && (
              <>
                <Col span={8}>
                  <ProFormText readonly name="manageAmount" label="合计用量" addonAfter="m²" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="price" label="单价" addonAfter="元/m²" />
                </Col>
                <Col span={8}>
                  <ProFormText readonly name="manageFee" label="合计费用" addonAfter="元" />
                </Col>
              </>
            )}
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>支付信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText readonly name="billStatusName" label="支付状态" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="paidAmount" label="实收金额" addonAfter="元" />
            </Col>
            {/* {dddddddddddd} */}
            <Col span={8}>
              <ProFormText readonly name="paidOffAmount" label="线下付款" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="paidOffTime" label="线下支付时间" />
            </Col>
            <Col span={8}>
              <ProFormSelect
                readonly
                name="payType"
                label="付款方式"
                options={[
                  {
                    label: '微信',
                    value: '1',
                  },
                  {
                    label: '支付宝',
                    value: '2',
                  },
                  {
                    label: '刷卡',
                    value: '3',
                  },
                  {
                    label: '现金',
                    value: '4',
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="payee" label="收款人" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="accountName" label="入账方" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="handed" label="制单人" />
            </Col>
            {/* {dddddddddddd} */}
            <Col span={8}>
              <ProFormText readonly name="realPayUser" label="缴费用户" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="paidOnlineAmount" label="线上付款" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="payTime" label="线上支付时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="tradeId" label="线上支付交易流水号" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="refundAmount" label="退款金额" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="refundStatusName" label="退款结果" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="refundTime" label="退款时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="refundOper" label="退款操作人" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="refundSerialNumber" label="退款交易流水号" />
            </Col>
          </Row>
        </ProForm>
      </div>
    </PageContainer>
  );
};
