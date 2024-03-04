import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormMoney } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency, ProFormSelect } from '@ant-design/pro-components';
import { ProFormDateRangePicker } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { message, Radio, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import QRCode from 'qrcode.react';
import { orderState, serviceDetail, vehicleAuthDetail, vehicleAutRenew } from '@/services/park';
import styles from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};
let times: any = null;
const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const packageRes = useRef<Record<string, any>>();
  const vehDetail = useRef<Record<string, any>>();
  const [reqUrl, setReqUrl] = useState<string>('');

  const onFinish = async (formData: any) => {
    const params = {
      id: data?.id,
      startDate: formData?.dateRange[0] + ' 00:00:00',
      endDate: formData?.dateRange[1] + ' 23:59:59',
      payCount: formData.feeYuan * 100,
      payType: formData.payTypeId,
      payChannelId: formData.payChannle,
      packageCount: formData.packageCount,
    };
    const res = await vehicleAutRenew(params as any);
    if (res.code === 'SUCCESS') {
      message.success('提交成功，请扫码支付');
      setReqUrl(res.data?.reqUrl);
      times = setInterval(async () => {
        const detailRes = await orderState(res.data?.orderId as string);
        if (detailRes.data === '02') {
          message.success('支付成功');
          clearInterval(times);
          return true;
        }
      }, 1000);
    }
  };

  // 套餐数量变化
  const onPackageCountChange = (val: any, packageData?: any) => {
    const packageDatas: any = packageData ? packageData : packageRes.current;
    const vehDetailData: any = vehDetail.current;
    if (val) {
      const startDate = dayjs(vehDetailData.endDate).add(1, 'second');
      formRef?.current?.setFieldsValue({
        packageCount: val,
        dateRange: [startDate, dayjs(startDate).add(val * packageDatas.cycle, 'month')],
        feeYuan: (val * packageDatas?.price) / 100,
        orgDateRange: [vehDetailData.startDate, vehDetailData.endDate],
      });
    }
  };

  // 车辆套餐变化
  const onPackageChange = async (val: any) => {
    const res = await serviceDetail(val);
    const resData = res.data;
    packageRes.current = resData;
    formRef?.current?.setFieldsValue({
      packageCycle: resData.cycle,
      selectingPassages: resData?.passageIds,
      packageName: resData?.name,
      packagePrice: resData?.price / 100,
    });
    onPackageCountChange(1, resData);
  };
  // 获取详情
  const getDetailData = async (id: string) => {
    const res = await vehicleAuthDetail(id as string);
    vehDetail.current = res.data;
    const packeRes = await serviceDetail(res.data?.packageId as string);
    const resData = res.data || {};
    formRef?.current?.setFieldsValue({
      ...resData,
    });
    onPackageChange(packeRes.data.id as string);
  };

  useEffect(() => {
    clearInterval(times);
    if (open) {
      setTitle('续费');
      formRef?.current?.resetFields();
      getDetailData(data?.id);
    }
  }, [open]);

  const qrCodeNode = useMemo(() => {
    return (
      reqUrl && (
        <QRCode
          id="qrCode"
          value={reqUrl}
          size={200} // 二维码的大小
          fgColor="#000000" // 二维码的颜色
          style={{ marginLeft: '120px' }}
          imageSettings={{
            // 二维码中间的logo图片
            src: 'logoUrl',
            height: 100,
            width: 100,
            excavate: true, // 中间图片所在的位置是否镂空
          }}
        />
      )
    );
  }, [reqUrl]);

  return (
    <>
      <DrawerForm
        className={styles.renewModal}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={600}
        title={title}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
      >
        <ProFormText labelCol={{ flex: '120px' }} readonly label="套餐名称" name="packageName" />
        <ProFormMoney labelCol={{ flex: '120px' }} readonly label="套餐单价" name="packagePrice" />
        <ProFormDigit
          labelCol={{ flex: '120px' }}
          rules={[{ required: true, message: '套餐数量' }]}
          label="套餐数量"
          name="packageCount"
          colon={false}
          width={300}
          min={1}
          max={360}
          fieldProps={{
            onChange: onPackageCountChange,
          }}
        />
        <ProFormText
          labelCol={{ flex: '120px' }}
          disabled
          label="套餐周期"
          name="packageCycle"
          readonly
          fieldProps={{
            suffix: '个月',
          }}
        />
        <ProFormDateRangePicker
          colProps={{}}
          labelCol={{ flex: '120px' }}
          readonly
          label="有效期"
          name="dateRange"
          width={'lg'}
        />
        <ProFormDateRangePicker
          colProps={{}}
          labelCol={{ flex: '120px' }}
          label="续费有效期"
          name="orgDateRange"
          width={'lg'}
          readonly
        />

        <ProFormMoney
          labelCol={{ flex: '120px' }}
          readonly
          colon
          name="feeYuan"
          label="待支付金额"
        />
        <ProForm.Item
          labelCol={{ flex: '120px' }}
          rules={[{ required: true }]}
          label="支付方式"
          name="payTypeId"
        >
          <Radio.Group defaultValue="" buttonStyle="solid">
            <div className={styles.payRadio}>
              <Radio value="1">现金支付</Radio>
              <Radio value="2">扫码支付</Radio>
            </div>
            <Space />
          </Radio.Group>
        </ProForm.Item>
        <ProFormDependency name={['payTypeId']}>
          {({ payTypeId }) => {
            return (
              payTypeId === '2' && (
                <ProFormSelect
                  allowClear={false}
                  width={200}
                  rules={[{ required: true }]}
                  initialValue={'2'}
                  name="payChannle"
                  label="支付渠道"
                  readonly={readonly}
                  options={[{ label: '微信', value: '2' }]}
                />
              )
            );
          }}
        </ProFormDependency>
        {qrCodeNode}
      </DrawerForm>
    </>
  );
};

export default Add;
