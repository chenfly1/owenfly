import { workordeLib } from '@/components/FileUpload/business';
import { operationWorkOrder } from '@/services/workorder';
import { Method } from '@/utils';
import { CloudUploadOutlined } from '@ant-design/icons';
import { DrawerForm, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-components'; // 从 ant-design/pro-components 引入组件
import type { ProFormInstance } from '@ant-design/pro-components'; // 引入 ProFormInstance 接口类型
import { Upload, message } from 'antd';
import { useEffect, useRef, useState } from 'react'; // 引入 React 中的 useEffect、useRef 和 useState 钩子函数
import { NoticeBoxType } from '@/components/NoticeBox/config';
import { useModel } from 'umi';
type IProps = {
  modalVisit: boolean; // 是否访问 modal 的开关
  onSubmit: () => void; // 表单提交函数
  onOpenChange: (open: boolean) => void; // modal 状态变更函数
  data: any; // 表单数据
  titleA: string;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data, titleA } = props;
  const formRef = useRef<ProFormInstance>();
  const [objectId, setObjectId] = useState<string>('');
  const { noticeList, setNoticeList, todoList, updateSource } = useModel('useNotice');
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
  };

  //  //图片格式end

  useEffect(() => {
    setObjectId('');
    return () => {
      // 组件销毁时重置表单字段
      formRef?.current?.resetFields();
    };
  }, [modalVisit]);

  // 定义 onFinish 函数
  const onFinish = async (values: Record<string, any>) => {
    // 打印 values
    if (titleA === '工单取消') {
      //取消
      const res = await operationWorkOrder({
        workorderId: data.id,
        description: values.description,
        attachments: objectId,
        status: 5,
      });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        message.success('操作成功');
      }
    } else if (titleA === '工单受理') {
      //处理中
      const res = await operationWorkOrder({
        workorderId: data.id,
        description: values.description,
        attachments: objectId,
        status: 2,
      });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        message.success('操作成功');
      }
    } else if (titleA === '工单完成') {
      //工单完成
      const res = await operationWorkOrder({
        workorderId: data.id,
        description: values.description,
        attachments: objectId,
        status: 4,
      });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        message.success('操作成功');
      }
    }
    updateSource(NoticeBoxType.todo);
  };
  return (
    <DrawerForm // 抽屉式表单
      colon={false} // 是否显示冒号
      formRef={formRef} // 表单引用
      labelCol={{
        // 标签布局
        flex: '130px',
      }}
      onOpenChange={onOpenChange}
      title={titleA}
      layout="horizontal"
      width={560}
      open={modalVisit}
      onFinish={onFinish}
    >
      <ProFormTextArea
        name="description"
        label={titleA === '工单取消' ? '取消说明' : titleA === '工单完成' ? '完成说明' : '处理说明'}
        rules={[{ required: true, message: '请输入' }]}
        fieldProps={{
          maxLength: 100,
          showCount: true,
          rows: 4,
        }}
        // placeholder="请输入情况描述，100个字符以内"
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
      {/* <p>{objectId}</p> */}
    </DrawerForm>
  );
};

export default AddModelForm;
