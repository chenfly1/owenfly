import { alitaParkingLicense } from '@/components/FileUpload/business';
import OssImage from '@/components/OssImage';
import { getBillChkErr } from '@/services/park';
import {
  DrawerForm,
  ProFormDatePicker,
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

type Props = {
  onClose?: () => void;
};

export default forwardRef(({ onClose = () => {} }: Props, ref) => {
  const formRef = useRef<ProFormInstance>();
  const [detailShow, setDetailShow] = useState<boolean>(false);

  const getDetail = async (id: number) => {
    const data = (await getBillChkErr({ id })).data;
    formRef.current?.setFieldsValue({ ...data, payAmount: data.payAmount / 100 || '-' });
  };

  const open = (id: number) => {
    setDetailShow(true);

    setTimeout(() => {
      getDetail(id);
    });
  };

  const close = () => {
    formRef.current?.resetFields();

    setDetailShow(false);
    onClose();
  };

  useImperativeHandle(ref, () => {
    return {
      open,
      close,
    };
  });

  return (
    <DrawerForm
      title="详情"
      labelCol={{ flex: '110px' }}
      onOpenChange={(visible: boolean) => {
        if (!visible) {
          close();
        }
      }}
      formRef={formRef}
      layout="horizontal"
      width={550}
      labelAlign="left"
      open={detailShow}
      readonly
      submitter={false}
    >
      <h3 style={{ fontWeight: 'bold' }}>交易信息</h3>
      <ProFormText name="orderId" label="车场订单编号" />
      <ProFormText name="payAmount" label="车场支付金额" />
      <ProFormText name="thirdOrderId" label="三方交易订单号" />
      <ProFormText name="paySuccessTime" label="交易完成时间" />
      <h3 style={{ fontWeight: 'bold' }}>对账信息</h3>
      <ProFormSelect
        name="checkType"
        label="收费科目"
        valueEnum={{
          0: {
            text: '临停费',
          },
          1: {
            text: '月租费',
          },
        }}
      />
      <ProFormDatePicker name="chkDate" label="对账日期" />
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
      />
      <h3 style={{ fontWeight: 'bold' }}>处理信息</h3>
      <ProFormText name="remark" label="核销原因" />
      <ProFormItem shouldUpdate>
        {(form) => {
          const voucherUrl = form?.getFieldValue('voucherUrl') || '';
          return (
            <ProFormItem label="核销凭证" labelCol={{ flex: '110px' }} name="voucherUrl">
              <OssImage
                business={alitaParkingLicense.id}
                objectId={voucherUrl}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
      <ProFormText name="updater" label="核销人" />
      <ProFormText name="gmtUpdated" label="核销时间" />
    </DrawerForm>
  );
});
