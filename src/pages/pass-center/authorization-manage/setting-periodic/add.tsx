import {
  ProFormText,
  ProFormDateRangePicker,
  ProFormCheckbox,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { getPeriodDetails, periodSave } from '@/services/door';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  modalVisit: boolean;
  data: any;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const saveWeeks = (groups: string[]) => {
  const week = [];
  for (let i = 1; i < 8; i++) {
    if (groups.includes(i.toString())) {
      week.push(1);
    } else {
      week.push(0);
    }
  }
  return week.join('');
};

const getWeeks = (week: string) => {
  const groups = [];
  for (let i = 1; i < week.length; i++) {
    if (week[i] === '1') {
      groups.push(i.toString());
    }
  }
  return groups;
};

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < dayjs().startOf('day');
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, data, onOpenChange, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [isView, setIsView] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>();

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      setIsView(false);
      if (data.id) {
        setIsView(true);
        setCoverImage(data.coverImage);
        getPeriodDetails(data.id).then(async (res: any) => {
          console.log(getWeeks(res.data.weekend));
          formRef?.current?.setFieldsValue({
            ...res.data,
            dateRange: [res.data.validDateStart, res.data.validDateEnd],
            timeRange: [res.data.validTimeStart, res.data.validTimeEnd],
            groups: getWeeks(res.data.weekend),
          });
        });
      }
    }
  }, [modalVisit]);

  const onFinish = async (values: any) => {
    try {
      values.coverImage = coverImage;
      values.validDateStart = values.dateRange[0];
      values.validDateEnd = values.dateRange[1];
      values.validTimeStart = values.timeRange[0];
      values.validTimeEnd = values.timeRange[1];
      values.weekend = saveWeeks(values.groups);
      delete values.dateRange;
      delete values.timeRange;
      delete values.groups;
      const res = await periodSave(values);
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        formRef?.current?.resetFields();
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  return (
    <DrawerForm
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={isView ? '查看周期' : '新增周期'}
      layout="horizontal"
      disabled={isView}
      colon={true}
      width={560}
      labelCol={{
        flex: '120px',
      }}
      onFinish={onFinish}
      open={modalVisit}
    >
      <ProFormText
        name="name"
        rules={[
          {
            required: true,
            message: '请输入周期名称',
          },
        ]}
        fieldProps={{ maxLength: 50 }}
        label="周期名称"
      />
      <ProFormDateRangePicker
        name="dateRange"
        width="lg"
        style={{ width: '100%' }}
        fieldProps={{ disabledDate }}
        initialValue={[dayjs().startOf('day'), dayjs().add(10, 'year')]}
        label="授权期限日期"
        rules={[{ required: true, message: '请选择授权日期' }]}
      />
      <ProFormTimePicker.RangePicker
        name="timeRange"
        width="lg"
        style={{ width: '100%' }}
        label="时间区间"
        rules={[{ required: true, message: '请选择时间区间' }]}
      />
      <ProFormCheckbox.Group
        name="groups"
        label="开放星期"
        rules={[{ required: true, message: '请选择开放星期' }]}
        options={[
          {
            value: '1',
            label: '周一',
          },
          {
            value: '2',
            label: '周二',
          },
          {
            value: '3',
            label: '周三',
          },
          {
            value: '4',
            label: '周四',
          },
          {
            value: '5',
            label: '周五',
          },
          {
            value: '6',
            label: '周六',
          },
          {
            value: '7',
            label: '周日',
          },
        ]}
      />
    </DrawerForm>
  );
};

export default AddModelForm;
