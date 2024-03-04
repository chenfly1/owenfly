import {
  DrawerForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProFormCascader,
} from '@ant-design/pro-components'; // 从 ant-design/pro-components 引入组件
import type { ProFormInstance } from '@ant-design/pro-components'; // 引入 ProFormInstance 接口类型
import { useEffect, useRef, useState } from 'react'; // 引入 React 中的 useEffect、useRef 和 useState 钩子函数
import { Upload, message } from 'antd'; // 引入 antd 的 message 组件
import { CloudUploadOutlined } from '@ant-design/icons';
import { addWorkOrder, ticketType } from '@/services/workorder';
import { useModel } from 'umi';

import { Method } from '@/utils';
import { workordeLib } from '@/components/FileUpload/business';
import { getUserInfo } from '@/services/app';
import { NoticeBoxType } from '@/components/NoticeBox/config';
/* eslint-disable react-hooks/rules-of-hooks */
type IProps = {
  modalVisit: boolean; // 是否访问 modal 的开关
  onSubmit: () => void; // 表单提交函数
  onOpenChange: (open: boolean) => void; // modal 状态变更函数
  data: any; // 表单数据
};

// 树结构选择
const transformData = (data: any) => {
  return data.map((item: { id: number; name: string; childList: any }) => ({
    value: item.id,
    label: item.name,
    children: item.childList ? transformData(item.childList) : undefined,
  }));
};

// 树结构选择end

