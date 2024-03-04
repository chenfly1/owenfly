import { couponQeryByPage, couponSaleCreate, merchantQueryByPage } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const [couponList, setCouponList] = useState<Record<string, any>[]>([]);
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const id = data?.relId;

  const queryCouponList = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1000,
      status: '00',
    };
    const res = await couponQeryByPage(params);
    setCouponList(res.data?.elements || []);
    return (res.data?.elements || []).map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  };

  const queryMerchantList = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1000,
      status: 1,
    };
    const res = await merchantQueryByPage(params);
    return (res.data?.items || []).map((item: any) => {
      return {
        label: item.merchantName,
        value: item.id,
      };
    });
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('出售优惠券');
      formRef?.current?.setFieldsValue({
        type: '02',
      });
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const { stockTotal, total } = formData;
    if (total > stockTotal) {
      message.warning('出售数量不能大于库存数量');
      return;
    }
    const params = {
      ...formData,
    };
    // 新增
    const res = await couponSaleCreate(params);
    if (res.code === 'SUCCESS') {
      message.success('创建成功');
      onSubmit();
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <DrawerForm
        colon={false}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        submitter={readonly ? false : undefined}
        onFinish={onFinish}
      >
        <ProFormSelect
          label="券类型"
          colon={readonly || !!id}
          name="type"
          width={300}
          readonly={readonly}
          placeholder="请选择券类型"
          rules={[{ required: true }]}
          options={[
            { label: '金额折扣', value: '02' },
            // {label: '时间折扣', value: '01'},
          ]}
        />
        <ProFormSelect
          label="优惠券名称"
          name="couponId"
          width={300}
          readonly={readonly}
          placeholder="请输入优惠券名称"
          request={queryCouponList}
          fieldProps={{
            onChange: (val) => {
              const cou: any = couponList.find((item) => item.id === val);
              if (cou) {
                formRef.current.setFieldValue('stockTotal', cou.total);
              } else {
                formRef.current.setFieldValue('stockTotal', '');
              }
            },
          }}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          label="库存数量"
          disabled
          name="stockTotal"
          width={300}
          readonly={readonly}
          fieldProps={{
            controls: false,
          }}
          placeholder="请输入库存数量"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          label="商家名称"
          colon={readonly || !!id}
          name="merchantId"
          width={300}
          readonly={readonly}
          placeholder="请选择商家名称"
          rules={[{ required: true }]}
          request={queryMerchantList}
        />
        <ProFormDigit
          label="出售数量"
          name="total"
          width={300}
          readonly={readonly}
          fieldProps={{
            controls: false,
          }}
          placeholder="请输入出售数量"
          rules={[{ required: true }]}
        />
      </DrawerForm>
    </>
  );
};

export default Add;
