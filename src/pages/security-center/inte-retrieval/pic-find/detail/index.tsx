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
import { getFaceInfoDetail } from '@/services/monitor';

type Iprops = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  readonly: boolean;
};

const Add: React.FC<Iprops> = ({ open, onOpenChange, data, readonly, ...rest }) => {
  const id = data?.id;
  const formRef = useRef<ProFormInstance>();
  const projectUid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;
  const [title, setTitle] = useState<string>('新增');
  const [objectId, setObjectId] = useState<string>();

  const beforeUpload = async (file: any) => {
    // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
    const isFormat =
      file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
    if (!isFormat) {
      message.error('仅支持jpg，jpeg，png格式的图片');
      return Upload.LIST_IGNORE;
    }
    const newImg = await Method.compressorImageBySize(file, 200);
    console.log(`压缩后`, `${newImg.size / 1024}kb`);
    return Promise.resolve(newImg);
  };
  useEffect(() => {
    if (open) {
      setObjectId('');
      setTitle('基本信息');
      formRef?.current?.resetFields();
      if (id) {
        formRef?.current?.setFieldsValue({
          ...data,
          faceGroupName: data.faceGroupName,
          departmentName: data.departmentName,
          faceUrl: [
            {
              url: data.faceUrl,
            },
          ],
        });
        setObjectId(data.faceUri);
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
    >
      <FileUpload
        buttonText="上传图片"
        fileType="avatar"
        disabled={readonly}
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
      submitter={false}
    >
      <ProFormText name="faceGroupName" label="所属分组" width="md" placeholder="" />
      <ProFormText name="name" label="姓名" width="md" placeholder="请输入姓名" />
      <ProFormSelect
        name="sex"
        label="性别"
        width="md"
        request={async () => [
          { label: '男', value: 0 },
          { label: '女', value: 1 },
        ]}
        placeholder="请选择"
      />
      <ProFormText name="departmentName" label="所属部门" width="md" placeholder="" />
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
