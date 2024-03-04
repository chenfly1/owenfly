import { ProForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import { useEffect, useRef } from 'react';
import { history } from 'umi';
import style from './style.less';
import { refundRecordDetail } from '@/services/park';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const query = history.location.query as any;
  useEffect(() => {
    if (query.id) {
      refundRecordDetail(query).then((res) => {
        const record = query.refundType === '1' ? res.data.ltRecord || {} : res.data.yzRecord || {};
        formRef?.current?.setFieldsValue({
          ...res.data,
          ...record,
          kemu: query.refundType === '1' ? '临停费-退费' : '月租费-退费',
          kemu2: query.refundType === '1' ? '临停费' : '月租费',
          totalAmount: record?.totalAmount ? Number(record?.totalAmount / 100).toFixed(2) : '0',
          paidAmount: record?.paidAmount ? Number(record?.paidAmount / 100).toFixed(2) : '0',
          discountAmount: record?.discountAmount
            ? Number(record?.discountAmount / 100).toFixed(2)
            : '0',
          refundAmount: res.data?.refundAmount
            ? Number(res.data?.refundAmount / 100).toFixed(2)
            : '0',
          packagePrice: record?.packagePrice ? Number(record?.packagePrice / 100).toFixed(2) : '0',
        });
      });
    }
  }, []);
  return (
    <PageContainer header={{ title: '订单详情', onBack: () => history.goBack() }}>
      <div style={{ padding: '10px 24px' }} className={style.cusCard}>
        <ProForm
          colon={false}
          labelCol={{ flex: '100px' }}
          layout="horizontal"
          formRef={formRef}
          submitter={false}
        >
          <Row style={{ fontWeight: 'bold' }}>
            <Col span="8">
              <ProFormText readonly name="plate" label="车牌号" />
            </Col>
          </Row>
          {query.refundType === '1' && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>
                <div className={style.titleBlock} />
                <div>停车信息</div>
              </h3>
              <Row>
                <Col span={6}>
                  <ProFormText readonly name="inTime" label="入场时间" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="inPackageName" label="入场套餐" />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    readonly
                    name="inType"
                    label="入场方式"
                    options={[
                      {
                        label: '主动开闸',
                        value: '1',
                      },
                      {
                        label: '自动开闸',
                        value: '2',
                      },
                    ]}
                  />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="inChannel" label="入场通道" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="outTime" label="出场时间" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="outPackageName" label="出场套餐" />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    readonly
                    name="outType"
                    label="出场方式"
                    options={[
                      {
                        label: '主动开闸',
                        value: '1',
                      },
                      {
                        label: '自动开闸',
                        value: '2',
                      },
                    ]}
                  />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="outChannel" label="出场通道" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="parkDuration" label="停车时长" addonAfter="分钟" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="ownerName" label="车主姓名" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="phone" label="手机号" />
                </Col>
              </Row>
            </>
          )}
          {query.refundType === '2' && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>
                <div className={style.titleBlock} />
                <div>套餐信息</div>
              </h3>
              <Row>
                <Col span={6}>
                  <ProFormText readonly name="plate" label="车牌号" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="packageName" label="套餐名称" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="packagePrice" label="套餐单价" addonAfter="元" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="packageTotal" label="数量" />
                </Col>
                {/* <Col span={6}>
                  <ProFormText readonly name="totalAmount" label="应收金额" addonAfter="元" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="paidAmount" label="实收金额" addonAfter="元" />
                </Col>
                <Col span={6}>
                  <ProFormText readonly name="discountAmount" label="优惠金额" addonAfter="元" />
                </Col> */}
              </Row>
            </>
          )}
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>退款信息</div>
          </h3>
          <Row>
            <Col span={24}>
              <ProFormSelect
                options={[
                  {
                    label: '退款中',
                    value: '1',
                  },
                  {
                    label: '已退款',
                    value: '2',
                  },
                  {
                    label: '退款失败',
                    value: '3',
                  },
                ]}
                readonly
                name="refundStatus"
                label="退款状态"
              />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="orderId" label="订单编号" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="refundEndTime" label="退款成功时间" />
            </Col>
            <Col span={6}>
              <ProFormSelect
                readonly
                name="refundMethod"
                label="支付方式"
                options={[
                  {
                    label: '现金',
                    value: '00',
                  },
                  {
                    label: '微信',
                    value: '01',
                  },
                  {
                    label: '支付宝',
                    value: '02',
                  },
                  {
                    label: '钱包',
                    value: '13',
                  },
                ]}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                readonly
                name="refundMethod"
                label="支付渠道"
                options={[
                  {
                    label: '现金',
                    value: '00',
                  },
                  {
                    label: '微信',
                    value: '01',
                  },
                  {
                    label: '支付宝',
                    value: '02',
                  },
                  {
                    label: '钱包',
                    value: '13',
                  },
                ]}
              />
            </Col>
            <Col span={24}>
              <ProFormText readonly name="kemu" label="收费科目" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="refundAmount" label="退款金额" addonAfter="元" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="remark" label="退款原因" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="refundUser" label="退款人" />
            </Col>
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>交易信息</div>
          </h3>
          <Row>
            <Col span={6}>
              <ProFormText readonly name="orderId" label="订单编号" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="paySuccessTime" label="支付成功时间" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="payType" label="支付方式" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="payChannel" label="支付渠道" />
            </Col>
            <Col span={24}>
              <ProFormText readonly name="kemu2" label="收费科目" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="totalAmount" label="应收金额" addonAfter="元" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="paidAmount" label="实收金额" addonAfter="元" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="discountAmount" label="优惠金额" addonAfter="元" />
            </Col>
          </Row>
        </ProForm>
      </div>
    </PageContainer>
  );
};
