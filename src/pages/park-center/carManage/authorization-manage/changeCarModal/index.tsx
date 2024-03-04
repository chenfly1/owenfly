import { platformVehicleQueryByPage, vehicleAuthPlate } from '@/services/park';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
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
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  useEffect(() => {
    formRef?.current?.resetFields();
    if (open) {
      formRef?.current?.setFieldsValue({
        plate: data?.plate.join(' ; '),
      });
      setTitle('更换车牌');
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const params = {
      ...formData,
      id: data?.id,
    };
    const res = await vehicleAuthPlate(params);
    if (res.code === 'SUCCESS') {
      message.success('变更成功');
      onSubmit();
    }
    if (res.code === 'SUCCESS') {
      return true;
    } else {
      return false;
    }
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
        <ProFormText name="plate" label="原有车牌号码" readonly />
        <ProFormSelect
          // width={300}
          mode="multiple"
          name="carIds"
          label="更换车牌号码"
          request={async () => {
            const params = {
              pageNo: 1,
              pageSize: 1000,
              projectId: project.bid,
            };
            const res = await platformVehicleQueryByPage(params);
            return res.data.items.map((item) => {
              return {
                label: item.plate,
                value: item.vehicleId,
              };
            });
          }}
        />
      </ModalForm>
    </>
  );
};

export default Add;
