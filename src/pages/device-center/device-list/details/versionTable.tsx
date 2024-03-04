import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { getRealTimeData, upgrade } from '@/services/device';
import styles from './style.less';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import storageSy from '@/utils/Setting/storageSy';
import Method from '@/utils/Method';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';

const { Dragger } = Upload;

export default (props: { data: devicesListType; deviceId: string }) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [open, setOpen] = useState<boolean>(false);
  const [version, setVersin] = useState<string>();
  const [objectId, setObjectId] = useState<string>();
  const [firmwareUrl, setFirmwareUrl] = useState<string>();
  const [firmwareSize, setFirmwareSize] = useState<number>();
  const projectInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const columns: ProColumns<{ name: string; value: string }>[] = [
    {
      title: '字段名称',
      dataIndex: 'name',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        did: {
          text: '下游系统设备ID',
        },
        ip: {
          text: 'IP地址',
        },
        firmware_version: {
          text: '固件版本',
        },
        location_number: {
          text: '设备编号',
        },
      },
    },
    {
      title: '描述',
      dataIndex: 'value',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            setVersin(record.value);
            setOpen(true);
          }}
        >
          升级
        </a>,
      ],
    },
  ];

  const customRequest = async (options: any) => {
    const { file, onSuccess } = options;
    Method.uploadFile(file, publicMaterialLib).then(async (url: any) => {
      const _response = { name: file.name, status: 'done', path: url };
      setObjectId(url);
      const urlRes = await generateGetUrl({
        bussinessId: publicMaterialLib.id,
        urlList: [
          {
            objectId: url as string,
          },
        ],
      });
      setFirmwareUrl(urlRes.data.urlList[0].presignedUrl.url);
      setFirmwareSize(file.size);
      onSuccess(_response, file);
    });
  };

  const onOk = async () => {
    if (!firmwareUrl) {
      return message.error('请先上传文件');
    }
    const msg: any = await upgrade({
      deviceId: props.deviceId,
      firmwareType: 'android',
      protocol: 2,
      projectId: projectInfo?.bid,
      businessId: 'device',
      objectId,
      firmwareUrl,
      firmwareSize,
    });
    if (msg.code === 'SUCCESS') {
      setOpen(false);
      actionRef.current?.reload();
    }
  };

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg: any = await getRealTimeData(props.deviceId);
    return {
      data: msg.data?.filter((i: any) => i.name === 'firmware_version'),
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      // total: msg.data.page.totalItems,
    };
  };

  return (
    <>
      <ProTable<{ name: string; value: string }>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={getByPage}
        rowKey="id"
        search={false}
        options={false}
        className={styles.EventLogStyle}
        pagination={false}
      />
      <Modal
        title="应用升级"
        open={open}
        width={600}
        onOk={onOk}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <h3 className={styles.deviceVersion}>{props.data.name}</h3>
        <div className={styles.version}>当前版本：{version}</div>
        <Dragger maxCount={1} customRequest={(options) => customRequest(options)}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
        </Dragger>
      </Modal>
    </>
  );
};
