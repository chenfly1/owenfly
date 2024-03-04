import { couponCreate } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Col, Row, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const id = data?.relId;

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue({
        date: dayjs().format('YYYY-MM-DD'),
      });
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const params = {
      ...formData,
      value: (formData.value * 100).toFixed(0),
      condition: (formData.condition * 100 || 0).toFixed(0),
    };
    // 新增
    const res = await couponCreate(params);
    if (res.code === 'SUCCESS') {
      message.success('创建成功');
      onSubmit();
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <ModalForm
        colon={false}
        {...rest}
        // labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={1100}
        title={'电表补录'}
        formRef={formRef}
        modalProps={{
          bodyStyle: {
            padding: '20px 40px',
          },
        }}
        open={open}
        submitter={readonly ? false : undefined}
        onFinish={onFinish}
      >
        <Row>
          <Col span={4}>
            <ProFormText
              label="上期尖读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              label="下期尖读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="本期尖读数"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="尖用量"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <ProFormText
              label="上期峰读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              label="下期峰读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="本期峰读数"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="峰用量"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <ProFormText
              label="上期平读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              label="下期平读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="本期平读数"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="平用量"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <ProFormText
              label="上期谷读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              label="下期谷读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="本期谷读数"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="谷用量"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <ProFormText
              label="上期总读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              label="下期总读数"
              name="name"
              readonly={true}
              fieldProps={{
                addonAfter: 'kw·h',
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="本期总读数"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="总用量"
              labelCol={{
                flex: '100px',
              }}
              // width={200}
              name="name"
              readonly={readonly}
              placeholder=""
              fieldProps={{
                addonAfter: 'kw·h',
              }}
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default Add;
