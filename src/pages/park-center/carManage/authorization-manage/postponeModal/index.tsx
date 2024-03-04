import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormDatePicker } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { vehicleAuthDate } from '@/services/park';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const PostponeModal: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    formRef?.current?.resetFields();
    if (open) {
      formRef?.current?.setFieldsValue({
        endDate: data?.endDate,
      });
      setTitle('车辆延期');
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const params = {
      id: data?.id,
      authId: data?.id,
      endDate: formData.endDate + ' 23:59:59',
    };
    // 延期
    const res = await vehicleAuthDate(params);
    if (res.code === 'SUCCESS') {
      message.success('延期成功');
      onSubmit();
      return true;
    } else {
      return false;
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs(data?.endDate).startOf('day');
  };

  return (
    <>
      <ModalForm
        modalProps={{
          centered: true,
        }}
        {...rest}
        labelCol={{ flex: '120px' }}
        width={'550px'}
        layout="horizontal"
        onOpenChange={onOpenChange}
        title={title}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
      >
        <ProFormDatePicker
          name="endDate"
          fieldProps={{
            disabledDate,
          }}
          width={300}
          label="授权期限日期"
          rules={[{ required: true, message: '请选择授权日期' }]}
        />
      </ModalForm>
    </>
  );
};

export default PostponeModal;
