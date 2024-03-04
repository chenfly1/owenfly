import {
  DrawerForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { resourceApps } from '@/services/auth';
import { createUpdateDeviceType } from '@/services/device';

type IProps = {
  modalVisit: boolean;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>();
  const [systemList, setSystemList] = useState<{ label: string; value: string }[]>();
  const [inlay, setInlay] = useState<boolean>(false);

  useEffect(() => {
    if (modalVisit) {
      setTitle('自定义设备类型');
      formRef?.current?.resetFields();
      resourceApps().then((res) => {
        setSystemList(
          res.data.map((i: any) => ({
            value: i.id + '',
            label: i.name,
          })),
        );
      });
      setInlay(false);
      if (data?.id) {
        setTitle('编辑设备类型');
        setInlay(data?.inlay);
        formRef?.current?.setFieldsValue({
          ...data,
          systemIds: data.systemId ? data.systemId.split(',') : [],
        });
      }
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    const systemName = systemList
      ?.filter((i: any) => values.systemIds.includes(i.value))
      .map((i: any) => i.label);
    values.systemId = values.systemIds?.length ? values.systemIds.join(',') : null;
    values.systemName = systemName?.join(',');
    const res = await createUpdateDeviceType(data?.id ? { ...data, ...values } : values);
    if (res.code === 'SUCCESS') {
      onSubmit();
      onOpenChange(false);
      formRef?.current?.resetFields();
      message.success('操作成功');
    }
  };
  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      labelCol={{
        flex: '80px',
      }}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={560}
      open={modalVisit}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="类型名称"
        readonly={inlay ? true : false}
        colon={inlay ? true : false}
        rules={[
          {
            required: true,
            message: '请输入类型名称',
          },
        ]}
        fieldProps={{
          maxLength: 50,
        }}
        placeholder="请输入类型名称"
      />
      <ProFormText
        name="alias"
        label="备注名"
        fieldProps={{
          maxLength: 50,
        }}
        placeholder="请输入备注名"
      />
      <ProFormCheckbox.Group
        name="systemIds"
        label="授权应用"
        readonly={inlay ? true : false}
        colon={inlay ? true : false}
        rules={[{ required: true, message: '请选择' }]}
        options={systemList}
      />
    </DrawerForm>
  );
};

export default AddModelForm;
