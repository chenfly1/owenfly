import { face } from '@/components/FileUpload/business';
import OssImage from '@/components/OssImage';
import { accessRecordDetail } from '@/services/door';
import { Button } from 'antd';
import { useEffect, useRef } from 'react';
import styles from './style.less';
import {
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
};

const Detail: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const formRef = useRef<ProFormInstance>();
  const id = data?.id;
  useEffect(() => {
    formRef?.current?.resetFields();
    if (open === true) {
      accessRecordDetail(id).then((res) => {
        formRef?.current?.setFieldsValue({
          ...res.data,
        });
      });
    }
  }, [open]);
  return (
    <DrawerForm
      labelCol={{ flex: '112px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={480}
      title="人员通行记录"
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
      <ProFormText name="userName" label="人员姓名" />
      <ProFormText name="userPhone" label="手机号" />
      <ProFormText name="accessTimeFormat" label="通行时间" />
      <ProFormSelect
        label="通行方式"
        readonly
        name="accessType"
        options={[
          {
            value: '1',
            label: 'IC卡',
          },
          {
            value: '2',
            label: '蓝牙',
          },
          {
            value: '3',
            label: '二维码',
          },
          {
            value: '4',
            label: '人脸',
          },
          {
            value: '5',
            label: '远程',
          },
          {
            value: '11',
            label: 'ID卡',
          },
        ]}
      />
      <ProFormText name="deviceName" label="设备名称" />
      <ProFormText name="deviceSpace" label="空间位置" />
      <ProFormText name="deviceId" label="设备编号" />
      <ProFormText name="icCardNum" label="IC卡号" />
      <ProFormText name="idCardNum" label="ID卡号" />
      <ProFormItem shouldUpdate>
        {(form) => {
          console.log(form);
          const faceSceneUri = form?.getFieldValue('faceSceneUri');
          return (
            <ProFormItem label="现场抓拍" labelCol={{ flex: '112px' }} name="headPortrait">
              <OssImage
                business={face.id}
                objectId={faceSceneUri}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
    </DrawerForm>
  );
};

export default Detail;
