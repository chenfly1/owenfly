import { invoiceDetail } from '@/services/payment';
import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Add: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange, data, ...rest }) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();

  const queryDetail = async () => {
    const res = await invoiceDetail({ id: data?.id });
    formRef?.current?.setFieldsValue({
      ...res.data,
    });
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('查看详情');
      queryDetail();
    }
  }, [open]);

  return (
    <>
      <DrawerForm
        colon={false}
        {...rest}
        labelCol={{ flex: '100px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        readonly={true}
        open={open}
        submitter={false}
      >
        <ProFormText label="抬头名称" name="title" width={300} />
        <ProFormText label="税号" name="taxNo" width={300} />
        <ProFormText label="单位地址" name="unitAddr" width={300} />
        <ProFormText label="电话号码" name="unitPhone" width={300} />
        <ProFormText label="开户银行" name="bankName" width={300} />
        <ProFormText label="银行账户" name="bankAccount" width={300} />
      </DrawerForm>
    </>
  );
};

export default Add;
