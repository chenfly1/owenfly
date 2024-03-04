import { couponCreate } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormCheckbox } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';

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
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const id = data?.relId;

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue({
        type: '02',
      });
      setTitle('新建优惠券');
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
      <DrawerForm
        colon={false}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        submitter={readonly ? false : undefined}
        onFinish={onFinish}
      >
        <ProFormSelect
          label="券类型"
          colon={readonly || !!id}
          name="type"
          width={300}
          readonly={readonly}
          placeholder="请选择券类型"
          rules={[{ required: true }]}
          options={[
            { label: '金额折扣', value: '02' },
            // {label: '时间折扣', value: '2'},
          ]}
        />
        <ProFormText
          label="优惠券名称"
          name="name"
          width={300}
          readonly={readonly}
          placeholder="请输入优惠券名称"
          fieldProps={{
            maxLength: 20,
            showCount: true,
          }}
          rules={[{ required: true }]}
        />
        <ProFormDependency name={['type']}>
          {({ type }) => {
            if (type === '02') {
              return (
                <>
                  <ProFormDigit
                    label="抵扣金额"
                    name="value"
                    width={300}
                    readonly={readonly}
                    placeholder="请输入抵扣金额"
                    fieldProps={{
                      controls: false,
                      addonAfter: '元',
                      precision: 2,
                    }}
                    rules={[{ required: true }]}
                  />
                  <ProFormCheckbox
                    label="是否设置满减值"
                    name="isCondition"
                    width={300}
                    readonly={readonly}
                    placeholder="请输入满减额度"
                  />
                  <ProFormDependency name={['isCondition']}>
                    {({ isCondition }) => {
                      if (isCondition) {
                        return (
                          <ProFormDigit
                            label="满减额度"
                            name="condition"
                            width={300}
                            readonly={readonly}
                            fieldProps={{
                              controls: false,
                              addonAfter: '元',
                              precision: 2,
                            }}
                            rules={[{ required: true }]}
                            placeholder="请输入满减额度"
                          />
                        );
                      } else {
                        return null;
                      }
                    }}
                  </ProFormDependency>

                  <ProFormDigit
                    label="库存数量"
                    name="total"
                    width={300}
                    readonly={readonly}
                    fieldProps={{
                      controls: false,
                    }}
                    placeholder="请输入库存数量"
                    rules={[{ required: true }]}
                  />
                </>
              );
            }
          }}
        </ProFormDependency>
      </DrawerForm>
    </>
  );
};

export default Add;
