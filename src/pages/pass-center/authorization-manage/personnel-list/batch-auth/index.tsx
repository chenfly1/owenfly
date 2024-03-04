import { exceptionDevice } from '@/services/device';
import {
  DrawerForm,
  ProFormDateRangePicker,
  ProFormItem,
  ProFormSwitch,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Button, List, message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import TransferAreas from '@/pages/pass-center/components/transferAreas';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import styles from './style.less';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < dayjs().startOf('day');
};

const BatchAuthForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const formRef = useRef<ProFormInstance>();
  const [checkedKeys, setCheckedKeys] = useState<string[]>();
  const [eleList, setEleList] = useState<any[]>([
    {
      name: '4号电梯',
      children: [
        {
          name: '01层',
        },
        {
          name: '02层',
        },
        {
          name: '03层',
        },
        {
          name: '04层',
        },
        {
          name: '05层',
        },
        {
          name: '06层',
        },
        {
          name: '07层',
        },
      ],
    },
    {
      name: '5号电梯',
      children: [
        {
          name: '01层',
        },
        {
          name: '02层',
        },
        {
          name: '03层',
        },
        {
          name: '04层',
        },
        {
          name: '05层',
        },
        {
          name: '06层',
        },
        {
          name: '07层',
        },
      ],
    },
    {
      name: '6号电梯',
      children: [
        {
          name: '01层',
        },
        {
          name: '02层',
        },
        {
          name: '03层',
        },
        {
          name: '04层',
        },
        {
          name: '05层',
        },
        {
          name: '06层',
        },
        {
          name: '07层',
        },
      ],
    },
    {
      name: '7号电梯',
      children: [
        {
          name: '01层',
        },
        {
          name: '02层',
        },
        {
          name: '03层',
        },
        {
          name: '04层',
        },
        {
          name: '05层',
        },
        {
          name: '06层',
        },
        {
          name: '07层',
        },
      ],
    },
  ]);
  const [tags, setTags] = useState<any[]>([
    {
      name: '1个月',
      ghost: false,
    },
    {
      name: '1年',
      ghost: false,
    },
    {
      name: '5年',
      ghost: false,
    },
  ]);
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      ...data,
    });
    setCheckedKeys(data?.spaceId ? [data?.spaceId + ''] : []);
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      values.spaceId = checkedKeys?.length ? checkedKeys[0] : null;
      const res = await exceptionDevice({ ...data, ...values });
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

  const tagClick = (item: { name: string; ghost: boolean }, index: number) => {
    tags.map((i, j) => {
      if (index !== j) i.ghost = false;
      return i;
    });
    tags.splice(index, 1, {
      ...item,
      ghost: !item.ghost,
    });
    setTags([...tags]);
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title="批量授权"
      layout="horizontal"
      width={600}
      labelCol={{
        flex: '100px',
      }}
      open={modalVisit}
      onFinish={onFinish}
      submitter={{
        render: (_, dom) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormItem shouldUpdate className={styles.formItem}>
        {(form) => {
          console.log(form);
          const passingAreaIds = form?.getFieldValue('passingAreaIds');
          return (
            <ProFormItem
              label="通行区域"
              name="passingAreaIds"
              labelCol={{
                flex: '100px',
              }}
            >
              <TransferAreas
                passingAreaIds={passingAreaIds}
                selectHandle={(keys: string[]) => {
                  console.log(keys);
                  form?.setFieldsValue({
                    passingAreaIds: keys,
                  });
                }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
      <ProFormItem
        label="授权期限日期"
        name="passingAreaIds"
        className={styles.timePicker}
        labelCol={{
          flex: '100px',
        }}
      >
        <ProFormDateRangePicker
          name="dateRange"
          width={'100%' as any}
          fieldProps={{ disabledDate }}
          initialValue={[dayjs().startOf('day'), dayjs().add(10, 'year')]}
          rules={[{ required: true, message: '请选择授权日期' }]}
        />
        <Space wrap>
          {tags.map((item, index) => (
            <Button
              key={item.name}
              onClick={() => tagClick(item, index)}
              type="primary"
              ghost={!item.ghost}
              size="small"
            >
              {item.name}
            </Button>
          ))}
        </Space>
      </ProFormItem>
      <ProFormItem
        label="梯控权限"
        name="passingAreaIds"
        className={styles.timePicker}
        labelCol={{
          flex: '100px',
        }}
      >
        <ProFormSwitch name="switch" />
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          className={styles.eleListItem}
          dataSource={eleList}
          renderItem={(item) => (
            <List.Item>
              <h3 style={{ fontWeight: 'bold' }}>{item.name}</h3>
              <ProFormCheckbox.Group
                name="checkbox-group"
                options={item.children.map((i: any) => i.name)}
              />
            </List.Item>
          )}
        />
      </ProFormItem>
    </DrawerForm>
  );
};

export default BatchAuthForm;
