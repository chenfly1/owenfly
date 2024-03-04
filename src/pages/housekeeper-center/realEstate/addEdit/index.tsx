/* eslint-disable @typescript-eslint/no-shadow */
import { DrawerForm } from '@ant-design/pro-components'; // 从 ant-design/pro-components 引入组件
import type { ProFormInstance } from '@ant-design/pro-components'; // 引入 ProFormInstance 接口类型
import { useEffect, useRef, useState } from 'react'; // 引入 React 中的 useEffect、useRef 和 useState 钩子函数
import { Form, Input, Radio, RadioChangeEvent, Select, message } from 'antd'; // 引入 antd 的 message 组件

import { batchSteward, butlerSave } from '@/services/housekeeper';

import type { SelectProps } from 'antd';
import { getQueryStaff, getStaffDetails } from '@/services/base';
import { storageSy } from '@/utils/Setting';
import { getPhysicalSpaceTree } from '../service';
import { displayName } from 'react-quill';

type IProps = {
  modalVisit: boolean; // 是否访问 modal 的开关
  onSubmit: () => void; // 表单提交函数
  onOpenChange: (open: boolean) => void; // modal 状态变更函数
  data: any; // 表单数据
  addData: any; // 表单数据
};

let timeout: ReturnType<typeof setTimeout> | null;
let currentValue: string;

