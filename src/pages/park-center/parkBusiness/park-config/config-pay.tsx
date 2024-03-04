import { updateRuleConfigPay, updateRuleConfigCharge } from '@/services/park';
import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';

import { Button, Card, Col, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { pProps } from './data.d';
import { Access, useAccess } from 'umi';

const ConfigPay: React.FC<pProps> = forwardRef((props, ref) => {
  const { data, loading, parkId, projectId } = props;
  const payRef = useRef<ProFormInstance>();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const access = useAccess();

  const payMethodOps = [
    {
      label: '通联支付',
      value: '1',
    },
    {
      label: '支付宝',
      value: '2',
    },
    {
      label: '微信',
      value: '3',
    },
  ];
  useEffect(() => {
    payRef.current?.resetFields();
    if (parkId.length) {
      payRef.current?.setFieldsValue({ ...data, parkId });
    }
  }, [loading, parkId]);

  // 临停缴费，月租缴费更新
  const savePay = async (values: any) => {
    const res = await updateRuleConfigPay({ ...values, parkId, projectId });
    if (res.code == 'SUCCESS') {
      return true;
    } else {
      message.error(res.message);
    }
    return false;
  };
  // 保存C端业务配置
  const saveCharge = async (values: any) => {
    const res = await updateRuleConfigCharge({ ...values, parkId, projectId });
    if (res.code == 'SUCCESS') {
      return true;
    } else {
      message.error(res.message);
    }
    return false;
  };
  // 编辑/保存
  const onEditBtn = (callback?: any) => {
    if (!parkId.length) {
      message.warning('请选择车场');
      return;
    }
    if (disable) {
      setDisable(false);
    } else {
      // 保存
      payRef.current?.validateFields().then((values) => {
        setOnSaving(true);
        Promise.all([savePay(values), saveCharge(values)]).then(() => {
          setOnSaving(false);
          // 保存成功
          setDisable(true);
          payRef.current?.setFieldsValue(values);
          message.success('保存成功');
          if (typeof callback === 'function') {
            callback();
          }
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
          margin: '10px 21px',
        }}
      >
        <ProForm
          key="3"
          layout="horizontal"
          formRef={payRef}
          colon={false}
          disabled={disable}
          submitter={false}
          style={{ width: '100%', marginTop: '10px' }}
          validateTrigger="onBlur"
        >
          <Col span={12}>
            <ProFormText
              label="车场编号"
              labelCol={{ flex: '140px' }}
              name="parkId"
              disabled
              placeholder="-"
            />
          </Col>

          {/* <ProFormCheckbox.Group
          label="临停缴费"
          name="tempPay"
          options={[
            { label: payEnum.union, value: payValues[0] },
            { label: payEnum.zfb, value: payValues[1] },
            { label: payEnum.wx, value: payValues[2] },
          ]}
          rules={[{ required: true, message: '请选择临停缴费类型' }]}
          fieldProps={{
            onChange: (val) => {
              setTempPayWay(val);
              window.console.log(val, tempPayWay);
            },
          }}
        />

        <ProFormText
          hidden={tempPayWay.indexOf(payValues[0]) == -1}
          label="通联支付商户号"
          name="tempPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        />
        <ProFormText
          hidden={tempPayWay.indexOf(payValues[1]) == -1}
          label="支付宝支付商户号"
          name="tempPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        />
        <ProFormText
          hidden={tempPayWay.indexOf(payValues[2]) == -1}
          label="微信支付商户号"
          name="tempPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        />

        <ProFormCheckbox.Group
          label="月租缴费"
          name="monthPay"
          options={[
            { label: payEnum.union, value: payValues[0] },
            { label: payEnum.zfb, value: payValues[1] },
            { label: payEnum.wx, value: payValues[2] },
          ]}
          rules={[{ required: true, message: '请选择月租缴费类型' }]}
          fieldProps={{
            onChange: (val) => {
              setMonthPayWay(val);
            },
          }}
        />

        <ProFormText
          hidden={monthPayWay.indexOf(payValues[0]) == -1}
          label="通联支付商户号"
          name="monthlyPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        />
        <ProFormText
          hidden={monthPayWay.indexOf(payValues[1]) == -1}
          label="支付宝支付商户号"
          name="monthlyPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        />
        <ProFormText
          hidden={monthPayWay.indexOf(payValues[2]) == -1}
          label="微信支付商户号"
          name="monthlyPayBuzNo"
          rules={[{ required: true, message: '请输入支付商户号' }]}
        /> */}

          <Card title="临停缴费" style={{ marginBottom: 24 }}>
            {/* <Row gutter={16}> */}
            {/* <Col span={16}>
              <ProFormRadio.Group
                labelCol={{ flex: '120px' }}
                label="支付方式"
                name="tempPayMethod"
                options={payMethodOps}
                rules={[{ required: true, message: '请输入支付方式' }]}
              />
            </Col> */}
            <Col span={16}>
              <ProFormText
                labelCol={{ flex: '120px' }}
                label="临停支付APPID"
                name="tempAppId"
                rules={[{ required: true, message: '请输入临停支付APPID' }]}
              />
            </Col>

            <Col span={16}>
              <ProFormText
                labelCol={{ flex: '120px' }}
                label="临停支付商户号"
                name="tempMerchantId"
                rules={[{ required: true, message: '请输入临停支付商户号' }]}
              />
            </Col>
            {/* </Row> */}
          </Card>

          <Card title="月租缴费" style={{ marginBottom: 24 }}>
            {/* <Row gutter={16}> */}
            {/* <Col span={16}>
              <ProFormRadio.Group
                labelCol={{ flex: '120px' }}
                label="支付方式"
                name="monthlyPayMethod"
                options={payMethodOps}
                rules={[{ required: true, message: '请输入支付方式' }]}
              />
            </Col> */}
            <Col span={16}>
              <ProFormText
                labelCol={{ flex: '120px' }}
                label="月租支付APPID"
                name="monthlyAppId"
                rules={[{ required: true, message: '请输入月租支付APPID' }]}
              />
            </Col>

            <Col span={16}>
              <ProFormText
                labelCol={{ flex: '120px' }}
                label="月租支付商户号"
                name="monthlyMerchantId"
                rules={[{ required: true, message: '请输入月租支付商户号' }]}
              />
            </Col>
            {/* </Row> */}
          </Card>
          <Card title="C端支付配置" style={{ marginBottom: 24 }}>
            {/* <Row gutter={16}> */}
            <Col span={16}>
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
          <Button
            style={{ position: 'relative', top: '-3px' }}
            type="primary"
            onClick={onEditBtn}
            loading={onSave}
          >
            {disable ? '编辑' : '保存'}
          </Button>
        </Access>
      </div>
    </PageContainer>
  );
});

export default ConfigPay;
