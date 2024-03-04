import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import style from './style.less';
import { transRecordsDetailLt, transRecordsDetailYz } from '@/services/park';
import OssImage from '@/components/OssImage';
import { alitaParkingLicense } from '@/components/FileUpload/business';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const [inPicUrl, setInPicUrl] = useState<string>('');
  const [outPicUrl, setOutPicUrl] = useState<string>('');
  const query = history.location.query as any;
  const passageModeEnum = {
    0: '未知',
    1: '自动放行',
    2: '确认放行',
    3: '异常放行',
    4: '遥控开闸',
    5: '自助开闸',
    6: '可疑跟车',
    7: '盘点进场',
    8: '离线自动放行',
    9: '离线遥控放行',
    98: '盘点离场',
    99: '虚拟放行',
    // 离场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
  };
  const carTypeEnum = {
    0: '未知',
    1: '蓝牌车',
    2: '黄牌车',
    3: '超大型车',
    4: '新能源小车',
    5: '新能源大车',
    20: '非机动车',
  };

  const queryDetail = async () => {
    const res =
      query.type === 'lt'
        ? await transRecordsDetailLt({ id: query.id })
        : await transRecordsDetailYz({ id: query.id });
    setInPicUrl(res.data?.inPicUrl || '');
    setOutPicUrl(res.data?.outPicUrl || '');
    let kemu: any;
    if (query.type === 'lt') {
      if (query?.status === '未退款') {
        kemu = '临停费';
      } else {
        kemu = '临停费-退费';
      }
    } else {
      if (query?.status === '未退款') {
        kemu = '月租费';
      } else {
        kemu = '月租费-退费';
      }
    }
    const tempData = {
      ...res.data,
      kemu,
      totalAmount: res.data?.totalAmount ? Number(res.data?.totalAmount / 100).toFixed(2) : '',
      paidAmount: res.data?.paidAmount ? Number(res.data?.paidAmount / 100).toFixed(2) : '',
      discountAmount: res.data?.discountAmount
        ? Number(res.data?.discountAmount / 100).toFixed(2)
        : 0,
      refundAmount: res.data?.refundAmount ? Number(res.data?.refundAmount / 100).toFixed(2) : '',
      packagePrice: res.data?.packagePrice ? Number(res.data?.packagePrice / 100).toFixed(2) : '',
    };
    formRef?.current?.setFieldsValue(tempData);
  };
  const ltNode1 = (
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
          <ProFormText readonly name="packageName" label="入场套餐" />
        </Col>
        <Col span={6}>
          <ProFormSelect
            readonly
            name="passageMode"
            label="入场方式"
            request={async () => {
              return Object.entries(passageModeEnum).map((item) => ({
                label: item[1],
                value: item[0],
              }));
            }}
          />
        </Col>
        <Col span={6}>
          <ProFormText readonly name="inChannel" label="入场通道" />
        </Col>
        <Col span={6}>
          <ProFormText readonly name="outTime" label="出场时间" />
        </Col>
        <Col span={6}>
          <ProFormSelect
            readonly
            name="carType"
            label="出场套餐"
            request={async () => {
              return Object.entries(carTypeEnum).map((item) => ({
                label: item[1],
                value: item[0],
              }));
            }}
          />
        </Col>
        <Col span={6}>
          <ProFormSelect
            readonly
            name="exitPassageMode"
            label="出场方式"
            request={async () => {
              return Object.entries(passageModeEnum).map((item) => ({
                label: item[1],
                value: item[0],
              }));
            }}
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
  );
  const yzNode1 = (
    <>
      <h3 style={{ fontWeight: 'bold' }}>
        <div className={style.titleBlock} />
        <div>月租信息</div>
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
          <ProFormText readonly name="packageTotal" label="数量" addonAfter="个" />
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
    </>
  );

  const ltNode2 = (
    <>
      <h3 style={{ fontWeight: 'bold' }}>
        <div className={style.titleBlock} />
        <div>交易信息</div>
      </h3>
      <Row>
        <Col span={6}>
          <ProFormText readonly name="orderId" label="订单编号" />
        </Col>
        {query?.status === '未退款' && (
          <Col span={6}>
            <ProFormText readonly name="paySuccessTime" label="支付成功时间" />
          </Col>
        )}
        {query?.status === '退款成功' && (
          <Col span={6}>
            <ProFormText readonly name="refundSuccessTime" label="退款成功时间" />
          </Col>
        )}
        <Col span={6}>
          <ProFormText readonly name="payTypeName" label="支付方式" />
        </Col>
        <Col span={6}>
          <ProFormText readonly name="payChannelName" label="支付渠道" />
        </Col>
        <Col span={24}>
          <ProFormText readonly name="kemu" label="收费科目" />
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
        {query?.status === '退款成功' && (
          <Col span={6}>
            <ProFormText readonly name="refundAmount" label="退款金额" addonAfter="元" />
          </Col>
        )}
      </Row>
    </>
  );

  const yzNode2 = (
    <>
      <h3 style={{ fontWeight: 'bold' }}>
        <div className={style.titleBlock} />
        {query?.status === '未退款' && <div>交易信息</div>}
        {query?.status === '退款成功' && <div>退款信息</div>}
      </h3>
      <Row>
        <Col span={6}>
          <ProFormText readonly name="orderId" label="订单编号" />
        </Col>
        {query?.status === '未退款' && (
          <Col span={6}>
            <ProFormText readonly name="paySuccessTime" label="支付成功时间" />
          </Col>
        )}
        {query?.status === '退款成功' && (
          <Col span={6}>
            <ProFormText readonly name="refundSuccessTime" label="退款成功时间" />
          </Col>
        )}
        <Col span={6}>
          <ProFormText readonly name="payTypeName" label="支付方式" />
        </Col>
        <Col span={6}>
          <ProFormText readonly name="payChannelName" label="支付渠道" />
        </Col>
        <Col span={24}>
          <ProFormText readonly name="kemu" label="收费科目" />
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
        {query?.status === '退款成功' && (
          <>
            <Col span={6}>
              <ProFormText readonly name="refundAmount" label="退款金额" addonAfter="元" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="remark" label="退款原因" />
            </Col>
            <Col span={6}>
              <ProFormText readonly name="refundUser" label="退款人" />
            </Col>
          </>
        )}
      </Row>
    </>
  );

  const Node1 = () => {
    if (query.type === 'lt') {
      return ltNode1;
    } else {
      return yzNode1;
    }
  };

  const Node2 = () => {
    if (query.type === 'lt') {
      return ltNode2;
    } else {
      return yzNode2;
    }
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
          {query.type === 'lt' && (
            <Row style={{ fontWeight: 'bold' }}>
              <Col span="8">
                <ProFormText readonly name="plate" label="车牌号" />
              </Col>
            </Row>
          )}
          <Node1 />
          <Node2 />
          {query.type === 'lt' && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>
                <div className={style.titleBlock} />
                <div>抓拍图片</div>
              </h3>
              <Row style={{ paddingTop: '20px' }}>
                <Col span="12" className={style['c-col']}>
                  <OssImage
                    style={{ width: '200px' }}
                    objectId={inPicUrl}
                    business={alitaParkingLicense.id}
                  />
                  {/* <Image
                width={200}
                // preview={false}
                src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
              /> */}
                  <div className={style['c-col-name']}>入场图片</div>
                </Col>
                <Col span="12" className={style['c-col']}>
                  <OssImage
                    style={{ width: '200px' }}
                    objectId={outPicUrl}
                    business={alitaParkingLicense.id}
                  />
                  {/* <Image
                width={200}
                // preview={false}
                src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
              /> */}
                  <div className={style['c-col-name']}>出场图片</div>
                </Col>
              </Row>
            </>
          )}
        </ProForm>
      </div>
    </PageContainer>
  );
};
