import React, { useState } from 'react';
import { Button, message, Modal, Upload } from 'antd';
import type { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import type { IProps } from './data';
import ImgCrop from 'antd-img-crop';
import { generatePutUrl } from '@/services/file';
import { CloudUploadOutlined } from '@ant-design/icons';
const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
const FileUpload: React.FC<IProps> = (props: IProps) => {
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    onUploadSuccess,
    buttonText,
    fileType = 'file',
    maxCount = 1,
    business,
    cropImgProps,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [action, setAction] = useState<string>('');

  const [headers, setHeaders] = useState<Record<string, any>>();
  const [objectId, setObjectId] = useState<string>('');
  const [fileList] = useState<UploadFile[]>([]);

  const customRequest = (options: any) => {
    const { onSuccess, file } = options;
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', action, true);
    const contentType = headers && headers['Content-Type'];
    const xOssCallback = headers && headers['x-oss-callback'];
    xhr.setRequestHeader('Content-Type', contentType || 'application/json');
    xhr.setRequestHeader('x-oss-callback', xOssCallback);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status == 200) {
        onSuccess(file, objectId);
        if (onUploadSuccess) onUploadSuccess(objectId, file);
        setLoading(false);
      }
    };
    xhr.send(options.file);
  };
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };
  const uploadProps = {
    name: 'file',
    method: 'PUT',
    headers,
    customRequest: customRequest,
    beforeUpload: async (info: UploadFile) => {
      const _objectId = `${business.path}/${info.uid}/${info.name}`;
      setObjectId(_objectId);
      if (props.checkFile) {
        return props.checkFile(info);
      }
      const res = await generatePutUrl({
        bussinessId: business.id,
        urlList: [{ objectId: _objectId, contentType: info.type }],
      });
      setAction(res.data.urlList[0].presignedUrl.url);
      setHeaders({
        ...res.data.urlList[0].presignedUrl.headers,
      });
      return true;
    },

    onChange: (info: UploadChangeParam) => {
      if (info.file.status !== 'uploading') {
        setLoading(false);
      } else {
        setLoading(true);
      }
      if (info.file.status === 'done') {
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    onPreview: (file: UploadFile) => {
      handlePreview(file);
    },
    fileList,
    ...props,
  };
  const FileBtn = () => {
    return (
      <Button
        type={props.buttonType}
        style={props.buttonStyle}
        loading={loading}
        {...props.buttonProps}
      >
        {buttonText}
      </Button>
    );
  };
  const ImageBtn = () => {
    return (props.fileList?.length || 0) >= maxCount ? null : (
      <div>
        <CloudUploadOutlined style={{ fontSize: '30px' }} />
        <div style={{ marginTop: 8 }}>{buttonText}</div>
      </div>
    );
  };
  let uploadDom;
  if (fileType === 'avatar') {
    uploadDom = (
      <ImgCrop {...cropImgProps} modalTitle="编辑图片">
        <Upload {...(uploadProps as UploadProps)}>{ImageBtn()}</Upload>
      </ImgCrop>
    );
  } else if (fileType === 'image') {
    uploadDom = <Upload {...(uploadProps as UploadProps)}>{ImageBtn()}</Upload>;
  } else {
    uploadDom = (
      <Upload {...(uploadProps as UploadProps)}>
        <FileBtn />
      </Upload>
    );
  }
  return (
    <>
      {uploadDom}{' '}
      <Modal
        open={previewOpen}
        title="图片预览"
        footer={null}
        onCancel={() => {
          setPreviewOpen(false);
        }}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default FileUpload;
