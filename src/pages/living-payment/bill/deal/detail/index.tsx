import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormList,
  ProFormText,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import { useEffect, useRef } from 'react';
import { history } from 'umi';
import style from './style.less';
import { tradeDetail } from '@/services/payment';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const { id } = history.location.query as any;

  const queryDetail = async () => {
    const res = await tradeDetail({ id });
    let tradeAmountTem: string;
    const tradeAmount = res.data.tradeAmount ? Number(res.data.tradeAmount / 100).toFixed(2) : '0';
    if (res.data.tradeAmountType === 0) {
      tradeAmountTem = '+' + tradeAmount;
    } else {
      tradeAmountTem = '-' + tradeAmount;
    }
    formRef?.current?.setFieldsValue({
      ...res.data,
      accountNumber: res.data?.account?.accountNumber,
      accountName: res.data?.account?.accountName || res?.data?.personal,
      tradeAmount: tradeAmountTem,
      billList: (res.data.billList || []).map((item) => ({
        ...item,
        totalAmountTax: item?.totalAmountTax ? Number(item?.totalAmountTax / 100).toFixed(2) : 0,
      })),
    });
  };

  useEffect(() => {
    queryDetail();
  }, []);

  return (
    <PageContainer header={{ title: '订单详情', onBack: () => history.goBack() }}>
      <div style={{ padding: '24px' }} className={style.cusCard}>
        <ProForm
          colon={false}
          labelCol={{ flex: '100px' }}
          layout="horizontal"
          formRef={formRef}
          submitter={false}
        >
          <h3 style={{ fontWeight: 'bold', marginTop: '0' }}>
            <div className={style.titleBlock} />
            <div>用户信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText readonly name="username" label="用户姓名" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="phone" label="联系方式" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="propertyName" label="用户房产" />
            </Col>
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>收款商户信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText readonly name="accountName" label="商户名称" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="accountNumber" label="商户号" />
            </Col>
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>交易信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText readonly name="tradeDoneDate" label="交易时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="tradeId" label="交易流水号" />
            </Col>
            <Col span={8}>
              <ProFormDependency name={['tradeAmountType']}>
                {({ tradeAmountType }) => {
                  if (tradeAmountType === 0) {
                    return (
                      <ProFormText readonly name="tradeAmount" label="交易金额" addonAfter="元" />
                    );
                  } else {
                    return (
                      <ProFormText readonly name="tradeAmount" label="退款金额" addonAfter="元" />
                    );
                  }
                }}
              </ProFormDependency>
            </Col>
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>账单信息</div>
          </h3>
          {/*
          {billList.map((item: any) => (

          ))} */}
          <ProFormList
            name="billList"
            // actionRef={actionRefList}
            creatorButtonProps={false}
            deleteIconProps={false}
            itemRender={({ listDom, action }, { index }) => <div>{listDom}</div>}
            min={1}
            copyIconProps={false}
          >
            {(f, index, action) => {
              return (
                <Row style={{ paddingTop: '20px' }}>
                  <Col span={8}>
                    <ProFormText
                      readonly
                      name="gmtCreated"
                      label="账单创建时间"
                      labelCol={{ flex: '100px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormText
                      readonly
                      name="code"
                      label="账单编号"
                      labelCol={{ flex: '100px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormText
                      readonly
                      name="totalAmountTax"
                      label="应收金额(含税)"
                      addonAfter="元"
                      labelCol={{ flex: '100px' }}
                    />
                  </Col>
                </Row>
              );
            }}
          </ProFormList>
        </ProForm>
      </div>
    </PageContainer>
  );
};
