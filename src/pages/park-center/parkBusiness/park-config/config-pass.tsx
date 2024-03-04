import { updateRuleConfigPass } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { ProForm, ProFormRadio } from '@ant-design/pro-components';
import { Button, Card, Col, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Access, useAccess } from 'umi';
import type { pProps } from './data';

const radioCheckOptions = [
  {
    label: '自动放行',
    value: 1,
  },
  {
    label: '人工确定',
    value: 2,
  },
];

const radioAccessOptions = [
  {
    label: '是',
    value: true,
  },
  {
    label: '否',
    value: false,
  },
];

const ConfigPass: React.FC<pProps> = (props) => {
  const { data, loading, parkId, projectId } = props;
  const passRef = useRef<ProFormInstance>();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const access = useAccess();
  // access.functionAccess = () => true;
  useEffect(() => {
    passRef.current?.resetFields();
    if (parkId.length) {
      passRef.current?.setFieldsValue({ ...data });
    }
  }, [loading, parkId]);

  const onEditBtn = () => {
    if (!parkId.length) {
      message.warning('请选择车场');
      return;
    }
    if (disable) {
      setDisable(false);
    } else {
      setOnSaving(true);
      passRef.current?.validateFields().then((values) => {
        updateRuleConfigPass({ ...values, parkId, projectId })
          .then((res) => {
            setOnSaving(false);
            if (res.code == 'SUCCESS') {
              // 保存成功
              setDisable(true);
              passRef.current?.setFieldsValue(values);
              message.success(res.message);
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
          key="2"
          layout="horizontal"
          style={{ width: '100%' }}
          colon={false}
          formRef={passRef}
          disabled={disable}
          submitter={false}
        >
          <Card title="车辆入场" style={{ marginBottom: 24 }}>
            {/* <Row gutter={16}> */}
            <Col span={12}>
              <ProFormRadio.Group
                label="临停车入场方式"
                name="temporaryPassMode"
                options={radioCheckOptions}
              />
            </Col>

            <Col span={12}>
              <ProFormRadio.Group
                label="无牌车入场方式"
                name="unlicensedPassMode"
                options={radioCheckOptions}
              />
            </Col>
            {/* </Row> */}

            <Col span={12}>
              <ProFormRadio.Group
                label="满位是否允许入场"
                name="fullAdmission"
                options={radioAccessOptions}
              />
            </Col>
          </Card>

          <Card title="车辆离场">
            <Col span={18}>
              <ProFormRadio.Group
                label="未找到入场记录的车辆离场方式"
                name="noRecordExitMode"
                options={radioCheckOptions}
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
};

export default ConfigPass;
