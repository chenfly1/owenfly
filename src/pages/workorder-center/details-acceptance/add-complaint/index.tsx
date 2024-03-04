import React, { useEffect, useState, useRef } from 'react';

import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { ProFormTextArea } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components'; // 引入 ProFormInstance 接口类型
import { allUse, operationWorkOrder } from '@/services/workorder';

import { Select, Space, message, SelectProps } from 'antd';
import styles from './style.less';
import { storageSy } from '@/utils/Setting';
import { useHistory } from 'react-router';

import { NoticeBoxType } from '@/components/NoticeBox/config';
import { useModel } from 'umi';
type IProps = {
  modalVisit: boolean; // 是否访问 modal 的开关
  onSubmit: () => void; // 表单提交函数
  onOpenChange: (open: boolean) => void; // modal 状态变更函数
  data: any; // 表单数据
};

const Addcomplaint: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props; // 从 props 中解构 modalVisit、onOpenChange、onSubmit 和 data 函数
  const [selectValue, setSelectValue] = useState<string[]>([]); // 增加人员状态
  const [selectLabel, setSelectLabel] = useState<string[]>([]); // 增加人员状态
  const formRef = useRef<ProFormInstance>(); // 创建一个表单引用对象
  const [dataSource, setDataSource] = useState<any>();
  const history = useHistory();
  const { noticeList, setNoticeList, todoList, updateSource } = useModel('useNotice');

  // 人员选择

  const handleChange = (value: string | string[]) => {
    // 获取选中项的label和value
    const selectedOptions = dataSource.filter((option: { value: string }) =>
      value.includes(option.value),
    );

    selectedOptions.forEach((option: { label: any; value: any }) => {
      setSelectValue(option.value);
      setSelectLabel(option.label);
    });
  };
  // 人员选择end

  // 定义 onFinish 函数
  const onFinish = async (values: Record<string, any>) => {
    // 打印 values

    const res = await operationWorkOrder({
      workorderId: data.id,
      description: values.description,
      // attachments: objectId,
      nextHandlerBid: selectValue,
      nextHandlerName: selectLabel,
      status: 3,
    });
    if (res.code === 'SUCCESS') {
      onOpenChange(false);
      message.success('操作成功');
      updateSource(NoticeBoxType.todo);

      history.push('/workorder-center/list');
    }
  };

  //查询项目下的所有账号信息
  const getAllUse = async (id: string) => {
    const msg = await allUse({
      projectBid: id,
    });
    if (msg.code === 'SUCCESS') {
      const res = msg.data;
      res.forEach(
        (item: {
          name: string | number;
          userBid: string | number;
          label: number | string;
          value: number | string;
        }) => {
          item.label = item.name;
          item.value = item.userBid;
        },
      );

      setDataSource(res);
    }
    console.log('查询项目下的所有账号信息', msg.data);
  };

  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    getAllUse(project?.bid);

    console.log('data', data);
  }, [modalVisit]);

  return (
    <ModalForm
      colon={false}
      formRef={formRef}
      width={994}
      onOpenChange={onOpenChange} // 打开或关闭抽屉式表单时的回调函数
      title="工单转办" // 抽屉式表单标题
      layout="horizontal" // 表单布局方式
      open={modalVisit} // 抽屉式表单是否打开
      onFinish={onFinish} // 表单提交时的回调函数
    >
      <ProFormTextArea
        name="description"
        label="转办说明"
        rules={[{ required: true, message: '请输入处理说明' }]}
        fieldProps={{
          maxLength: 100,
          showCount: true,
          rows: 4,
          style: { width: '587px', marginBottom: '45px' },
        }}
      />

      <div className={styles.SpaceStyle}>
        <span>转办人</span>
        <Space direction="vertical">
          <Select
            placeholder="请选择转办人"
            onChange={handleChange}
            style={{ width: '587px', display: 'inline-block', marginLeft: '11px' }}
            options={dataSource}
          />
        </Space>
      </div>
    </ModalForm>
  );
};

export default Addcomplaint;
