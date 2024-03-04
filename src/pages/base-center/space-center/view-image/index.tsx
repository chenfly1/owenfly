import FileUpload from '@/components/FileUpload';
import { deviceBusiness, publicMaterialLib } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { batchCreateSpaceV2, createSpace, updateSpace } from '@/services/space';
import { Method } from '@/utils';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { FooterToolbar, ProForm, ProFormRadio, ProFormSwitch } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Button, message, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type Props = {
  treeNode: any;
  onSubmit: () => void;
  onCancel: () => void;
};

const ImageForm: React.FC<Props> = ({ treeNode, onSubmit, onCancel }) => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [objectId, setObjectId] = useState<string>();

  const onFinish = async (formData: any) => {
    console.log('formData', formData);

    const params = {
      id: treeNode.id,
      spaceType: treeNode.spaceType,
      name: treeNode.rowName,
      spaceImgUrl: objectId,
      parentId: treeNode.parentId,
      projectBid: project.bid,
    };

    console.log('params', params);
    const msg = await updateSpace(params);
    if (msg.code === 'SUCCESS') {
      message.success('编辑成功');
      onSubmit();
    }
  };

  const reset = () => {
    formRef?.current?.resetFields();
  };

  const getImageUrl = async () => {
    const res = await generateGetUrl({
      bussinessId: 'alita_device',
      urlList: [
        {
          objectId: treeNode?.spaceImgUrl,
        },
      ],
    });
    if (res?.data?.urlList[0]?.objectId) {
      formRef.current?.setFieldsValue({
        labels: [{ url: res?.data?.urlList[0]?.presignedUrl?.url }],
      });
    }
  };

  useEffect(() => {
    console.log('treeNode?.spaceImgUrl', treeNode?.spaceImgUrl);
    reset();
    getImageUrl();
  }, [treeNode]);

  return (
    <ProForm
      onFinish={onFinish}
      formRef={formRef}
      layout={'horizontal'}
      labelCol={{ span: 3 }}
      submitter={{
        render: () => (
          <FooterToolbar>
            <Button
              onClick={() => {
                onCancel();
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              确定
            </Button>
          </FooterToolbar>
        ),
      }}
    >
      <ProFormItem
        name="labels"
        label="平面图"
        valuePropName="fileList"
        extra="仅支持png，jpeg，jpg格式，20M以内"
        getValueFromEvent={(e: any) => {
          const file = e.file;
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng && file.status === 'uploading') {
            message.error('仅支持jpg，jpeg，png格式的图片');
          }
          const isLt10M = file.size && file.size / 1024 / 1024 < 20;
          if (!isLt10M && file.status === 'uploading') {
            message.error('图片不能超过20M,请重新选择图片');
          }
          if (isJpgOrPng && isJpgOrPng) {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }
        }}
      >
        <FileUpload
          buttonText="上传图片"
          fileType="image"
          listType="picture-card"
          beforeUpload={async (file: any) => {
            // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
            const isFormat =
              file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
            // 校验图片大小
            const is20M = file.size / 1024 / 1024 < 20;
            if (!isFormat) {
              message.error('仅支持jpg，jpeg，png格式的图片');
              return Upload.LIST_IGNORE;
            } else if (!is20M) {
              message.error('图片不能超过5M,请重新选择图片');
              return Upload.LIST_IGNORE;
            }
            return isFormat && is20M;
          }}
          customRequest={async (options: any) => {
            const { onSuccess, file } = options;
            Method.uploadFile(file, deviceBusiness).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setObjectId(url);
              onSuccess(_response, file);
            });
          }}
          onRemove={() => {
            setObjectId('');
          }}
          business={publicMaterialLib}
        />
      </ProFormItem>
    </ProForm>
  );
};

export default ImageForm;
