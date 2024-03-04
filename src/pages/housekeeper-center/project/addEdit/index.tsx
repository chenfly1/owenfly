import { DrawerForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Form, Input, Radio, Select, SelectProps, message } from 'antd';
import { batchSteward, butlerSave, detailedSteward } from '@/services/housekeeper';
import { getQueryStaff, getStaffDetails } from '@/services/base';
import React from 'react';

type IProps = {
  modalVisit: boolean; // 是否访问 modal 的开关
  onSubmit: () => void; // 表单提交函数
  onOpenChange: (open: boolean) => void; // modal 状态变更函数
  data: any; // 表单数据
  addData: any; // 表单数据
};

let timeout: ReturnType<typeof setTimeout> | null;
let currentValue: string;

const AddModelForm: React.FC<IProps> = (props) => {
  // 声明 AddModelForm 组件，props 是组件传入的参数对象
  const { modalVisit, onOpenChange, onSubmit, data, addData } = props; // 从 props 中解构 modalVisit、onOpenChange、onSubmit 和 data 函数
  const formRef = useRef<ProFormInstance>(); // 创建一个表单引用对象
  const fetch = (value: string, callback: Function) => {
    console.log('value', value);
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    const fetchData = async () => {
      try {
        const response = await getQueryStaff({
          pageNo: 1,
          projectId: data?.projectBid,
          pageSize: 1000,
          name: `${value}`,
        });
        console.log('response', response);
        const dataA = response.data.items;

        if (currentValue === value) {
          const formattedData = dataA.map((item: any) => ({
            value: item.name,
            label: item.id,
          }));
          callback(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    timeout = setTimeout(fetchData, 300);
  };
  // 单选
  const [valueRadio, setValueRadio] = useState<string>('b');
  const [valueRadioA, setValueRadioA] = useState<number>();

  const [dataA, setData] = useState<SelectProps['options']>([]);
  const [value, setValue] = useState<string>();
  const [staff, setStaff] = useState<any>({});
  const [useId, setuseId] = useState<any>('');
  const [radioShow, setRadioShow] = useState<boolean>();
  const [form] = Form.useForm();
  const [formA] = Form.useForm();
  const handleSearch = (newValue: string) => {
    if (newValue) {
      fetch(newValue, setData);
    } else {
      setData([]);
    }
  };

  const handleChange = async (newValue: string) => {
    setValue(newValue);
    const filteredData = dataA?.filter((item) => item.value === newValue);

    setuseId(filteredData?.[0]?.label);
    const res = await getStaffDetails(`${filteredData?.[0]?.label}`);
    setStaff(res.data);
    form.setFieldsValue({
      phone1: res?.data?.mobile,
    });
    formA.setFieldsValue({
      sex1: res?.data?.sexStr,
    });
  };

  // 添加管家方式
  const onChange = (e: any) => {
    // console.log('radio checked', e.target.value);
    setValueRadio(e.target.value);
    setStaff({});
    formRef?.current?.resetFields();
  };

  // 表单提交
  const onFinish = async (values: Record<string, any>) => {
    console.log('提交:', values);

    if (valueRadio === 'a') {
      if (Array.isArray(data)) {
        //批量
        const bidArrs = data.map((item) => item.projectBid);
        const ids = data.map((item: { id: any }) => item.id);
        const res = await batchSteward({
          name: values?.name1,
          phone: values?.phone1,
          sex: staff?.sex === 2 ? 0 : 1,
          mode: 1,
          type: 1,
          ids: ids,
          staffIds: useId,
          projectBids: bidArrs,
        });
        if (res.code === 'SUCCESS') {
          onSubmit();
          onOpenChange(false);
          formRef?.current?.resetFields();
          message.success('操作成功');
        }
      } else {
        //单个
        const res = await butlerSave({
          name: values?.name1,
          phone: values?.phone1,
          sex: staff?.sex === 2 ? 0 : 1,
          mode: 1,
          id: data.id,
          staffId: useId,
          type: 1,
          projectBid: data.projectBid,
        });
        if (res.code === 'SUCCESS') {
          onSubmit();
          onOpenChange(false);
          formRef?.current?.resetFields();
          message.success('操作成功');
        }
      }
    } else if (valueRadio === 'b') {
      // console.log("values", data);
      // mode 添加方式：0手动添加 1选择员工

      if (Array.isArray(data)) {
        //批量
        const ids = data.map((item: { id: any }) => item.id);
        const bidArrs = data.map((item) => item.projectBid);
        const res = await batchSteward({
          name: values.name,
          phone: values.phone,
          sex: values.sex === '男' ? 1 : values.sex === '女' ? 0 : values.sex,
          type: 1,
          ids: ids,
          mode: 0,
          projectBids: bidArrs,
        });
        if (res.code === 'SUCCESS') {
          onSubmit();
          onOpenChange(false);
          formRef?.current?.resetFields();
          message.success('操作成功');
        }
      } else {
        //单个
        const res = await butlerSave({
          name: values.name,
          phone: values.phone,
          sex: values.sex === '男' ? 1 : values.sex === '女' ? 0 : values.sex,
          mode: 0,
          type: 1,
          id: data.id,

          projectBid: data.projectBid,
        });
        if (res.code === 'SUCCESS') {
          onSubmit();
          onOpenChange(false);
          formRef?.current?.resetFields();
          message.success('操作成功');
          formA.resetFields();
          form.resetFields();
        }
      }
    }
  };

  const toSwitch = () => {
    const param = sessionStorage.getItem('newData');
    if (param !== null) {
      const original = JSON.parse(param);
      if (Array.isArray(data)) {
        if (data[0]?.mode === '0') {
          setValueRadio('b');
          setValueRadioA(2);
          form.setFieldsValue({
            name: original[0]?.name,
            phone: original[0]?.phone,
            sex: original[0]?.sex,
          });
        } else {
          // setValueRadio('a');
          setValueRadio('b');
          setValueRadioA(2);
          form.setFieldsValue({
            name: original[0]?.name,
            phone: original[0]?.phone,
            sex: original[0]?.sex,
          });
          // setValueRadioA(3);
        }
      } else {
        if (data?.mode === '0') {
          setValueRadio('b');
          setValueRadioA(0);
          form.setFieldsValue({
            name: original?.name,
            phone: original?.phone,
            sex: original?.sex,
          });
        } else {
          setValueRadio('a');
          // setValueRadio('b');
          setValueRadioA(1);
          // setValueRadioA(0);
          form.setFieldsValue({
            name1: original?.name,
            phone1: original?.phone,
          });
          formA.setFieldsValue({
            sex1: original?.sex,
          });
        }
      }
    }
  };

  useEffect(() => {
    toSwitch();

    if (Array.isArray(data)) {
      setRadioShow(true);
    } else {
      setRadioShow(false);
    }
    console.log('行数据', data);

    return () => {
      setStaff({});
      formA.resetFields();
      form.resetFields();
      formRef?.current?.resetFields();
    };
  }, [modalVisit]);
  return (
    <DrawerForm
      colon={true}
      formRef={formRef}
      labelCol={{
        flex: '130px',
      }}
      onOpenChange={onOpenChange}
      title="编辑项目管家 "
      layout="horizontal"
      width={560}
      open={modalVisit}
      onFinish={onFinish}
      form={form}
    >
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ marginLeft: '-60px' }}
      >
        <Form.Item label="当前项目" name="projectName">
          {Array.isArray(data) ? (
            <span>
              {data
                .filter((item) => item.projectName)
                .map((item) => item.projectName)
                .join('、')}
            </span>
          ) : (
            <span>{data?.projectName ? data.projectName : ''}</span>
          )}
        </Form.Item>

        <Form.Item
          label="添加管家方式"
          name="butlerWay"
          rules={[{ required: true, message: '请选择添加管家方式' }]}
        >
          <Radio.Group value={valueRadio} onChange={onChange}>
            <Radio value="a" disabled={radioShow}>
              从员工表选择
            </Radio>
            <Radio value="b">自定义管家</Radio>
          </Radio.Group>
          <span />
        </Form.Item>
      </Form>

      {valueRadio === 'a' ? (
        <>
          <Form.Item
            label="选择管家"
            name="name1"
            rules={[{ required: true, message: '请选择管家' }]}

            // initialValue={
            //   valueRadioA === 1 ? data?.name : valueRadioA === 3 ? data[0]?.name : undefined
            // }
          >
            <Select
              showSearch
              value={value}
              placeholder="请选择"
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={handleSearch}
              onChange={handleChange}
              notFoundContent={null}
              style={{ width: '220px' }}
              options={(dataA || []).map((d) => ({
                value: d.value,
                label: d.text,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="管家联系方式"
            name="phone1"
            // initialValue={
            //   valueRadioA === 1 ? data?.phone : valueRadioA === 3 ? data[0]?.phone : undefined
            // }
            rules={[
              { required: true, message: '请输入联系方式' },
              {
                pattern: /^(\d{7,8}|\d{11})$|^1\d{10}$/,
                message: '请输入正确的座机号或手机号码',
              },
            ]}
          >
            <Input placeholder="请输入手机号/座机号" allowClear={true} />
          </Form.Item>

          <Form
            disabled
            form={formA}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ marginLeft: '-60px' }}
          >
            <Form.Item
              label="管家性别"
              name="sex1"
              // initialValue={
              //   valueRadioA === 1 && !staff?.sexStr
              //     ? data?.sex === 1
              //       ? '男'
              //       : data?.sex === 0
              //         ? '女'
              //         : undefined
              //     : valueRadioA === 3 && !staff?.sexStr
              //       ? data[0]?.sex === 1
              //         ? '男'
              //         : data[0]?.sex === 0
              //           ? '女'
              //           : undefined
              //       : staff?.sexStr
              // }
              rules={[{ required: true, message: '请选择管家性别' }]}
            >
              <Select
                showSearch
                placeholder="请选择"
                optionFilterProp="children"
                allowClear={true}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  {
                    value: 1,
                    label: '男',
                  },
                  {
                    value: 0,
                    label: '女',
                  },
                ]}
              />
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          <Form.Item
            label="选择管家"
            name="name"
            rules={[{ required: true, message: '请输入管家' }]}

            // initialValue={
            //   valueRadioA === 0 ? data?.name : valueRadioA === 2 ? data[0]?.name : undefined
            // }
          >
            <Input
              placeholder="管家名称将展示给业主，请谨慎填写"
              maxLength={8}
              showCount
              allowClear={true}
            />
          </Form.Item>
          <Form.Item
            label="管家联系方式"
            name="phone"
            // initialValue={valueRadioA === 0 ? data?.phone : undefined}
            // initialValue={
            //   valueRadioA === 0 ? data?.phone : valueRadioA === 2 ? data[0]?.phone : undefined
            // }
            rules={[
              { required: true, message: '请输入联系方式' },
              {
                pattern: /^(\d{7,8}|\d{11})$|^1\d{10}$/,
                message: '请输入正确的座机号或手机号码',
              },
            ]}
          >
            <Input placeholder="请输入手机号/座机号" allowClear={true} />
          </Form.Item>

          <Form.Item
            label="管家性别"
            name="sex"
            // initialValue={
            //   valueRadioA === 0 && !staff?.sexStr
            //     ? data?.sex === 1
            //       ? '男'
            //       : data?.sex === 0
            //         ? '女'
            //         : undefined
            //     : valueRadioA === 2 && !staff?.sexStr
            //       ? data[0]?.sex === 1
            //         ? '男'
            //         : data[0]?.sex === 0
            //           ? '女'
            //           : undefined
            //       : staff?.sexStr
            // }
            rules={[{ required: true, message: '请选择管家性别' }]}
          >
            <Select
              showSearch
              placeholder="请选择"
              optionFilterProp="children"
              allowClear={true}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                {
                  value: 1,
                  label: '男',
                },
                {
                  value: 0,
                  label: '女',
                },
              ]}
            />
          </Form.Item>
        </>
      )}
    </DrawerForm>
  );
};

export default AddModelForm;
