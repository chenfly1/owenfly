import { ProFormInstance, StepsForm } from '@ant-design/pro-components';
import { Button, Modal, Space, Spin, message } from 'antd';
import { MutableRefObject, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import BaseForm from './base';
import SettingForm from './setting';
import ProcessDesigner, { BpmnDesignerRef } from '../../BPMN/index';
import Style from '../index.less';
import { useModel } from 'umi';
import {
  getBpmnModel,
  getFlowDetail,
  getFlowTimeoutSetting,
  getFormDetail,
  updateBpmnModel,
  updateFlow,
  updateFlowTimeoutSetting,
} from '@/services/flow';

export interface FlowUpdateProps {
  baseForm: Partial<{
    tenantId: string;
    name: string;
    url: string;
    modelKey: string;
    formName: string;
    id: string;
    modelId: string;
    modelXml: string;
    formSchema?: object;
    director?: string;
  }>;
  settingForm: {};
}

export default forwardRef<
  { open: (values?: any) => void; close: () => void },
  { title: string; close?: (changed?: boolean) => void }
>(({ title, close }, ref) => {
  const [source, setSource] = useState<FlowUpdateProps>();
  const [nodes, setNodes] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextting, setNextting] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [currStep, setCurrStep] = useState(0);
  const designerRef = useRef<BpmnDesignerRef>(null);
  const { handleProcessFormSchema, handleTenant } = useModel('useFlow', (model) => ({
    handleProcessFormSchema: model.handleProcessFormSchema,
    handleTenant: model.handleTenant,
  }));
  const formMapRef = useRef<MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const cacheRef = useRef<Record<string, any>>({});
  const openHandler = async (values?: FlowUpdateProps) => {
    setVisible(true);
    setSource(values);
    cacheRef.current.updated = false;
    setTimeout(async () => {
      setLoading(true);
      const [model, form, setting] = await Promise.all([
        values?.baseForm.modelId
          ? getBpmnModel(values.baseForm.modelId)
          : Promise.resolve({ modelXml: '' }),
        values?.baseForm.modelKey
          ? getFormDetail({ modelKey: values.baseForm.modelKey })
          : Promise.resolve({ formJson: '' }),
        values?.baseForm.modelKey
          ? getFlowTimeoutSetting(values?.baseForm.modelKey)
          : Promise.resolve({} as FlowTimeoutSettingType),
      ]).finally(() => {
        setLoading(false);
      });
      formMapRef.current?.[0]?.current?.setFieldsValue({
        ...(values?.baseForm || {}),
        modelXml: model.modelXml,
        formSchema: form.formJson ? JSON.parse(form.formJson) : {},
      });
      // 设置扩展配置表单
      formMapRef.current?.[2]?.current?.setFieldsValue({
        ...(values?.settingForm || {}),
        timeOutNotify: setting.timeOutNotify === 1,
        userNotify: setting?.userNotify === 1,
        resultNotify: setting?.resultNotify === 1,
        list: setting?.list?.length
          ? setting?.list?.map((item) => ({
              timeoutId: item?.id,
              warnNotify: item?.warnNotify === 1,
              taskDefKey: item.taskDefKey ?? '',
              timeOutNum: item?.timeOutNum,
              timeOutUnit: `${item?.timeOutUnit ?? ''}`,
              warnNum: item?.warnNum,
              warnUnit: `${item?.warnUnit ?? ''}`,
              notice: ([] as any).concat(
                item?.notifyInitiator === 1 ? ['notifyInitiator'] : [],
                item?.notifyNodeOwner === 1 ? ['notifyNodeOwner'] : [],
              ),
            }))
          : [{ taskDefKey: '' }],
      });
    });
  };

  const closeHandler = () => {
    formMapRef.current?.forEach((form) => form.current?.resetFields());
    setCurrStep(0);
    setVisible(false);
    close?.(cacheRef.current.updated);
  };

  const updateSubmitting = (step: number, value = false, next = false) => {
    if (next) {
      setNextting((prev) => ({ ...prev, [step]: value }));
    } else {
      setSubmitting((prev) => ({ ...prev, [step]: value }));
    }
  };

  const updteNodes = async () => {
    try {
      const { modelKey } = formMapRef.current?.[0]?.current?.getFieldsValue();
      const { modelXmlJson } = await getFlowDetail({ modelKey }).catch(() => ({} as any));
      const xmlObj = JSON.parse(modelXmlJson);
      const process: any = xmlObj?.['bpmn2:definitions']?.['bpmn2:process'] || {};
      const nodeList = ([] as any).concat(
        ...Object.keys(process)
          .filter((item) => item.startsWith('bpmn2'))
          .map((item) => (Array.isArray(process[item]) ? process[item] : [process[item]])),
      );
      setNodes(nodeList);
    } catch (err) {
      setNodes([]);
    }
  };

  const saveBase = async (next = false) => {
    await formMapRef.current?.[0]?.current?.validateFields();
    const { formSchema, modelXml, formName, ...rest } =
      formMapRef.current?.[0]?.current?.getFieldsValue();
    updateSubmitting(0, true, next);
    const { modelId, id } = await updateFlow(rest).finally(() => updateSubmitting(0, false, next));
    handleTenant(rest.tenantId);
    cacheRef.current.updated = true;
    message.success('保存成功');
    formMapRef.current?.[0]?.current?.setFieldValue('id', id);
    formMapRef.current?.[0]?.current?.setFieldValue('modelId', modelId);
    if (next) {
      handleProcessFormSchema(formSchema);
      designerRef?.current?.setSchema(modelXml || '');
      setCurrStep(currStep + 1);
    }
  };

  const saveDesign = async (next = false) => {
    const schema = await designerRef.current?.getSchema();
    formMapRef.current[0].current?.setFieldValue('modelXml', schema);
    try {
      updateSubmitting(1, true, next);
      const { id, modelId, modelXml, formSchema, formName, ...rest } =
        formMapRef.current?.[0]?.current?.getFieldsValue();
      const data = { modelId, modelXml };
      if (!id) {
        const res = await updateFlow(rest);
        data.modelId = res.modelId;
        formMapRef.current?.[0]?.current?.setFieldValue('id', res.id);
        formMapRef.current?.[0]?.current?.setFieldValue('modelId', res.modelId);
      }
      await updateBpmnModel(data);
      await updteNodes();
      cacheRef.current.updated = true;
      message.success('保存成功');
      updateSubmitting(1, false, next);
      if (next) {
        setCurrStep(currStep + 1);
      }
    } catch (err) {
      updateSubmitting(1, false, next);
    }
  };

  const submit = async () => {
    try {
      const { modelXml, formSchema, formName, ...rest } =
        formMapRef.current?.[0]?.current?.getFieldsValue();
      const { userNotify, resultNotify, timeOutNotify, list } =
        formMapRef.current?.[2]?.current?.getFieldsValue();
      updateSubmitting(currStep, true);
      const { modelId, modelKey } = await updateFlow(rest);
      await Promise.all([
        updateBpmnModel({ modelId, modelXml }),
        updateFlowTimeoutSetting({
          modelKey,
          timeOutNotify: timeOutNotify ? 1 : 0,
          userNotify: userNotify ? 1 : 0,
          resultNotify: resultNotify ? 1 : 0,
          list: (list || []).map(
            ({
              notice,
              warnNotify,
              settingId,
              timeoutId,
              taskDefKey,
              timeOutUnit,
              warnUnit,
              ...restSetting
            }: any) => ({
              ...restSetting,
              taskDefKey: taskDefKey === '' ? undefined : taskDefKey,
              timeOutUnit: timeOutUnit !== undefined ? Number(timeOutUnit) : timeOutUnit,
              warnUnit: warnUnit !== undefined ? Number(warnUnit) : warnUnit,
              notifyInitiator: notice?.includes('notifyInitiator') ? 1 : 0,
              notifyNodeOwner: notice?.includes('notifyNodeOwner') ? 1 : 0,
              warnNotify: warnNotify ? 1 : 0,
              id: timeoutId,
            }),
          ),
        }),
      ]);
      cacheRef.current.updated = true;
      message.success('保存成功');
      closeHandler();
      updateSubmitting(currStep, false);
    } catch (err) {
      updateSubmitting(currStep, false);
    }
  };

  useImperativeHandle(ref, () => ({
    open: openHandler,
    close: closeHandler,
  }));

  return (
    <StepsForm
      current={currStep}
      formProps={{
        colon: false,
        validateMessages: {
          required: '此项为必填项',
        },
      }}
      stepsProps={{
        size: 'small',
      }}
      formMapRef={formMapRef}
      stepsFormRender={(dom, submitter) => {
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
            className={Style.flow_update}
            onCancel={closeHandler}
            open={visible}
            footer={false}
            destroyOnClose
          >
            <Spin spinning={loading}>{dom}</Spin>
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
        <div className={Style.flow_update_content}>
          <div style={{ width: 500 }}>
            <BaseForm source={source?.baseForm} />
          </div>
          <Space>
            <Button loading={submitting[0]} onClick={() => saveBase()}>
              保存
            </Button>
            <Button type="primary" loading={nextting[0]} onClick={() => saveBase(true)}>
              下一步
            </Button>
          </Space>
        </div>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="designer" colon={false} title="流程设计">
        <div style={{ marginTop: '-32px' }}>
          <Space className={Style.flow_update_action}>
            <Button type="primary" loading={nextting[1]} onClick={() => saveDesign(true)}>
              下一步
            </Button>
            <Button
              onClick={() => {
                setCurrStep(currStep - 1);
              }}
            >
              上一步
            </Button>
            <Button loading={submitting[1]} onClick={() => saveDesign()}>
              保存
            </Button>
          </Space>
          <ProcessDesigner ref={designerRef} />
        </div>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="setting" colon={false} layout="inline" title="拓展设置及发布">
        <div className={Style.flow_update_setting}>
          <Space className={Style.flow_update_action}>
            <Button type="primary" loading={submitting[2]} onClick={submit}>
              提交
            </Button>
            <Button
              onClick={() => {
                setCurrStep(currStep - 1);
              }}
            >
              上一步
            </Button>
          </Space>
          <div className={Style.flow_update_setting_content}>
            <SettingForm nodes={nodes} />
          </div>
        </div>
      </StepsForm.StepForm>
    </StepsForm>
  );
});
