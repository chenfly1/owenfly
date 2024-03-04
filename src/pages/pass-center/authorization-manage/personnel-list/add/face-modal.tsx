import CameraComponent from '@/components/CameraComponent';
import FileUpload from '@/components/FileUpload';
import { face } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import Method from '@/utils/Method';
import { ProFormInstance, ProFormItem } from '@ant-design/pro-components';
import { Button, Space, Upload, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './idIndex.less';
import ModalForm from '@/components/ModalFormCount';

type IProps = {
  modalVisit: boolean;
  objectId: string;
  onSubmit: (faceUri: string) => void;
  onOpenChange: (open: boolean) => void;
};

const BatchFace: React.FC<IProps> = ({ modalVisit, onSubmit, objectId, onOpenChange }) => {
  const formRef = useRef<ProFormInstance>();
  const [faceUri, setFaceUri] = useState<string>();
  const [cameraVisit, setCameraVisit] = useState<boolean>(false);

  const onOk = async () => {
    if (!faceUri) return message.error('请上传人脸');
    onOpenChange(false);
    onSubmit(faceUri);
  };

  useEffect(() => {
    setFaceUri('');
    formRef?.current?.resetFields();
  }, [objectId]);

  const getFace = async (faceUris: string) => {
    const urlRes = await generateGetUrl({
      bussinessId: face.id,
      urlList: [
        {
          objectId: faceUris,
        },
      ],
    });
    const url = urlRes?.data?.urlList[0]?.presignedUrl?.url;
    formRef?.current?.setFieldsValue({
      icon: [
        {
          name: '人脸照片',
          url,
        },
      ],
    });
  };

  const saveImage = async (files: File) => {
    const newImg = await Method.compressorImageBySize(files, 100);
    if (newImg.size / 1024 > 150) {
      message.error('照片不合格，请重新上传');
      return;
    }
    Method.uploadFile(newImg, face).then((url: any) => {
      setFaceUri(url);
      getFace(url);
    });
  };

  return (
    <ModalForm
      title="人脸信息录入"
      width={500}
      formRef={formRef}
      layout="horizontal"
      open={modalVisit}
      onFinish={onOk}
      onOpenChange={onOpenChange}
      modalProps={{
        centered: true,
        maskClosable: false,
        onCancel: () => {
          onOpenChange(false);
        },
      }}
      style={{ textAlign: 'center' }}
      submitter={{
        render: (_: any, dom: any) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormItem
        name="icon"
        valuePropName="fileList"
        extra="仅支持jpeg，jpg，png格式， 大小不超过10M"
        getValueFromEvent={(e: any) => {
          const file = e.file;
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng && file.status === 'uploading') {
            message.error('仅支持jpg，jpeg，png格式的图片');
          }
          const isLt10M = file.size && file.size / 1024 / 1024 < 10;
          if (!isLt10M && file.status === 'uploading') {
            message.error('图片不能超过10M,请重新选择图片');
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
          fileType="avatar"
          cropImgProps={{
            rotationSlider: true,
          }}
          className={styles.fileclass}
          listType="picture-card"
          beforeUpload={async (file: any) => {
            // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
            const isFormat =
              file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
            // 校验图片大小
            const is20M = file.size / 1024 / 1024 < 10;
            if (!isFormat) {
              message.error('仅支持jpg，jpeg，png格式的图片');
              return Upload.LIST_IGNORE;
            } else if (!is20M) {
              message.error('图片不能超过10M,请重新选择图片');
              return Upload.LIST_IGNORE;
            }
            return isFormat && is20M;
          }}
          customRequest={async (options: any) => {
            const { onSuccess, file } = options;
            // 压缩到100k以内
            const files = await Method.compressorImageBySize(file, 100);
            // 转换格式
            const newImg = new File([files], Method.getUuid() + '.jpg', { type: 'image/jpg' });
            // console.log(newImg);
            console.log(`压缩后`, `${newImg.size / 1024}kb`);
            if (newImg.size / 1024 > 150) {
              message.error('照片不合格，请重新上传');
              const _response = { name: newImg.name, status: 'done' };
              onSuccess(_response, newImg);
              return;
            }
            Method.uploadFile(newImg, face).then((url: any) => {
              const _response = { name: newImg.name, status: 'done', path: url };
              console.log('_response: ', _response);
              setFaceUri(url);
              onSuccess(_response, newImg);
            });
          }}
          onRemove={() => {
            setFaceUri('');
          }}
          business={face}
        />
      </ProFormItem>
      <Button onClick={() => setCameraVisit(true)}>拍照</Button>
      <CameraComponent
        modalVisit={cameraVisit}
        onOpenChange={setCameraVisit}
        saveImage={saveImage}
        width={150}
      />
    </ModalForm>
  );
};

export default BatchFace;
