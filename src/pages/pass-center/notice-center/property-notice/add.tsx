import {
  ProFormText,
  ProFormSelect,
  ProFormUploadButton,
  ProFormTextArea,
  ProFormItem,
  // ProFormDateTimeRangePicker,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import Upload from 'antd/es/upload';
import { getAnnouncement, saveAnnouncement } from '@/services/door';
// import dayjs from 'dayjs';
import Method from '@/utils/Method';
import { face } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import OssImage from '@/components/OssImage';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  modalVisit: boolean;
  data: any;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const beforeUpload = (file: any) => {
  // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
  const isFormat = file.type === 'image/png';
  // 校验图片大小
  const is5M = file.size / 1024 / 1024 < 5;

  if (!isFormat) {
    message.error('仅支持png格式的图片');
    return Upload.LIST_IGNORE;
  } else if (!is5M) {
    message.error('图片不能超过5M,请重新选择图片');
    return Upload.LIST_IGNORE;
  } else {
    // 校验图片宽高大小
    const isSize = new Promise((resolve, reject) => {
      const width = 539;
      const height = 404;
      const _URL = window.URL || window.webkitURL;
      const img = new Image();
      img.onload = () => {
        // 限制宽高必须为 18*18 像素
        const valid = img.width == width && img.height == height;
        // // 限制宽高必须为 1:1 比例
        // const valid = img.width == img.height;
        // // 限制必须为竖屏图片(宽必须小于高)
        // const valid = img.width < img.height;
        // // 限制必须为横屏图片(宽必须大于高)
        // const valid = img.width > img.height;
        if (valid) {
          resolve(true);
        } else {
          reject();
        }
      };
      img.src = _URL.createObjectURL(file);
    }).then(
      () => {
        return file;
      },
      () => {
        message.error('请上传539*404的图片');
        return Upload.LIST_IGNORE;
      },
    );
    return isFormat && is5M && isSize;
  }
};

// const disabledDate: any = (current: any) => {
//   return current && current < dayjs().startOf('minute');
// };

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, data, onOpenChange, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [isView, setIsView] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>();

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      setCoverImage('');
      setIsView(false);
      if (data.id) {
        setIsView(true);
        setCoverImage(data.coverImage);
        getAnnouncement(data.id).then(async (res: any) => {
          formRef?.current?.setFieldsValue({
            ...res.data,
            // pushTime: [res.data.authStart, res.data.authEnd],
            coverImage: [],
          });
          if (data.coverImage) {
            const urlRes = await generateGetUrl({
              bussinessId: face.id,
              urlList: [
                {
                  objectId: data.coverImage,
                },
              ],
            });
            const url = urlRes?.data?.urlList[0]?.presignedUrl?.url;
            formRef?.current?.setFieldsValue({
              uri: data.coverImage,
              coverImage: [
                {
                  url,
                },
              ],
            });
          }
        });
      }
    }
  }, [modalVisit]);

  const onFinish = async (values: any) => {
    try {
      values.coverImage = coverImage;
      // values.authStart = values.pushTime[0];
      // values.authEnd = values.pushTime[1];
      // delete values.pushTime;
      const res = await saveAnnouncement(values);
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
      colon={isView}
      title={isView ? '查看公告' : '新增公告'}
      layout="horizontal"
      // disabled={isView}
      readonly={isView}
      width={480}
      labelAlign={isView ? 'left' : 'right'}
      labelCol={{
        flex: isView ? '100px' : '82px',
      }}
      onFinish={onFinish}
      open={modalVisit}
    >
      <ProFormText
        name="name"
        rules={[
          {
            required: !isView,
            message: '请输入公告名称',
          },
        ]}
        fieldProps={{ maxLength: 50 }}
        label="公告名称"
      />
      {/* <ProFormDateTimeRangePicker
        name="pushTime"
        label="有效时间"
        fieldProps={{
          disabledDate,
        }}
        rules={[
          {
            required: true,
            message: '请选择推送时间',
          },
        ]}
        width="lg"
      /> */}
      <ProFormSelect
        label="发送范围"
        name="pushRange"
        rules={[
          {
            required: !isView,
            message: '请选择发送范围',
          },
        ]}
        initialValue={0}
        options={[
          { label: '全部室内机', value: 0 },
          // { label: '中心机', value: 1 },
          // { label: '门口机', value: 2 },
        ]}
      />
      <ProFormItem shouldUpdate hidden={!isView}>
        {(form) => {
          console.log(form);
          const uri = form?.getFieldValue('uri');
          return (
            <ProFormItem label="公告图片" labelCol={{ flex: '112px' }} name="headPortrait">
              <OssImage
                business={face.id}
                objectId={uri}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
      <ProFormUploadButton
        label="公告图片"
        max={1}
        name="coverImage"
        hidden={isView}
        extra="限定尺寸539x404，格式png"
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          maxCount: 1,
          accept: 'image/*',
          beforeUpload: beforeUpload,
          onRemove: () => {
            setCoverImage('');
          },
          customRequest: async (options: any) => {
            const { onSuccess, file } = options;
            Method.uploadFile(file, face).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setCoverImage(url);
              onSuccess(_response, file);
            });
          },
        }}
      />
      <ProFormTextArea
        name="content"
        label="内容"
        fieldProps={{
          maxLength: 300,
          rows: 4,
        }}
        placeholder="请输入公告内容"
      />
    </DrawerForm>
  );
};

export default AddModelForm;
