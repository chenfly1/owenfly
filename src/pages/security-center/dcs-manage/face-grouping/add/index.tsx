import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import Upload from 'antd/es/upload';
import { ProFormItem } from '@ant-design/pro-form';
import FileUpload from '@/components/FileUpload';
import { monitorBusiness } from '@/components/FileUpload/business';
import styles from '../style.less';
import { Method } from '@/utils';
import { addFaceInfo, getFaceInfoDetail, updateFaceInfo } from '@/services/monitor';

type Iprops = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
  readonly: boolean;
};

const Add: React.FC<Iprops> = ({ open, onOpenChange, data, onSubmit, readonly, ...rest }) => {
  const id = data?.id;
  const formRef = useRef<ProFormInstance>();
  const projectUid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;
  const [title, setTitle] = useState<string>('新增');
  const [objectId, setObjectId] = useState<string>();

  const onFinish = async (formData: Record<string, any>) => {
    const params: Record<string, any> = {
      faceGroupId: data?.faceGroupId,
      projectUid: projectUid,
      name: formData.name,
      phone: formData.phone,
      sex: formData.sex,
      idCard: formData.idCard,
      faceUrl: objectId,
    };
    let res: Record<string, any> = {};
    if (id) {
      params.id = id;
      res = await updateFaceInfo(params);
    } else {
      res = await addFaceInfo(params as DoorUserListType);
    }
    if (res.code === 'SUCCESS') {
      message.success(id ? '更新成功' : '新增成功');
      onSubmit();
      return true;
    }
    return false;
  };
  const beforeUpload = async (file: any) => {
    // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
    const isFormat = file.type === 'image/jpg' || file.type === 'image/jpeg';
    if (!isFormat) {
      message.error('仅支持jpg，jpeg格式的图片');
      return Upload.LIST_IGNORE;
    }
    const newImg = await Method.compressorImageBySize(file, 200);
    console.log(`压缩后`, `${newImg.size / 1024}kb`);
    return Promise.resolve(newImg);
  };
  useEffect(() => {
    if (open) {
      setObjectId('');
      setTitle('新增人脸');
      formRef?.current?.resetFields();
      if (id) {
        setTitle('编辑人脸');
        getFaceInfoDetail({ id }).then(async (res) => {
          const resData = res?.data || {};
          formRef?.current?.setFieldsValue({
            ...resData,
            faceUrl: [],
          });
          if (resData.faceUrl) {
            formRef?.current?.setFieldsValue({
              faceUrl: [
                {
                  url: resData.faceUrl,
                },
              ],
            });
            setObjectId(resData.faceUri);
          }
        });
      }
    }
  }, [open]);
  let imageUploadNode;
  const fileUploadNode = (
    <ProFormItem
      name="faceUrl"
      label="人脸照片"
      valuePropName="fileList"
      rules={[{ required: true }]}
      extra="请上传带有正面人脸的照片，以正面免冠照为佳,支持jpg，jpeg格式文件，图片文件大小 10 KB- 200 KB"
      getValueFromEvent={(e: any) => {
        return e?.fileList;
      }}
    >
      <FileUpload
        buttonText="上传图片"
        fileType="avatar"
        listType="picture-card"
        beforeUpload={beforeUpload}
        customRequest={async (options: any) => {
          const { onSuccess, file } = options;
          Method.uploadFile(file, monitorBusiness).then((url: any) => {
            const _response = { name: file.name, status: 'done', path: url };
            setObjectId(url);
            onSuccess(_response, file);
          });
        }}
        onRemove={() => {
          setObjectId('');
        }}
        business={monitorBusiness}
      />
    </ProFormItem>
  );
  if (readonly) {
    if (objectId) {
      imageUploadNode = fileUploadNode;
    } else {
      imageUploadNode = (
        <ProFormItem name="faceUrl" label="人脸照片" valuePropName="fileList">
          -
        </ProFormItem>
      );
    }
  } else {
    imageUploadNode = fileUploadNode;
  }
  return (
    <DrawerForm
      colon={false}
      className={styles.uniAuthAddModal}
      {...rest}
      readonly={readonly}
      formRef={formRef}
      labelCol={{ flex: '120px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      title={title}
      open={open}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="姓名"
        width="md"
        placeholder="请输入姓名"
        rules={[{ required: true }]}
        fieldProps={{ maxLength: 20, showCount: true }}
      />
      <ProFormSelect
        name="sex"
        label="性别"
        width="md"
        request={async () => [
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ]}
        placeholder="请选择"
      />
      <ProFormText
        name="idCard"
        label="证件号码"
        validateTrigger="onBlur"
        width="md"
        placeholder={'请输入证件号码'}
        rules={[
          // {
          //   required: true,
          //   message: '请输入证件号码',
          // },
          {
            pattern:
              /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
            message: '证件号码格式错误',
          },
        ]}
      />
      <ProFormText
        name="phone"
        label="手机号码"
        validateTrigger="onBlur"
        width="md"
        placeholder={'请输入手机号'}
        rules={[
          // {
          //   required: true,
          //   message: '请输入手机号',
          // },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: '手机号格式错误',
          },
        ]}
      />
      {imageUploadNode}
    </DrawerForm>
  );
};

export default Add;
