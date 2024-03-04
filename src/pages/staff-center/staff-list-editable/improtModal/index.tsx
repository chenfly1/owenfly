import { staffBusiness } from '@/components/FileUpload/business';
import { importExlDp, importExlStaff } from '@/services/base';
import { generateGetUrl } from '@/services/file';
import { Method } from '@/utils';
import { ExclamationCircleFilled, InboxOutlined } from '@ant-design/icons';
import { Button, Modal, Row, message } from 'antd';
import { UploadFile } from 'antd/es/upload';
import Dragger from 'antd/lib/upload/Dragger';
import { useState } from 'react';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: any) => void;
  data?: any;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  onSubmit,
  data,
  readonly,
  ...rest
}) => {
  const [objectId, setObjectId] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  const uploadFile = async (options: any) => {
    const { file, onSuccess } = options;
    Method.uploadFile(file, staffBusiness).then(async (url: any) => {
      const _response = { name: file.name, status: 'done', path: url };
      setObjectId(url);
      setFileList([file]);
      onSuccess(_response, file);
    });
  };

  const downLink = async () => {
    message.loading('下载中...');
    let url = '';
    if (data?.type === 'sf') {
      url = '/staff/mng/staff/export/template';
    } else if (data?.type === 'dp') {
      url = '/staff/mng/organization/export/template';
    }
    Method.exportExcel(url, '导入模版', {}, 'GET').finally(() => {
      message.destroy();
    });
  };

  const downloadFile = async (id?: string) => {
    if (!id) {
      return;
    }
    const res = await generateGetUrl({
      bussinessId: staffBusiness.id,
      urlList: [
        {
          objectId: id,
        },
      ],
    });
    window.location.href = res.data.urlList[0].presignedUrl.url;
  };

  const onOk = async () => {
    let fn: any;
    if (data?.type === 'sf') {
      fn = importExlStaff;
    } else if (data?.type === 'dp') {
      fn = importExlDp;
    }
    const res = await fn({
      excelObjectId: objectId,
      businessId: staffBusiness.id,
    });
    if (res.code === 'SUCCESS') {
      onOpenChange(false);
      Modal.confirm({
        title: '批量导入结果',
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            {'导入成功数据'}
            <a>{res?.data?.successCount ?? 0}</a>条{'，失败数据'}
            <a style={{ color: 'red' }}>{res?.data?.failureCount ?? 0}</a>条
          </div>
        ),
        okText: '导出失败数据',
        async onOk() {
          downloadFile(res?.data?.errorFileUrl);
        },
        onCancel() {
          console.log('Cancel');
          setObjectId('');
        },
      });
    }
  };

  return (
    <Modal
      title="选择导入文件"
      open={open}
      centered
      width={600}
      onOk={onOk}
      onCancel={() => {
        onOpenChange(false);
        setFileList([]);
        setObjectId('');
      }}
    >
      <Row justify="end">
        <Button type="link" onClick={downLink}>
          下载导入模版
        </Button>
      </Row>
      <Dragger
        maxCount={1}
        customRequest={(options) => uploadFile(options)}
        onRemove={() => {
          setFileList([]);
          setObjectId('');
        }}
        fileList={fileList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
      </Dragger>
    </Modal>
  );
};

export default Add;