interface Node {
  title: string;
  key: any;
  parentId: string | number;
  spaceType: string;
  children?: Node[];
}
const findTitleByKey = (key: any, data: Node[]): Node | null => {
  for (const item of data) {
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      const result = findTitleByKey(key, item.children);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const findTopLevelTitleByKey = (key: any, data: Node[]): string | null => {
  let node = findTitleByKey(key, data);
  while (node && node.parentId !== 0) {
    node = findTitleByKey(node.parentId + '', data);
  }
  return node ? node.title : null;
};
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
          pageSize: 1000,
          projectId: addData,
          name: `${value}`,
        });
        console.log('response', response);
        const data = response.data.items;

        if (currentValue === value) {
          const formattedData = data.map((item: any) => ({
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
  const [valueRadio, setValueRadio] = useState<string>('a');

  const [projectBidA, setProjectBidA] = useState<string>('');

  const [dataA, setData] = useState<SelectProps['options']>([]);
  const [value, setValue] = useState<string>();
  const [staff, setStaff] = useState<any>({});
  const [useId, setuseId] = useState<any>('');
  const [cascaderOptions, setCascaderOptions] = useState<any>();
  const [title, setTitle] = useState<any>('');
  const [projectBid, setProjectBid] = useState<string>('');
  const [valueRadioA, setValueRadioA] = useState<number>();
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
    console.log('点击', res.data);
    form.setFieldsValue({
      phone: res?.data?.mobile,
    });
    formA.setFieldsValue({
      sex: res?.data?.sexStr,
    });
  };

  //处理数据
  const appendProperties = (data: any[]) => {
    return data.map((item) => {
      const { name, id, children, ...rest } = item;
      const updatedItem = {
        title: name,
        key: id,
        ...rest,
      };
      if (children && children.length > 0) {
        updatedItem.children = appendProperties(children);
      }
      return updatedItem;
    });
  };
  const titles = () => {
    if (Array.isArray(data)) {
      const title = findTopLevelTitleByKey(data[0]?.spaceId, cascaderOptions);
      setTitle(title);
    } else if (data && data.spaceId) {
      const title = findTopLevelTitleByKey(data.spaceId, cascaderOptions);
      setTitle(title);
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
        } else {
          setValueRadio('a');
          setValueRadioA(3);
          form.setFieldsValue({
            name: original[0]?.name,
            phone: original[0]?.phone,
            sex: original[0]?.sex,
          });
        }
      } else {
        if (data?.mode === '0') {
          setValueRadio('b');
          setValueRadioA(0);
        } else {
          setValueRadio('a');
          setValueRadioA(1);
          form.setFieldsValue({
            name: original?.name,
            phone: original?.phone,
          });
          formA.setFieldsValue({
            sex: original?.sex,
          });
        }
      }
    }
  };

  useEffect(() => {
    toSwitch();

    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    console.log('project', project);
    setProjectBid(project?.bid);
    setProjectBidA(project?.name);
    getPhysicalSpaceTree({
      projectBid: project?.bid,
      // 房产接口
      filterSpaceTypes: [
        'PROJECT',
        'PROJECT_STAGE',
        'BUILDING',
        'UNIT',
        'FLOOR',
        'ROOM',
        'PUBLIC_AREA',
      ],
      // filterSpaceTypes: ["CARPARK", "AREA", "PASSAGE"]
    }).then((res: { code?: any; data?: any }) => {
      if (res.code === 'SUCCESS') {
        const tree = appendProperties(res.data);
        setCascaderOptions(tree);
      }
    });
    titles();
    console.log('data', data);
    return () => {
      setStaff({});
      formRef?.current?.resetFields();
      formA.resetFields();
      form.resetFields();
    };
  }, [modalVisit]);

  // 添加管家方式
  const onChange = (e: any) => {
    // console.log('radio checked', e.target.value);
    setValueRadio(e.target.value);
    setStaff({});
    formRef?.current?.resetFields();
    formA.resetFields();
    form.resetFields();
  };

  // 表单提交
  const onFinish = async (values: Record<string, any>) => {
    // 打印 values
    console.log('values', values);
    console.log('value', value);

    if (valueRadio === 'a') {
      if (Array.isArray(data)) {
        //批量
        const ids = data.map((item) => item.id);
        const spaceIds = data.map((item) => item.spaceId);
        if (value) {
          const res = await batchSteward({
            name: values?.name,
            phone: values?.phone,
            sex: staff?.sex === 2 ? 0 : 1,
            mode: 1,
            type: 2,
            ids: ids,
            staffId: useId,
            // projectBids: bidArrs,
            spaceIds: spaceIds,
          });
          if (res.code === 'SUCCESS') {
            onSubmit();
            onOpenChange(false);
            formRef?.current?.resetFields();
            message.success('操作成功');
          }
        }
      } else {
        //单个
        if (value) {
          const res = await butlerSave({
            name: values?.name,
            phone: values?.phone,
            sex: staff?.sex === 2 ? 0 : 1,
            mode: 1,
            type: 2,
            id: data.id,
            staffId: useId,
            projectBid: data.projectBid,
            spaceId: data.spaceId,
          });
          if (res.code === 'SUCCESS') {
            onSubmit();
            onOpenChange(false);
            formRef?.current?.resetFields();
            message.success('操作成功');
          }
        }
      }
    } else if (valueRadio === 'b') {
      // console.log("values", data);
      // mode 添加方式：0手动添加 1选择员工
      if (Array.isArray(data)) {
        //批量
        const ids = data.map((item) => item.id);
        const spaceIds = data.map((item) => item.spaceId);

        const res = await batchSteward({
          name: values.name,
          phone: values.phone,
          sex: values.sex === '男' ? 1 : values.sex === '女' ? 0 : values.sex,
          mode: 0,
          type: 2,
          ids: ids,
          // projectBids: bidArrs,
          spaceIds: spaceIds,
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
          type: 2,
          id: data.id,

          projectBid: data.projectBid,
          spaceId: data.spaceId,
        });
        if (res.code === 'SUCCESS') {
          onSubmit();
          onOpenChange(false);
          formRef?.current?.resetFields();
          message.success('操作成功');
        }
      }
    }
  };

  return (
    <DrawerForm // 抽屉式表单
      colon={true} // 是否显示冒号
      formRef={formRef} // 表单引用
      labelCol={{
        // 标签布局
        flex: '130px', // 标签宽度
      }}
      onOpenChange={onOpenChange} // 打开或关闭抽屉式表单时的回调函数
      title="编辑房产管家 " // 抽屉式表单标题
      layout="horizontal" // 表单布局方式
      width={560} // 抽屉式表单宽度
      open={modalVisit} // 抽屉式表单是否打开
      onFinish={onFinish} // 表单提交时的回调函数
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
              {projectBidA}（{data.length}）
            </span>
          ) : (
            <span>{projectBidA ? projectBidA : ''}</span>
          )}
        </Form.Item>

        <Form.Item
          label="添加管家方式"
          name="butlerWay"
          rules={[{ required: true, message: '请选择添加管家方式' }]}
        >
          <Radio.Group value={valueRadio} onChange={onChange}>
            <Radio value="a">从员工表选择</Radio>
            <Radio value="b" disabled={true} style={{ display: 'none' }}>
              自定义管家
            </Radio>
          </Radio.Group>
          <span />
        </Form.Item>
      </Form>

      {valueRadio === 'a' ? (
        <>
          <Form.Item
            label="选择管家"
            name="name"
            rules={[{ required: true, message: '请选择管家' }]}
            // initialValue={valueRadioA === 1 ? data?.name : undefined}
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
            name="phone"
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
              name="sex"
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
            // initialValue={valueRadioA === 0 ? data?.name : undefined}
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
