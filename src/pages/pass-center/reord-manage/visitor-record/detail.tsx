import { Button, Form } from 'antd';
import { useMemo } from 'react';
import { getPassTypeString } from '@/services/visit';
import moment from 'moment';
import OssImage from '@/components/OssImage';
import { face } from '@/components/FileUpload/business';
import { ProFormText } from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerFormCount';
import styles from './style.less';

type rProps = {
  open: boolean;
  data?: any;
  onOk: () => void;
  onOpenChange: (open: boolean) => void;
};

const Detail: React.FC<rProps> = ({ open, onOk, data, onOpenChange }) => {
  const [form] = Form.useForm<visitPassItem>();
  form.resetFields();

  useMemo(() => {
    if (open) {
      form.setFieldsValue({ ...data });
      form.setFieldValue('type', getPassTypeString(Number(data.accessType)));
      form.setFieldValue('time', moment(Number(data.accessTime)).format('YYYY-MM-DD HH:mm:ss'));
    }
  }, [open]);

  return (
    <DrawerForm
      form={form}
      labelCol={{ flex: '112px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={480}
      title="访客通行记录"
      open={open}
      className={styles.formItem}
      readonly
      labelAlign="left"
      submitter={{
        render: () => {
          return [
            <Button
              key="cancel"
              disabled={false}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              返回
            </Button>,
          ];
        },
      }}
      drawerProps={{
        bodyStyle: { paddingRight: '50px' },
      }}
    >
      <h3 style={{ fontWeight: 'bold' }}>访客信息</h3>
      <ProFormText name="visitorName" label="访客姓名" />
      <ProFormText name="visitorPhoneNo" label="访客手机" />
      <ProFormText name="time" label="通行时间" />
      <ProFormText name="type" label="通行方式" />
      <ProFormText name="deviceName" label="设备名称" />
      <ProFormText name="devicePositionName" label="空间位置" />
      <ProFormText name="deviceUid" label="设备编号" />
      <ProFormText
        hidden={!form.getFieldValue('faceSceneUrl')?.length}
        label="现场抓拍照片"
        name="faceSceneUrl"
      >
        <div>
          <OssImage
            objectId={form.getFieldValue('faceSceneUrl')}
            business={face.id}
            width={80}
            height={80}
          />
        </div>
      </ProFormText>
      <h3 style={{ fontWeight: 'bold' }}>被访人信息</h3>
      <ProFormText name="ownerName" label="人员姓名" />
      <ProFormText name="ownerPhoneNo" label="人员手机" />
    </DrawerForm>
  );
};

export default Detail;
