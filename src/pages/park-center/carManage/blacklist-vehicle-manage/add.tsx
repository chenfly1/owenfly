import { createBlackCar, parkYardDropDownList } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormTextArea } from '@ant-design/pro-components';
import { ProFormDateRangePicker } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import type { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';
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

  const queryParkList = async () => {
    const res = await parkYardDropDownList(project.bid, {});
    return (res.data || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('新增黑名单车辆');
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    //新增
    const params = {
      projectId: project.bid,
      parkId: formData.parkId[0],
      plate: formData.plate,
      owernName: formData.owernName,
      remark: formData.remark,
      startTime: formData?.dateRange[0] + ' 00:00:00',
      endTime: formData?.dateRange[1] + ' 23:59:59',
    };
    // 新增
    const res = await createBlackCar(params);
    if (res.code === 'SUCCESS') {
      message.success('创建成功');
      onSubmit();
      return true;
    }
    return false;
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
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
        onFinish={onFinish}
      >
        <ProFormText
          label="车牌号码"
          name="plate"
          width={300}
          placeholder="请输入车牌号码"
          rules={[
            {
              required: true,
            },
            {
              pattern:
                /(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}[A-Z0-9]{1}$)|(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$)/,
              message: '格式不正确',
            },
          ]}
        />
        <ProFormText
          label="车主姓名"
          name="owernName"
          width={300}
          readonly={readonly}
          placeholder="请输入车主姓名"
          fieldProps={{
            maxLength: 20,
            showCount: true,
          }}
        />
        <ProFormSelect
          name="parkId"
          width={300}
          label="车场名称"
          rules={[{ required: true }]}
          placeholder="请选择车场名称"
          mode="multiple"
          request={queryParkList}
        />
        <ProFormDateRangePicker
          rules={[{ required: true, message: '请选择有效期' }]}
          label="有效期"
          fieldProps={{ disabledDate }}
          width={300}
          name="dateRange"
        />
        <ProFormTextArea
          name="remark"
          label="拉黑原因"
          width={300}
          fieldProps={{
            maxLength: 50,
          }}
          placeholder="请输入拉黑原因"
        />
      </DrawerForm>
    </>
  );
};

export default Add;