const AddModelForm: React.FC<IProps> = (props) => {
  // 声明 AddModelForm 组件，props 是组件传入的参数对象
  const { modalVisit, onOpenChange, onSubmit, data } = props; // 从 props 中解构 modalVisit、onOpenChange、onSubmit 和 data 函数
  const formRef = useRef<ProFormInstance>(); // 创建一个表单引用对象
  const { noticeList, setNoticeList, todoList, updateSource } = useModel('useNotice');

  const [cascaderOptions, setCascaderOptions] = useState<Category>();
  const [categoryId, setCategoryId] = useState<number | string>();
  const [categoryNmae, setCategoryName] = useState<string>();
  const [objectId, setObjectId] = useState<string>('');
  const [userID, setUserID] = useState<UserInfo>();

  //树结构选择器

  const fetchCascaderOptions = async () => {
    try {
      const msg = await ticketType({
        parentId: 0,
      });
      const transformedData = transformData(msg.data);
      setCascaderOptions(transformedData);
    } catch (error) {}
  };

  // 获取当前用户
  const useID = async () => {
    const userInfoRes = await getUserInfo();
    setUserID(userInfoRes.data);
    console.log('当前用户:', userInfoRes.data);
  };
  useEffect(() => {
    fetchCascaderOptions();
    useID();
    return () => {
      // 组件销毁时重置表单字段
      setObjectId('');
      formRef?.current?.resetFields();
    };
  }, [modalVisit]); // useEffect hook监听的依赖是modalVisit，即模态框是否打开
  // 定义 onFinish 函数
  const onFinish = async (values: Record<string, any>) => {
    const hash = window.location.hash;
    const param = hash.substring(1);
    console.log('hash', param);

    const res = await addWorkOrder({
      presenterName: values.presenterName,
      presenterPhone: values.presenterPhone,
      categoryId: categoryId, //工单类型ID
      categoryName: categoryNmae, //工单类型名称
      location: values.location,
      attachments: objectId,
      description: values.description,
      source: 3,
      projectId: param,
    });
    if (res.code === 'SUCCESS') {
      onSubmit();
      onOpenChange(false);
      message.success('操作成功');
      updateSource(NoticeBoxType.todo);
    }
  };

  //图片格式
  const beforeUpload = (file: any) => {
    // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
    const isFormat =
      file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
    // 校验图片大小
    const is5M = file.size / 1024 / 1024 < 5;

    if (!isFormat) {
      message.error('仅支持jpg，jpeg，png格式的图片');
      return Upload.LIST_IGNORE;
    } else if (!is5M) {
      message.error('图片不能超过5M,请重新选择图片');
      return Upload.LIST_IGNORE;
    }
    // else {
    //   // 检查文件是否已存在
    //   const isDuplicate = uploadedFiles.some((uploadedFile) => uploadedFile.name === file.name);
    //   if (isDuplicate) {
    //     message.error('请勿上传相同的文件');
    //     return Upload.LIST_IGNORE;
    //   }
    //   // 允许文件上传
    //   return file;
    // }
  };

  //  //图片格式end

  return (
    <DrawerForm // 抽屉式表单
      colon={false} // 是否显示冒号
      formRef={formRef} // 表单引用
      labelCol={{
        // 标签布局
        flex: '130px', // 标签宽度
      }}
      onOpenChange={onOpenChange} // 打开或关闭抽屉式表单时的回调函数
      title="新建工单" // 抽屉式表单标题
      layout="horizontal" // 表单布局方式
      width={560} // 抽屉式表单宽度
      open={modalVisit} // 抽屉式表单是否打开
      onFinish={onFinish} // 表单提交时的回调函数
    >
      <ProFormCascader
        name="categoryId"
        label="工单类型"
        rules={[{ required: true, message: '请输入工单类型' }]}
        fieldProps={{
          expandTrigger: 'hover',
          changeOnSelect: true,
          options: cascaderOptions as any,
          onChange: (value: any, selectedOptions: any) => {
            if (selectedOptions && selectedOptions.length) {
              const selectedLabels = selectedOptions
                .map((option: CascaderOption) => option.label)
                .join('-');
              setCategoryName(selectedLabels);
              setCategoryId(value[value.length - 1]);
            }
          },
        }}
      />

      <ProFormText // 多行文本输入框组件
        name="presenterName" // 表单字段名
        label="报单人姓名" // 表单字段标签
        rules={[{ required: true, message: '请输入报单人姓名' }]}
        initialValue={userID?.userName}
        disabled={true}
      />

      <ProFormText // 多行文本输入框组件
        name="presenterPhone" // 表单字段名
        label="报单人联系方式" // 表单字段标签
        rules={[
          { required: true, message: '请输入报单人联系方式' },
          {
            pattern: /^1[0-9]{10}$/,
            message: '请输入正确的手机号码',
          },
        ]}
        initialValue={userID?.mobile}
      />
      <ProFormText // 多行文本输入框组件
        name="location" // 表单字段名
        label="工单位置" // 表单字段标签
        rules={[{ required: true, message: '请输入工单位置' }]}
        fieldProps={{
          maxLength: 15,
          showCount: true,
        }}
      />
      <ProFormTextArea
        name="description"
        label="工单详情"
        rules={[{ required: true, message: '请输入工单详情' }]}
        fieldProps={{
          maxLength: 100,
          showCount: true,
          rows: 4,
        }}
        placeholder="请输入情况描述，100个字符以内"
      />

      <ProFormUploadButton
        label="上传图片"
        max={3}
        name="attachments"
        icon={<CloudUploadOutlined />}
        extra="最多添加3张图片。"
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          maxCount: 3,
          beforeUpload: beforeUpload,
          accept: 'image/*',
          customRequest: async (options: any) => {
            const { onSuccess, file } = options;
            Method.uploadFile(file, workordeLib).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setObjectId((prevObjectId) => (prevObjectId ? `${prevObjectId},${url}` : url));
              console.log('setObjectId', objectId);
              onSuccess(_response, file);
            });
          },
          onRemove: (file: any) => {
            const res = file.response.path;
            const dataArray = objectId.split(',');
            const indexToRemove = dataArray.indexOf(res);
            if (indexToRemove !== -1) {
              dataArray.splice(indexToRemove, 1);
            }
            const updatedData = dataArray.join(',');
            setObjectId(updatedData);

            console.log('处理后', updatedData);
          },
        }}
      />
    </DrawerForm>
  );
};

export default AddModelForm;
