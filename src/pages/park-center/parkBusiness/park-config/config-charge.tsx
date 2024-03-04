import { PageContainer, ProForm, ProFormDigit } from '@ant-design/pro-components';
import type { ProFormInstance, PageContainerProps } from '@ant-design/pro-components';
import { Button, Card, Col, Form, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { updateRuleConfigCharge } from '@/services/park';
import type { pProps } from './data.d';
import { Access, useAccess } from 'umi';

const ConfigCharge: React.FC<pProps & PageContainerProps> = forwardRef((props, ref) => {
  const { data, loading, parkId, projectId } = props;
  const chargeRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const access = useAccess();
  // access.functionAccess = () => true;
  useEffect(() => {
    form.resetFields();
    if (parkId.length) {
      form.setFieldsValue({ ...data });
    }
  }, [loading, parkId]);

  const onEditBtn = (callback?: any) => {
    if (!parkId.length) {
      message.warning('请选择车场');
      return;
    }
    if (disable) {
      setDisable(false);
    } else {
      setOnSaving(true);
      chargeRef.current?.validateFields().then((values) => {
        updateRuleConfigCharge({ ...values, parkId, projectId })
          .then((res) => {
            setOnSaving(false);
            if (res.code == 'SUCCESS') {
              // 保存成功
              setDisable(true);
              form.setFieldsValue(values);
              message.success(res.message);
              if (typeof callback === 'function') {
                callback();
              }
            } else {
              message.error(res.message);
            }
          })
          .catch(() => {
            setOnSaving(false);
            message.error('操作失败，请重试');
          });
      });
    }
  };

  useImperativeHandle(ref, () => {
    return {
      onEditBtn,
      disable,
    };
  });

  return (
    <PageContainer loading={loading} header={{ title: null }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'self-start',
          justifyContent: 'space-between',
          margin: '7px 21px',
        }}
      >
        <ProForm
          key="1"
          layout="horizontal"
          formRef={chargeRef}
          form={form}
          disabled={disable}
          colon={false}
          style={{ width: '100%' }}
          submitter={false}
          validateTrigger="onBlur"
        >
          <Card title="C端支付配置">
            <Col span={18}>
              <ProFormDigit
                label="单笔订单挂起时间"
                name="orderTimeout"
                addonAfter="分钟"
                placeholder={'5~15'}
                fieldProps={{ max: 15, min: 5 }}
              />
            </Col>
          </Card>
        </ProForm>

        <Access accessible={access.functionAccess('alitaParking_editBusinessRule')}>
          <Button type="primary" onClick={onEditBtn} loading={onSave}>
            {disable ? '编辑' : '保存'}
          </Button>
        </Access>
      </div>
    </PageContainer>
  );
});

export default ConfigCharge;
