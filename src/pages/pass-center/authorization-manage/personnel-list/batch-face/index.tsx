import { faceBatch } from '@/components/FileUpload/business';
import { exportExcel } from '@/pages/park-center/utils/constant';
import { faceBatchUpload } from '@/services/door';
import Method from '@/utils/Method';
import { ExclamationCircleFilled, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message } from 'antd';
import { useState } from 'react';
import ModalCom from '@/components/ModalCount';

type IProps = {
  modalVisit: boolean;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const beforeUpload = (file: any) => {
  // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
  console.log(file);
  const isFormat =
    file.type === 'application/x-zip-compressed' ||
    file.type === 'application/octet-stream' ||
    file.type === 'application/octet-stream' ||
    file.type === 'application/zip';
  // 校验图片大小
  const is5M = file.size / 1024 / 1024 < 100;

  if (!isFormat) {
    message.error('仅支持zip格式的文件');
    return Upload.LIST_IGNORE;
  } else if (!is5M) {
    message.error('文件不能超过100M,请重新选择文件');
    return Upload.LIST_IGNORE;
  } else {
    return isFormat && is5M;
  }
};

const exportClick = async (taskId: string) => {
  const params: any = {};
  params.taskId = taskId;
  params.pageNo = 1;
  params.pageSize = 100000;
  params.excel = 'export';
  const { HIDE_GETEWAY } = process.env;

  const door = HIDE_GETEWAY ? '' : '/door';
  exportExcel(`${door}/auth/door/face/upload/task/list`, '失败数据', params, 'GET');
};

const BatchFace: React.FC<IProps> = ({ modalVisit, onSubmit, onOpenChange }) => {
  const [faceUri, setFaceUri] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const resultModal = (data: {
    errCount: number;
    sucCount: number;
    resultStatus: number;
    msg: string;
    taskId: string;
  }) => {
    if (data.resultStatus === 2) {
      Method.countDownConfirm({
        title: '导出失败数据',
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            导入成功数据
            <a>{data.sucCount}</a>条，导入失败数据
            <a style={{ color: 'red' }}>{data.errCount}</a>条
          </div>
        ),
        okText: '导出失败数据',
        async onOk() {
          exportClick(data.taskId);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (data.resultStatus === 3) {
      message.error(data.msg);
    } else {
      Modal.success({
        title: '导入人脸成功',
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            成功处理数据<a>{data.sucCount}</a>条
          </div>
        ),
        onCancel() {
          console.log('Cancel');
        },
      });
    }
  };

  const ok = async () => {
    if (!faceUri) return message.error('请上传人脸压缩包');
    setLoading(true);
    const res = await faceBatchUpload({ uploadPckUrl: faceUri });
    setLoading(false);
    if (res.code === 'SUCCESS') {
      onSubmit();
      resultModal(res.data as any);
    }
  };

  return (
    <ModalCom
      title="批量导入人脸"
      width={700}
      open={modalVisit}
      onCancel={() => {
        onOpenChange(false);
      }}
      maskClosable={false}
      centered
      footer={[
        <Button
          key="back"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          取消
        </Button>,
        <Button key="confirm" loading={loading} type="primary" onClick={ok}>
          确定
        </Button>,
      ]}
    >
      <h3 style={{ fontWeight: 'bold' }}>人脸采用压缩包方式导入，具体规范如下：</h3>
      <p>压缩包命名：不限制</p>
      <p>压缩包内容：只允许包含图片信息，且不能含有任何子文件夹</p>
      <p>图片命名规则：姓名@手机号</p>
      <p>图片命名事例：黄小智@17688559999</p>
      <p>图片格式：建议jpg\png\jpeg</p>
      <p>图片大小：100Kb以内</p>
      <p>限制压缩包大小：100Mb以内</p>
      <Upload
        accept=".zip"
        maxCount={1}
        beforeUpload={beforeUpload}
        customRequest={async (options: any) => {
          const { onSuccess, file, onError } = options;
          Method.uploadFile(file, faceBatch)
            .then((url: any) => {
              console.log();
              const _response = { name: file.name, status: 'done', path: url };
              setFaceUri(url);
              onSuccess(_response, file);
            })
            .catch((err) => {
              onError();
              message.error(err);
            });
        }}
        progress={{
          strokeColor: {
            '0%': '#0D74FF',
            '100%': '#0D74FF',
          },
          strokeWidth: 3,
          format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
        }}
      >
        <Button style={{ display: 'flex' }} type="primary" icon={<UploadOutlined />}>
          选择人脸压缩包
        </Button>
      </Upload>
    </ModalCom>
  );
};

export default BatchFace;
