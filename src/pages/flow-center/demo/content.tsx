import { ProFormText } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Widget } from '../sdk';
import { Form, Space, Spin } from 'antd';
import { getFlowHandleHistory, getFlowInstanceInfo } from '@/services/flow';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';

export default () => {
  const location: any = useLocation();
  const eleRef = useRef<any>();
  const widget = useRef<Widget>();
  const [record, setRecord] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const query = location?.query || {};

  useEffect(() => {
    const { id, modelKey, type, taskId, nodeName } = query;

    if (type === 'create' && modelKey) {
      widget.current = new Widget({
        id: modelKey,
        element: eleRef?.current,
        action: 'create',
      });
      // 表单事件监听
      const widgetForm = widget.current.getForm();
      widgetForm?.subscribe(({ action, payload }) => {
        if (action === 'onFormSubmitEnd') {
          if (payload?.action === 'submit' && !payload?.error) {
            history.push({
              pathname: '/flow-center/demo',
            });
          }
        }
        if (action === 'onFormReady') {
          if (eleRef.current && payload) {
            // eleRef.current.cssText = `width: ${payload.width}; height: ${payload.height}`;
          }
        }
      });
    }
    if (type === 'check' || type === 'handle') {
      widget.current = new Widget({
        id: modelKey,
        flowId: id,
        taskId,
        nodeName,
        element: eleRef?.current,
        action: type,
      });
      // 表单事件监听
      const widgetForm = widget.current.getForm();
      widgetForm?.subscribe(({ action, payload }) => {
        if (action === 'onFormSubmitEnd') {
          if (!payload?.error) {
            history.push({
              pathname: '/flow-center/demo',
            });
          }
        }
        if (action === 'onFormReady') {
          if (eleRef.current && payload) {
            // eleRef.current.style.width = `${payload.width}px`;
            // eleRef.current.style.height = `${payload.height}px`;
          }
        }
      });

      // 获取流程信息
      Promise.all([getFlowInstanceInfo(id), getFlowHandleHistory(id)]).then(([info, records]) => {
        form.setFieldsValue({
          formName: info.formName,
          starterInfo: info.starterInfo,
          startTime: info.gmtCreated,
        });
        setRecord(records);
      });
    }
  }, []);

  return (
    <PageContainer
      style={{
        padding: '0px 20px',
      }}
      header={{
        title: null,
      }}
    >
      <Spin spinning={loading}>
        <ProForm form={form} layout="horizontal" submitter={false}>
          {query.type !== 'create' ? (
            <ProForm.Group title="基础数据">
              <ProFormText label="流程名称" name="formName" readonly />
              <ProFormText label="提交人" name="starter" readonly />
              <ProFormText label="提交时间" name="startTime" readonly />
            </ProForm.Group>
          ) : null}
          <ProForm.Group style={{ width: '100%' }} title="表单内容">
            <div id="flow_demo_wrapper">
              <div
                style={{ width: '800px', height: '500px' }}
                ref={eleRef}
                id="flow_demo_content"
              />
            </div>
          </ProForm.Group>
          {query.type !== 'create' ? (
            <ProForm.Group title="审批记录" titleStyle={{ margin: '30px 0 10px' }}>
              <ul>
                {record.map((item: any) => {
                  return (
                    <li key={item.id}>
                      <Space size="large">
                        <span key="user">操作人：{item.userName}</span>
                        <span key="type">操作类型：{item.typeName}</span>
                        <span key="time">操作时间：{item.gmtUpdated}</span>
                        <span key="remark">备注信息：{item.message ?? '-'}</span>
                      </Space>
                    </li>
                  );
                })}
              </ul>
            </ProForm.Group>
          ) : null}
        </ProForm>
      </Spin>
    </PageContainer>
  );
};
