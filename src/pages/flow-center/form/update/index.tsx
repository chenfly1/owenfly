import { ProFormInstance, ProFormText, StepsForm } from '@ant-design/pro-components';
import { Button, Modal, Space, message } from 'antd';
import { MutableRefObject, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import BaseForm from './base';
import FormDesigner, { FormDesignerRef } from '../../designer/index';
import { PreviewWidget } from '../../designer/widgets';
import Style from '../index.less';
import { updateForm } from '@/services/flow';
import { useModel } from 'umi';

export interface FormUpdateProps {
  baseForm: Partial<{ tenantId: string; name: string; thirdServerUrl: string; id: string }>;
  designForm: { schema: string };
}

export default forwardRef<
  { open: (values?: any) => void; close: () => void },
  { title: string; close?: (changed?: boolean) => void }
>(({ title, close }, ref) => {
  const flowSource = useModel('useFlow');
  const [source, setSource] = useState<FormUpdateProps>();
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [nextting, setNextting] = useState<Record<string, boolean>>({});
  const [currStep, setCurrStep] = useState(0);
  const formMapRef = useRef<MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const designerRef = useRef<FormDesignerRef>(null);
  const cacheRef = useRef<Record<string, any>>({});
  const openHandler = (values?: FormUpdateProps) => {
    setVisible(true);
    setSource(values);
    cacheRef.current.updated = false;
    setTimeout(() => {
      formMapRef.current?.[0]?.current?.setFieldsValue(values?.baseForm);
      formMapRef.current?.[1]?.current?.setFieldsValue(values?.designForm);
    });
  };

  const closeHandler = () => {
    formMapRef.current?.forEach((form) => form.current?.resetFields());
    setCurrStep(0);
    setVisible(false);
    close?.(cacheRef.current.updated);
  };

  const updateNextting = (step: number, value = false) => {
    setNextting((prev) => ({ ...prev, [step]: value }));
  };

  const updateSubmitting = (step: number, value = false) => {
    setSubmitting((prev) => ({ ...prev, [step]: value }));
  };

  const submit = async (
    values: any,
    step: number = currStep,
    callback?: () => void,
    next?: boolean,
  ) => {
    const updateLoading = next ? updateNextting : updateSubmitting;
    updateLoading(step, true);
    await updateForm(values)
      .then((res) => {
        formMapRef.current?.[0]?.current?.setFieldValue('id', res.id);
        cacheRef.current.updated = true;
        updateLoading(step, false);
        message.success('保存成功');
        callback?.();
      })
      .finally(() => {
        updateLoading(step, false);
      });
  };

  const saveBase = async (next = false) => {
    await formMapRef.current?.[0]?.current?.validateFields();
    const values = {
      ...formMapRef.current?.[0]?.current?.getFieldsValue(),
      formStatus: 1,
    };
    if (next) {
      await submit(values, currStep, undefined, next);
      flowSource.handleTenant(values.tenantId);
      setCurrStep(currStep + 1);
      designerRef?.current?.setSchema(
        formMapRef.current?.[1]?.current?.getFieldValue('schema') || {},
      );
    } else {
      submit(values);
    }
  };

  const saveDesign = async (next = false) => {
    const schema = designerRef.current?.getSchema() || {};
    formMapRef.current[1].current?.setFieldValue('schema', schema);
    const values = {
      ...formMapRef.current?.[0]?.current?.getFieldsValue(),
      formStatus: 1,
      formJson: JSON.stringify(schema),
    };
    if (next) {
      await submit(values, currStep, undefined, next);
      setCurrStep(currStep + 1);
    } else {
      submit(values);
    }
  };

  const saveAll = async () => {
    const baseInfo = formMapRef.current?.[0]?.current?.getFieldsValue();
    const { schema } = formMapRef.current?.[1]?.current?.getFieldsValue() || {};
    submit(
      {
        ...baseInfo,
        formStatus: 2,
        formJson: JSON.stringify(schema),
      },
      currStep,
      () => {
        closeHandler();
      },
    );
  };

  useImperativeHandle(ref, () => ({
    open: openHandler,
    close: closeHandler,
  }));

  return (
    <StepsForm
      onFinish={async () => {
        setVisible(false);
      }}
      current={currStep}
      formProps={{
        validateMessages: {
          required: '此项为必填项',
        },
      }}
      stepsProps={{
        size: 'small',
      }}
      formMapRef={formMapRef}
      stepsFormRender={(dom) => {
        return (
          <Modal
            title={title}
            width="100vw"
            style={{
              maxWidth: '100vw',
              top: 0,
              paddingBottom: 0,
            }}
            bodyStyle={{
              height: 'calc(100vh - 82px)',
              padding: '0px',
              overflow: 'hidden',
            }}
            className={Style.form_update}
            onCancel={closeHandler}
            open={visible}
            footer={false}
            destroyOnClose
          >
            {dom}
          </Modal>
        );
      }}
    >
      <StepsForm.StepForm
        name="base"
        title="基础数据"
        layout="horizontal"
        colon={false}
        labelCol={{ flex: '100px' }}
        onFinish={async () => {
          return true;
        }}
      >
        <div className={Style.form_update_content}>
          <div style={{ width: 500 }}>
            <BaseForm source={source?.baseForm} />
          </div>
          <Space style={{ margin: '0 auto' }}>
            <Button loading={submitting[0]} onClick={() => saveBase()}>
              保存
            </Button>
            <Button type="primary" loading={nextting[0]} onClick={() => saveBase(true)}>
              下一步
            </Button>
          </Space>
        </div>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="designer" title="表单设计" colon={false}>
        <div style={{ marginTop: '-32px' }}>
          <ProFormText name="schema" hidden />
          <FormDesigner
            ref={designerRef}
            actions={
              <Space>
                <Button loading={submitting[1]} onClick={() => saveDesign()}>
                  保存
                </Button>
                <Button
                  onClick={() => {
                    designerRef?.current?.setSchema(
                      formMapRef.current?.[1]?.current?.getFieldValue('schema'),
                    );
                    setCurrStep(currStep - 1);
                  }}
                >
                  上一步
                </Button>
                <Button type="primary" loading={nextting[1]} onClick={() => saveDesign(true)}>
                  下一步
                </Button>
              </Space>
            }
          />
        </div>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="time" title="预览及提交" colon={false}>
        <div className={Style.form_update_content}>
          <div className={Style.form_preview}>
            <PreviewWidget schema={formMapRef?.current[1]?.current?.getFieldValue('schema')} />
          </div>
          <Space>
            <Button onClick={() => setCurrStep(currStep - 1)}>上一步</Button>
            <Button type="primary" loading={submitting[2]} onClick={saveAll}>
              提交
            </Button>
          </Space>
        </div>
      </StepsForm.StepForm>
    </StepsForm>
  );
});
