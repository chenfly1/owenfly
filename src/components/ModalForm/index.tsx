import { ProForm, ProFormInstance } from '@ant-design/pro-components';
import { ColProps, Form, Modal, ModalProps } from 'antd';
import { useState, forwardRef, useImperativeHandle, ReactNode } from 'react';

export type ModalFormRef<T extends object> = { open: (values?: T) => void; close: () => void };

export default <T extends object>(
  children: (props: { source?: T; form: ProFormInstance; visible: boolean }) => ReactNode,
  {
    height,
    labelCol,
    ...modalProps
  }: {
    height?: number;
    labelCol?: ColProps;
  } & ModalProps = {},
) =>
  forwardRef<
    ModalFormRef<T>,
    {
      submit?: (value: T, source?: T) => Promise<boolean>;
      afterOpenChange?: (open: boolean) => void;
    }
  >(({ submit, afterOpenChange }, ref) => {
    const [visible, setVisible] = useState(false);
    const [source, setSource] = useState<T>();
    const [form] = Form.useForm();

    const open = (values?: T) => {
      setSource(values);
      form.setFieldsValue(values);
      setVisible(true);
      afterOpenChange?.(true);
    };

    const close = () => {
      setVisible(false);
      form.resetFields();
      afterOpenChange?.(false);
    };

    const submitHandler = () => {
      form.validateFields().then(() => {
        const values = form.getFieldsValue();
        if (submit) {
          submit(values, source).then((res) => {
            if (res) close();
          });
        }
      });
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    return (
      <Modal
        width={800}
        open={visible}
        onOk={submitHandler}
        okText="确定"
        onCancel={close}
        bodyStyle={{
          height: height || 'auto',
          maxHeight: 400,
          overflow: 'auto',
        }}
        {...modalProps}
      >
        <ProForm<T>
          layout="horizontal"
          form={form}
          grid={true}
          colon={false}
          submitter={false}
          labelCol={labelCol ?? { flex: '110px' }}
        >
          {children({ source, form, visible })}
        </ProForm>
      </Modal>
    );
  });
