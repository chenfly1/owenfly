import { ProForm, ProFormInstance } from '@ant-design/pro-components';
import { ColProps, Form, Drawer, Space, Button } from 'antd';
import { useState, forwardRef, useImperativeHandle, ReactNode } from 'react';
import Style from './index.less';
import { FormLabelAlign } from 'antd/lib/form/interface';

export type DrawerFormRef<T> = { open: (values?: T) => void; close: () => void };

export default <T extends object>(
  children: (props: { source?: T; form: ProFormInstance; visible: boolean }) => ReactNode,
  props: {
    width?: number;
    title?: string;
    confirm?: boolean;
    labelCol?: ColProps;
    labelAlign?: FormLabelAlign;
    destroyOnClose?: boolean;
  } = {},
) =>
  forwardRef<DrawerFormRef<T>, { submit?: (value: T) => Promise<boolean> }>(({ submit }, ref) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [source, setSource] = useState<T>();
    const [form] = Form.useForm();

    const open = (values?: T) => {
      form.setFieldsValue(values);
      setSource(values);
      setVisible(true);
    };

    const close = () => {
      setVisible(false);
      form.resetFields();
    };

    /** 提交表单处理 */
    const submitHandler = () => {
      form.validateFields().then(() => {
        const values = form.getFieldsValue();
        if (submit) {
          setLoading(true);
          submit(values)
            .then((res) => {
              if (res) close();
            })
            .finally(() => {
              setLoading(false);
            });
        }
      });
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const footer = () => {
      return (
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {props.confirm ? null : (
            <Button key="back" onClick={close}>
              取消
            </Button>
          )}
          <Button type="primary" key="ok" loading={loading} onClick={submitHandler}>
            确定
          </Button>
        </Space>
      );
    };
    return (
      <Drawer
        title={props.title}
        width={props.width || 400}
        destroyOnClose={props.destroyOnClose}
        open={visible}
        onClose={close}
        footer={footer()}
      >
        <ProForm<T>
          layout="horizontal"
          colon={false}
          className={Style.draw_form_main}
          form={form}
          grid={true}
          submitter={false}
          labelCol={props.labelCol ?? { flex: '80px' }}
          labelAlign={props.labelAlign}
        >
          {children({ source, form, visible })}
        </ProForm>
      </Drawer>
    );
  });
