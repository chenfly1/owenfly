import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { Button } from 'antd';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const DetailsModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data } = props;
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    formRef?.current?.resetFields();
    if (modalVisit && data?.id) {
      formRef?.current?.setFieldsValue({
        ...data,
      });
    }
  }, [modalVisit]);

  return (
    <DrawerForm
      labelCol={{ flex: '80px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      title="查看设备信息"
      labelAlign="left"
      open={modalVisit}
      readonly
      submitter={{
        render: () => {
          return [
            <Button
              key="cancel"
              disabled={false}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              返回
            </Button>,
          ];
        },
      }}
      drawerProps={{
        destroyOnClose: true,
        bodyStyle: { paddingRight: '50px' },
      }}
    >
      <ProFormText name="id" label="设备ID" />
      <ProFormText name="sn" label="SN" />
      <ProFormText name="mac" label="MAC" />
      <ProFormText name="manufacturer" label="厂商" />
      <ProFormText name="model" label="型号" />
      <ProFormText name="typeName" label="设备类型" />
      <ProFormText name="spaceName" label="安装位置" />
    </DrawerForm>
  );
};

export default DetailsModelForm;
